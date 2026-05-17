# Configuration Reference

## Settings screen

Open Settings by clicking the `⚙` icon in the sidebar or navigating to it from
the command palette.

When the `pi` binary is not running, controls are rendered but inactive. All
settings changes are persisted in piui's local store and sent to the running pi
process via RPC.

---

## Thinking level

Controls how much reasoning budget pi uses before responding.

| Level | Description |
|-------|-------------|
| `off` | No extended thinking — fastest, lowest cost |
| `minimal` | Tiny reasoning budget |
| `low` | Low reasoning budget |
| `medium` | Balanced reasoning / speed trade-off |
| `high` | High reasoning budget — better for complex tasks |
| `xhigh` | Maximum reasoning budget — use for hardest problems |

**CLI flag**: `--thinking <level>`

---

## Steering mode

Controls how steering messages are delivered while pi is running.

| Mode | Behaviour |
|------|-----------|
| `all` | All queued steering messages are delivered immediately |
| `one-at-a-time` | Only one steering message is delivered per turn |

**RPC method**: `rpc.setSteeringMode(mode)`

---

## Follow-up mode

Controls how queued follow-up messages are processed after pi finishes a turn.

| Mode | Behaviour |
|------|-----------|
| `all` | All queued follow-up messages are processed in sequence |
| `one-at-a-time` | Only one follow-up message is processed per turn |

**RPC method**: `rpc.setFollowUpMode(mode)`

---

## Auto-compaction

When enabled, piui automatically summarizes older context when approaching the
model's token limit. This allows very long sessions to continue without hitting
context limits.

| Setting | Behaviour |
|---------|-----------|
| `enabled` | Older context is summarized automatically |
| `disabled` | Context grows until the model's hard limit |

**RPC method**: `rpc.setAutoCompaction(enabled)`

---

## Theme customization

Navigate to **Settings → Open Theme Customizer** to adjust the colour palette.
All colours are defined as CSS custom properties and use the warm dark terminal
aesthetic by default.

Design tokens are exported from `src/tokens.ts`:
- `T.*` — colour values (backgrounds, borders, text, semantic colours)
- `F.*` — font stacks (monospace and sans-serif)

---

## Session directory

Sessions are stored as JSONL files in:

```
~/.pi/agent/sessions/
```

Override with `--session-dir <path>` on the CLI, or configure in the Settings
screen.

---

## Keyboard shortcuts

All keyboard shortcuts are defined in `src/data/keybindings.ts`.

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
