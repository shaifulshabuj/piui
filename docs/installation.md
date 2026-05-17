# Installation

## Prerequisites

- **macOS** (Apple Silicon or Intel) or **Linux** (x86-64 or arm64)
- **Node.js** 18+ (for building from source)
- A supported AI provider account (Anthropic, OpenAI, Google, etc.)

---

## Install the pi binary

### curl (recommended)

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

### npm

```bash
npm install -g @earendil/pi
```

### pnpm

```bash
pnpm add -g @earendil/pi
```

### bun

```bash
bun add -g @earendil/pi
```

### Verify install

```bash
pi --version   # prints semver, e.g. 0.18.2
pi --help      # lists all flags
```

---

## Binary discovery paths

When piui starts it searches for the `pi` binary in this order:

| Path | Notes |
|------|-------|
| `/opt/homebrew/bin/pi` | Apple Silicon Homebrew |
| `/usr/local/bin/pi` | Intel Homebrew / manual install |
| `~/.local/bin/pi` | User-local install |
| `~/.cargo/bin/pi` | Rust/Cargo install |
| `~/bin/pi` | Custom home-bin |
| `/usr/bin/pi` | System-wide install |
| Login-shell PATH | `zsh -l` then `bash -l` fallback (needed when launched from Finder) |

If `pi` is not found at any of these locations, piui starts in **mock/browser mode**:
the UI renders fully but all RPC calls are no-ops and no sessions are created.
Install the `pi` binary and relaunch piui to connect.

---

## Install piui (Electron app)

### Download a release

Download the latest `.dmg` (macOS) or `.AppImage` (Linux) from the
[GitHub Releases](https://github.com/earendil/piui/releases) page.

- **macOS**: open the `.dmg`, drag `pi.app` to Applications, double-click to launch.
- **Linux**: `chmod +x piui-*.AppImage && ./piui-*.AppImage`

### Build from source

```bash
git clone https://github.com/earendil/piui
cd piui
npm install
npm run build:app   # produces release/ with DMG / AppImage
```

---

## First run

1. Launch piui — it searches for the `pi` binary automatically.
2. If found, piui spawns `pi --mode rpc` and shows the main chat screen.
3. If not found, piui shows the onboarding screen in mock mode.
4. Connect at least one AI provider (Anthropic, OpenAI, etc.) in the onboarding flow.
5. Open a project directory and start your first session.
