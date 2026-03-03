## Part 27 – Accessibility

- All clickable `div`/`span` elements must have `role="button"` and `tabIndex={0}` with an `onKeyDown` handler for `Enter`/`Space`.
- All form inputs must have associated `<label>` (using `htmlFor` or wrapping).
- Color is never the only indicator of meaning; pair colors with text labels or icons.
- Modal focus trap: when a modal opens, focus first interactive element inside it. Close on `Escape`.

---

