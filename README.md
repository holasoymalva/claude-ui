<div align="center">

# Claude-UI

**A streaming-first Generative UI workspace and open markup specification.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Zero dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)](#getting-started)
[![GUIM v1.0](https://img.shields.io/badge/spec-GUIM_v1.0-d97706)](#guim-specification)

[Quick Start](#getting-started) · [GUIM Spec](#guim-specification) · [Examples](./examples/) · [Design System](#design-system)

</div>

---

Claude-UI is a zero-dependency, browser-native workspace for Generative UI. It implements **GUIM** (Generative UI Markup) — a compact, streaming-first component language that lets language models output rich, interactive UI directly inside chat interfaces, using significantly fewer tokens than equivalent JSON-based approaches.

The visual design is a reference implementation inspired by [Claude.ai](https://claude.ai). Claude-UI is an independent open-source project and is not affiliated with or endorsed by Anthropic.

---

## How it works

Your component library defines what the model can generate.

```
System Prompt  ──►  LLM  ──►  GUIM Stream  ──►  Parser  ──►  Live UI
 (GUIM schema)                (token by token)   (incremental)
```

1. Register a component schema (JSON or freeform description).
2. Export that schema as a structured system prompt guideline.
3. The model outputs GUIM tokens as it streams.
4. The parser compiles each token incrementally — no waiting for the full response.
5. Components render live in the browser as output arrives.

---

## Getting Started

Claude-UI has no build step and no runtime dependencies. Clone and serve:

```bash
git clone https://github.com/holasoymalva/claude-ui.git
cd claude-ui
npx serve .
```

Then open `http://localhost:3000` in your browser.

Alternatively:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

To explore individual rendered components without the full workspace:

```bash
open examples/dashboard.html
```

---

## GUIM Specification

GUIM (Generative UI Markup) is a BBCode-inspired syntax designed to be easy for language models to emit and easy for browsers to parse incrementally.

### Why not JSON?

| Format | Tokens (dashboard scenario) | Streaming-safe | Human-readable |
|:---|---:|:---:|:---:|
| Vercel JSON-Render | ~2,247 | ✗ | ✗ |
| JSON (raw schema) | ~2,261 | ✗ | ✗ |
| **GUIM v1.0** | **~1,226** | **✓** | **✓** |

JSON requires the full document to be emitted before it can be parsed. GUIM tokens can be compiled as soon as the opening tag is closed, which means the first component renders while the model is still generating the rest.

### Component reference

| Tag | Required | Optional | Self-closing |
|:---|:---|:---|:---:|
| `[card]` | — | `title`, `width="full"` | ✗ |
| `[grid]` | — | `columns` (default: 2) | ✗ |
| `[metric]` | `label`, `value` | `trend` (+X% · up · down) | ✓ |
| `[chart]` | `type` (bar · pie), `data` (0–100) | `label` | ✓ |
| `[table]` | `headers`, `rows` | — | ✓ |
| `[tasktracker]` | `tasks` (comma-separated) | — | ✓ |
| `[list]` + `[listitem]` | `listitem: text` | — | ✗ / ✓ |
| `[button]` | `label` | `variant` (primary · secondary) | ✓ |
| `[weather]` | `city`, `temp` | `condition` | ✓ |

### Example document

```
[card title="Infrastructure Overview"]
  [grid columns="3"]
    [metric label="CPU Load"  value="38%"    trend="down"   /]
    [metric label="Memory"    value="14.2 GB" trend="up"     /]
    [metric label="Latency"   value="9 ms"   trend="down"   /]
  [/grid]
  [chart type="bar" data="38" label="CPU Utilisation" /]
  [table
    headers="Service, Region, Status, Latency"
    rows="API Gateway,us-east-1,Healthy,8ms;Auth Service,eu-west-1,Healthy,12ms"
  /]
[/card]
```

### Registering a custom component

Open the **Connectors & Settings → Schemas Registry** tab in the workspace and submit a name, description, and JSON schema. The workspace exports the registered schema as a system prompt fragment you can paste into any LLM integration.

---

## Project Structure

```
claude-ui/
├── index.html        # Workspace shell: chat view, artifact gallery, settings
├── styles.css        # Design tokens, layout system, component styles
├── parser.js         # Stream-safe GUIM tokenizer and incremental compiler
├── app.js            # View routing, mock LLM stream, schema registry state
└── examples/
    └── dashboard.html  # Standalone component showcase (no workspace required)
```

### Core modules

**`parser.js`** — The streaming tokenizer. Accepts a partial or complete GUIM string and returns a DOM subtree. Safe to call on every new token without re-parsing previous output.

**`app.js`** — Application controller. Handles view routing, the mock streaming pipeline, artifact persistence (localStorage), and the connector/schema registry.

**`styles.css`** — Design token layer built on CSS custom properties. All colors, spacing, typography, and animation values are defined as variables so the entire design system can be overridden from a single block.

---

## Design System

Claude-UI is a reference implementation of a chat UI inspired by Claude.ai and Claude Code. The intent is to demonstrate what a high-fidelity Generative UI workspace looks like when the visual design is taken seriously.

| Token | Value | Usage |
|:---|:---|:---|
| `--bg-primary` | `#1c1917` | Base canvas (warm dark, stone-950) |
| `--bg-secondary` | `#242120` | Sidebar, panel backgrounds |
| `--bg-tertiary` | `#2e2b29` | Card and input backgrounds |
| `--accent-color` | `#d97706` | Amber-600 — primary action color |
| `--font-sans` | `Inter` | Body and UI text |
| `--font-mono` | `JetBrains Mono` | Code, markup, schema views |

**Chat surface:** User messages render as right-aligned pills. Assistant messages appear as clean flowing text anchored by the Claude logomark — no border box, no background fill.

**Artifact cards** use a dog-ear clip-path on the top-right corner, referencing the document metaphor used in Claude.ai artifacts.

---

## Examples

The `examples/` directory contains self-contained HTML files that require no build step.

| Example | Description |
|:---|:---|
| [`examples/dashboard.html`](./examples/dashboard.html) | Full component showcase — all GUIM elements with live renders and markup reference |

More examples (React integration, Claude API streaming, Next.js) are planned. See [open issues](https://github.com/holasoymalva/claude-ui/issues) or open a PR.

---

## Roadmap

- [ ] `parser.js` published as a standalone ES module (zero-dep, tree-shakeable)
- [ ] React bindings (`useGUIMStream` hook + `<GUIMRenderer />` component)
- [ ] Live Claude API integration example
- [ ] Next.js streaming example with Server-Sent Events
- [ ] CLI for generating system prompt from registered schema

---

## Contributing

Contributions are welcome — bug fixes, new GUIM components, framework integrations, or design improvements.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-change`
3. Make your changes and open a pull request

For larger changes, open an issue first to discuss scope.

---

## License

MIT — see [`LICENSE`](./LICENSE) for details.
