"""Security regression tests: fail on the original vulnerable service, pass after fixes.

These tests focus on authorization, injection, escaping, and assistant tool constraints.
"""

import json
import unittest

from service import Shop


class SecurityTest(unittest.TestCase):
    def setUp(self):
        self.shop = Shop()
        self.addCleanup(self.shop.close)

    def request(self, method, path, body=None, headers=None):
        with self.shop.lock:
            return self.shop.dispatch(method, path, body or {}, headers or {})

    def login(self, username="alice", password="learn-alice"):
        status, result = self.request("POST", "/login", {"username": username, "password": password})
        self.assertEqual(status, 200)
        return {"X-Token": result["token"]}

    def test_profile_sql_injection_blocked_and_scoped(self):
        auth = self.login("alice", "learn-alice")
        status, rows = self.request("GET", "/profile?id=1 OR 1=1", headers=auth)
        self.assertEqual(status, 200)
        # Only own profile should be returned
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["name"], "TEST_ALICE")

    def test_files_idor_blocked(self):
        auth = self.login("alice", "learn-alice")
        status, content = self.request("GET", "/files?user=bob&path=receipt.txt", headers=auth)
        self.assertEqual(status, 200)
        self.assertNotIn("TEST_BOB", content["content"])  # alice must not see bob's receipt

    def test_order_price_tampering_rejected(self):
        auth = self.login("alice", "learn-alice")
        status, order = self.request("POST", "/orders", {"product": "lamp", "price": 1}, headers=auth)
        self.assertEqual(status, 201)
        self.assertEqual(order["price"], 1500)

    def test_reviews_escaped_in_html(self):
        auth = self.login()
        self.assertEqual(self.request("POST", "/reviews", {"product": "chair", "text": "<script>x</script>"}, auth)[0], 201)
        status, html = self.request("GET", "/reviews/view", headers=auth)
        self.assertEqual(status, 200)
        self.assertNotIn("<script>", html)
        self.assertIn("&lt;script&gt;x&lt;/script&gt;", html)

    def test_logs_redact_token(self):
        alice = self.login("alice", "learn-alice")
        # Produce one request to ensure logs carry a tokened call
        self.request("GET", "/profile?id=1", headers=alice)
        staff = self.login("staff", "learn-staff")
        status, logs = self.request("GET", "/debug/logs", headers=staff)
        self.assertEqual(status, 200)
        # Token should not appear in serialized logs
        token = alice["X-Token"]
        serialized = json.dumps(logs, ensure_ascii=False)
        self.assertNotIn(token, serialized)

    def test_assistant_tools_are_restricted(self):
        alice = self.login("alice", "learn-alice")
        # Alice cannot read bob's file via executor
        status, result = self.request("POST", "/assistant/execute", {
            "decision": {"tool": "read_file", "arguments": {"path": "files/bob/receipt.txt"}}
        }, alice)
        self.assertEqual(status, 403)

        # Export is staff-only
        status, _ = self.request("POST", "/assistant/execute", {"decision": {"tool": "export_profiles"}}, alice)
        self.assertEqual(status, 403)

        # Delete is staff-only
        status, _ = self.request("POST", "/assistant/execute", {
            "decision": {"tool": "delete_tree", "arguments": {"path": "files/alice"}}
        }, alice)
        self.assertEqual(status, 403)

        # Staff can delete under files/, but not private
        staff = self.login("staff", "learn-staff")
        status, _ = self.request("POST", "/assistant/execute", {
            "decision": {"tool": "delete_tree", "arguments": {"path": "files/alice"}}
        }, staff)
        self.assertEqual(status, 200)
        status, _ = self.request("POST", "/assistant/execute", {
            "decision": {"tool": "delete_tree", "arguments": {"path": "private"}}
        }, staff)
        self.assertEqual(status, 403)

    def test_orders_scoped_to_owner(self):
        alice = self.login("alice", "learn-alice")
        status, orders = self.request("GET", "/orders", headers=alice)
        self.assertEqual(status, 200)
        self.assertTrue(all(o["owner"] == 1 for o in orders))
        staff = self.login("staff", "learn-staff")
        status, orders = self.request("GET", "/orders", headers=staff)
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(orders), 2)

    def test_search_requires_staff(self):
        alice = self.login("alice", "learn-alice")
        self.assertEqual(self.request("GET", "/search?q=ALICE", headers=alice)[0], 403)
        staff = self.login("staff", "learn-staff")
        status, results = self.request("GET", "/search?q=TEST_", headers=staff)
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(results), 1)

    def test_assistant_context_respects_order_scope(self):
        alice = self.login("alice", "learn-alice")
        self.assertEqual(self.request("GET", "/assistant/context?order_id=2", headers=alice)[0], 403)


if __name__ == "__main__":
    unittest.main()
