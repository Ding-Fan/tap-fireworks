# Learnings

- QA timing: after navigation, waiting ~1000ms before the first tap made burst capture reliable.
- Screenshot timing: ~700ms after tap consistently captured visible spread; 500ms could miss visible burst state.
- Playwright interaction: `locator.click()` on `.fireworks-container` was intercepted by `html`; `page.mouse.click(x, y)` was reliable for tap simulation.
- Runtime logs: no Playwright-captured console `error` or `pageerror` events during single-tap, rapid-tap, or edge-tap scenarios (only CSS warnings about `slider-vertical`).
