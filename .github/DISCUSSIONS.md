# 👋 Welcome to DSL Monitor Discussions

## About this project

**DSL Monitor is primarily a personal tool** built for my own FritzBox setup to track DSL line quality after a DLM reset. It was **vibe-coded in a couple of afternoons** together with Claude Code, shipped to my NAS, and is actively used in my own home network.

This means: **the code definitely has bugs**, rough edges, and questionable design decisions. It works for me — your mileage may vary.

## What you can expect

- ✅ The tool works for its main purpose: monitoring DSL parameters from a FritzBox via TR-064
- ✅ Issues that are **showstoppers** (app crashes, data loss, cannot start) — discuss here, I will likely look into them
- ✅ **Security issues** — please report, these will get priority
- ⚠️ Small visual glitches, theme tweaks, code quality concerns — feedback welcome, but **no guarantees** it gets implemented
- ⚠️ Feature requests — cool, but implementation depends entirely on whether I personally need it
- ❌ This is **not** a commercial product with support SLAs or a roadmap

## How to engage

- 🐛 **Found a real bug that blocks usage?** Open a discussion in the "Bug Reports" category
- 💡 **Have an idea?** Share it in "Ideas" — happy to hear it, no promises on implementation
- ❓ **Got a question?** Post in "Q&A"
- 🔐 **Security issue?** Use GitHub's private security advisory feature instead of public discussion

## The philosophy

I'd rather ship something imperfect that solves a real problem than perfect nothing. This tool exists because I wanted to track my own DSL line quality and didn't find anything minimal enough. If you find it useful — great! If you find bugs — also great, let me know. Just don't expect enterprise support.

## Tech stack (if you want to contribute)

- Python 3.12 + FastAPI backend
- Vanilla JS + Tailwind CSS + Chart.js frontend (no build step)
- JSON file storage
- Docker/Podman deployment

See [docs/README_en.md](../docs/README_en.md) for full documentation.

---

**TL;DR:** Personal tool, vibe-coded, bugs included. Showstoppers and security issues get priority. Everything else is nice-to-have. Welcome!
