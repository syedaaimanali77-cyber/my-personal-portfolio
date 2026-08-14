# Syeda Aiman Raza — Portfolio (Next.js)

Port of the single-page HTML build to the Next.js App Router. The design is
unchanged; only the delivery mechanism differs.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Build and serve production:

```bash
npm run build
npm start
```

## Layout

```
app/
  layout.js      root layout — fonts, metadata, pre-paint theme script
  page.js        the whole page as one client component
  globals.css    all styles, unchanged apart from font + image references
public/
  aiman-portrait.jpg   round hero portrait
  aiman-mun.jpg        INTRAMUN '25 award photo
```

## What changed in the port, and why

**Images left the stylesheet.** They were base64 data URIs inside the CSS; they
now live in `public/` and the `--p1` / `--p2` custom properties point at
`/aiman-portrait.jpg` and `/aiman-mun.jpg`. Same rendering, but the browser can
cache them separately instead of re-parsing 300 KB of CSS on every load.

**Fonts come from `next/font/google`.** No render-blocking `<link>` to Google,
and no layout shift. The families are injected as `--font-disp`, `--font-body`
and `--font-mono`, which the existing `--disp` / `--body` / `--mono` tokens
consume — so the stylesheet's font rules are untouched.

**Markup that used to be built by JavaScript is now JSX.** In the HTML version
the hero name's per-character spans, the ticker's second copy, the language
meter segments and the SVG curve paths were all appended to the DOM on load.
Under React's StrictMode, effects run twice in development, which would have
duplicated every one of them. They are rendered declaratively instead, and the
animation effect only updates the `d` attribute on paths React already owns.

**The theme starts before paint.** A tiny inline script in `layout.js` sets
`data-theme` from `localStorage` (falling back to the system preference) ahead
of hydration, so someone on dark mode doesn't get a white flash. React then
manages it as normal state. `suppressHydrationWarning` on `<html>` is there
because that attribute legitimately differs between server and client.

**The contact form is controlled React state** with validation in the submit
handler, rather than reading values off the DOM. It still composes a `mailto:`
link and stores nothing.

**Every listener and observer is cleaned up** on unmount — scroll, pointer,
IntersectionObserver, `requestAnimationFrame` and `visibilitychange`.

## Notes

`page.js` is a client component (`"use client"`) because the page is driven by
pointer parallax, scroll observers and theme state. If you later want the text
content server-rendered for SEO, split the static sections into server
components and keep only the interactive shells on the client — the metadata in
`layout.js` already covers the crawler basics.
