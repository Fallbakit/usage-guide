# Fallbakit — Usage Guide

The complete setup and usage guide for [Fallbakit](https://fallbakit.com) — local-first
AI inference (Ollama, oMLX, vLLM) with automatic cloud fallback behind one
OpenAI-compatible endpoint. Plain HTML/CSS/JS, no build step, themed to match the
[pitch deck](https://pitch.fallbakit.com) and web app.

**Live:** https://usage-guide.fallbakit.com

## What's inside

A single scrollable page covering the whole product surface, end to end:

- How it works · prerequisites · a 5-minute quickstart
- Dashboard setup and the three key types (`or_` app, `rr_` runner, `cli_` CLI)
- The `fallbakit` CLI — every subcommand and flag
- The `fallbakit-agent` tunnel agent — install, run, full env/YAML reference, health endpoints
- Cloud fallback (BYOK) setup
- Calling the API — Fallbakit SDK (Python/Node), the OpenAI SDK, and curl; streaming, timeouts, errors
- Routing & fallback controls (per-request)
- Monitoring usage · deploying the agent (Docker / Compose / systemd / Kubernetes)
- Standalone edition · troubleshooting · a quick reference (endpoints, env vars, ports)

## Run locally

It's static — open `index.html`, or serve it:

```sh
python3 -m http.server 8080   # then open http://localhost:8080
```

## Files

| File | What |
|------|------|
| `index.html` | All content — one `<section>` per topic, tabbed code blocks, tables, diagrams. |
| `styles.css` | Theme tokens (top `:root`), layout, components, responsive, print. |
| `app.js` | Copy buttons, code tabs, sidebar scroll-spy, mobile drawer, reveal-on-scroll. |
| `assets/` | Logo + favicon (from the Fallbakit brand kit). |
| `_headers`, `robots.txt`, `sitemap.xml` | Cloudflare Pages headers and SEO (public, indexable). |

Content is sourced from the product repos: [`cli`](https://github.com/Fallbakit/cli),
[`tunnel`](https://github.com/Fallbakit/tunnel), [`sdk`](https://github.com/Fallbakit/sdk),
and the platform docs. All commands use the hosted defaults
(`fallbakit.com` / `api.fallbakit.com`).

## Deploy

Cloudflare Pages, static — **build command: none, output dir: `/`**.

```sh
wrangler pages deploy . --project-name fallbakit-usage-guide
```

Custom domain `usage-guide.fallbakit.com` is attached to the Pages project in the
Cloudflare dashboard; Cloudflare auto-provisions the TLS certificate.
