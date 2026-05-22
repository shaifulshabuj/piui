# Usage Guide

## Starting your first session

1. Launch piui. The sidebar shows your recent sessions grouped by Today / Yesterday / Last week.
2. Click **New session** (or press `⌘N`) to open a fresh chat.
3. Type a message in the composer and press `Ctrl+Enter` to send.
4. Pi will respond in the chat area; tool calls appear as expandable blocks.

---

## Using tools

Pi supports multiple tool categories. Pass `--tools` when running from the CLI,
or configure them in piui's tool settings:

| Flag | Tools enabled |
|------|--------------|
| `--tools read` | File reading |
| `--tools write` | File creation and editing |
| `--tools bash` | Shell command execution |
| `--tools find` | Directory traversal |
| `--tools grep` | Pattern search |
| `--no-tools` | Disable all tools (text-only response) |

Multiple tools can be combined: `--tools read,write,bash`

---

## Switching models

- **Ctrl+L** — open the model picker overlay.
- **Ctrl+P** — cycle through your favourite models.
- In the model picker, models are grouped by provider with context size and pricing.

---

## Session management

### Groups

Sessions are automatically grouped in the sidebar:
- **Today** — sessions created today
- **Yesterday** — sessions created yesterday
- **Last week** — sessions from the past 7 days

### Renaming

Double-click a session title in the sidebar to rename it inline. Press `Enter` to
save or `Escape` to cancel.

### Deleting

Hover over a session and click the `×` button that appears on the right. A
confirmation dialog will appear.

---

## Steering pi mid-run

While pi is running you can send **steering messages** without interrupting the
current task. Configure how they are delivered in Settings:

- **all** — all queued steering messages are delivered immediately.
- **one-at-a-time** — only one steering message is delivered per turn.

Press `Ctrl+C` to abort the current run (sends `SIGINT`).

---

## Context files

Context files are injected into pi's system prompt for every message. Use them to
store project conventions, style guides, or background information.

- Open via **Settings → Context Editor** or the sidebar `◉` icon.
- Press `Ctrl+S` to save a context file from the editor.

---

## Exporting sessions

```bash
pi --export output.html --session ~/.pi/agent/sessions/<session-id>.jsonl
```

This generates a self-contained HTML file with the full session transcript.

---

## CLI usage patterns

### Basic flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--print` | `-p` | Non-interactive (print-and-exit) mode |
| `--no-session` | | Do not write a session file |
| `--no-tools` | | Disable all tools |
| `--model <name>` | | Select the model for this run |

### Tool selection

```bash
pi -p --tools read,write "refactor src/api.ts"
pi -p --tools bash "run the test suite and summarize failures"
```

### Session management

| Flag | Description |
|------|-------------|
| `--session-dir <path>` | Custom directory for session files |
| `--session <file>` | Resume a specific session |
| `--fork <file>` | Start a new session branched from an existing one |

### System prompt customization

| Flag | Description |
|------|-------------|
| `--system-prompt <text>` | Replace the default system prompt |
| `--append-system-prompt <text>` | Append to the default system prompt |

### Output mode

| Flag | Output format |
|------|--------------|
| `--mode text` | Plain text (default) |
| `--mode json` | JSONL — one JSON object per line |

### Thinking level

| Flag | Description |
|------|-------------|
| `--thinking off` | No extended thinking |
| `--thinking minimal` | Minimal reasoning budget |
| `--thinking low` | Low reasoning budget |
| `--thinking medium` | Medium reasoning budget |
| `--thinking high` | High reasoning budget |
| `--thinking xhigh` | Maximum reasoning budget |

### File attachments

Prefix a file path with `@` to inline its content into the prompt:

```bash
pi -p --no-tools @src/utils.ts "what does this export?"
```

### Export

```bash
pi --export output.html --session ~/.pi/agent/sessions/<id>.jsonl
```

---

## Keyboard shortcuts

| Keys | Action |
|------|--------|
| `Ctrl+/` | Command palette |
| `Ctrl+L` | Switch model |
| `Ctrl+P` | Cycle favorite models |
| `Ctrl+C` | Abort current run |
| `Ctrl+Enter` | Send message |
| `Shift+Enter` | New line in composer |
| `Escape` | Close overlay / cancel |
| `Ctrl+S` | Save context file |
| `↑↓` | Navigate session tree |
