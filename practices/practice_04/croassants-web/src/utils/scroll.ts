// Smooth anchor scrolling with distance-based easing and header offset.
export function smoothScrollTo(target: Element, options?: { offset?: number }) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const header = document.querySelector('header') as HTMLElement | null
  const headerOffset = options?.offset ?? (header ? header.offsetHeight : 0)

  const start = window.scrollY
  const rect = target.getBoundingClientRect()
  const end = start + rect.top - headerOffset
  const distance = Math.max(0, end - start)

  if (prefersReduced) {
    window.scrollTo({ top: end })
    return
  }

  // Duration scales with distance; clamp between 300ms and 900ms
  const duration = Math.min(900, Math.max(300, distance * 0.6))
  const startTime = performance.now()

  // Ease-out cubic
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  function frame(now: number) {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / duration)
    const eased = easeOutCubic(t)
    const current = start + (end - start) * eased
    window.scrollTo(0, current)
    if (t < 1) requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}

// Attach smooth scrolling to in-page anchors
export function attachSmoothAnchors(root?: Document | HTMLElement) {
  const container = root ?? document
  const anchors = Array.from(container.querySelectorAll('a[href^="#"]')) as HTMLAnchorElement[]

  function onClick(e: Event) {
    const a = e.currentTarget as HTMLAnchorElement
    const id = a.getAttribute('href')?.substring(1)
    if (!id) return
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    smoothScrollTo(target)
  }

  anchors.forEach((a) => a.addEventListener('click', onClick))
  return () => anchors.forEach((a) => a.removeEventListener('click', onClick))
}
