from mcp.server.fastmcp import FastMCP

mcp = FastMCP("simple-server")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Сложить два числа."""
    return a + b

if __name__ == "__main__":
    mcp.run()
