# piui — Desktop UI for the pi coding agent

![platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-lightgrey)
![version](https://img.shields.io/badge/version-0.1.0-blue)
![license](https://img.shields.io/badge/license-MIT-green)

## What is piui?

piui is an Electron desktop application that wraps the `pi` coding-agent CLI with a
terminal-rooted, keyboard-first UI. It connects to the `pi` binary over an RPC
transport (JSON over stdin/stdout) and renders sessions, tools, models, and settings
in a unified dark interface.

## Quick start (5 minutes)

```bash
# 1. Install the pi binary
curl -fsSL https://pi.dev/install.sh | sh

# 2. Verify
pi --version

# 3. Clone and run piui
git clone https://github.com/earendil/piui && cd piui
npm install
npm run dev
```

Full installation guide: [docs/installation.md](docs/installation.md)

## Four ways to run pi

| Mode        | Command                            | Use case              |
|-------------|------------------------------------|-----------------------|
| interactive | `pi`                               | Full TUI experience   |
| print/JSON  | `pi -p "summarize CHANGELOG.md"`   | One-shot for scripts  |
| RPC         | `pi --mode rpc`                    | JSON over stdin/stdout (used by piui) |
| SDK         | `import { Pi } from '@earendil/pi'`| Embed in your app     |

## Architecture overview

```
piui (Electron renderer — React)
  └─ IPC (contextBridge)
       └─ piProcess.ts (main process)
            └─ pi --mode rpc  (child process, stdio JSONL)
```

The main process manages the `pi` child process lifecycle, reads JSONL events from
stdout, and forwards them to the renderer via `pi:event`. Commands flow in reverse
over stdin. See [docs/pi-cli-integration.md](docs/pi-cli-integration.md).

## Documentation

| Guide | Description |
|-------|-------------|
| [docs/installation.md](docs/installation.md) | Install pi binary and piui app |
| [docs/pi-cli-integration.md](docs/pi-cli-integration.md) | RPC transport, JSONL protocol, IPC channels |
| [docs/usage-guide.md](docs/usage-guide.md) | Sessions, tools, models, keyboard shortcuts |
| [docs/configuration.md](docs/configuration.md) | Settings reference (thinking, steering, themes) |

## Contributing

```bash
npm run dev       # start dev server (renderer only)
npm run lint      # ESLint
npm test          # Playwright tests
npm run build     # production build
```

## License

MIT © Earendil Works
