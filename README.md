# Claude-UI: Open Standard for Generative UI

Claude-UI is an open-source standard and rendering framework for **Generative UI**. It provides a lightweight, streaming-friendly component specification designed to render interactive cards, forms, graphs, and metrics directly inside chat applications. 

Featuring a highly polished, developer-centric dark design style, Claude-UI serves as a token-efficient interface between AI agents and users.

---

## Key Features

1. **Generative UI Markup (GUIM)**:
   - A BBCode-inspired specification for UI elements.
   - Extremely token-efficient: uses up to **67% fewer tokens** than traditional JSON-based specifications.
   - Streaming-first parser allows elements to be compiled and updated incrementally in real time as tokens arrive.

2. **Component Schema Registry**:
   - Developers can define JSON or Zod schemas for custom UI components.
   - Registered schemas can be exported as structured system prompt guidelines, instructing LLMs exactly how to output valid UI structures.

3. **Contextual Connectors**:
   - Integrates with external tools (GitHub, Gmail, Calendar, Drive).
   - Linking connectors automatically supplies contextual schemas and variables into the model's rendering registry.

4. **Inspector Workspace**:
   - Slide-out details drawer showing the live canvas render.
   - Instantly view equivalent compiled code in **React**, raw **GUIM**, or clean semantic **HTML/CSS**.

---

## Generative UI Markup (GUIM) Specification

GUIM is designed to be easily read by humans, outputted by LLMs, and compiled by the browser. 

### Supported Elements

| Element | Attributes | Example |
| :--- | :--- | :--- |
| **Card** | `title`, `width` | `[card title="Sales summary"]...[/card]` |
| **Metric** | `label`, `value`, `trend` | `[metric label="Conversion" value="3.4%" trend="+0.2%" /]` |
| **Chart** | `type="bar\|pie"`, `data`, `label` | `[chart type="bar" data="70" label="Capacity Used" /]` |
| **Grid** | `columns` | `[grid columns="2"]...[/grid]` |
| **Button** | `label`, `variant="primary\|secondary"` | `[button label="Apply Changes" variant="primary" /]` |
| **List** | *None* | `[list] [listitem text="First" /] [/list]` |
| **Table** | `headers`, `rows` (comma/semi-colon separated) | `[table headers="Month,Sales" rows="Jan,$10K;Feb,$12K" /]` |
| **TaskTracker**| `tasks` (comma separated) | `[tasktracker tasks="Audit schema, Deploy server" /]` |
| **Weather** | `city`, `temp`, `condition` | `[weather city="Tokyo" temp="26" condition="Clear" /]` |

### Sample GUIM Document

```bbcode
[card title="Live Infrastructure Dashboard"]
  [grid columns="3"]
    [metric label="CPU Core Load" value="42%" trend="up" /]
    [metric label="Memory Free" value="12.4 GB" /]
    [metric label="Response Latency" value="12ms" trend="down" /]
  [/grid]
  [chart type="bar" data="42" label="Overall Capacity" /]
[/card]
```

---

## Project Structure

```
├── index.html       # The workspace window, welcoming dashboard, and inspector sheets
├── styles.css       # Core dark design system, scrollbars, layouts, and animations
├── parser.js        # The stream-safe GUIM tokenizer and compiler
└── app.js           # Main routing, mock LLM stream generator, and registry state
```

---

## Getting Started

### Local Development Server
To serve the interface locally with static hosting, run:
```bash
npx http-server ./
# or
python -m http.server 8080
```
Then navigate to `http://localhost:8080` in your web browser.

---

## Design Systems & Aesthetic Choices
- **Theme**: Premium deep charcoal backgrounds (`#141414` / `#1a1a1a`), with soft borders (`#2b2b2b`).
- **Typography**: Uses modern sans-serif `Outfit` for readability, paired with `JetBrains Mono` for developer code inspection.
- **Accents**: Warm peach/orange (`#e06c35`) highlighting generative states, action nodes, and live indicators.
- **Cards**: Unique document folded corner (dog-ear) shape matching clean technical styling.