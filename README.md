# Claude Code — Open Source AI Coding Agent

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.1.88-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Built%20with-Bun-orange" alt="Built with Bun">
</p>

> **Claude Code** is an open-source AI coding agent rebuilt from the leaked Anthropic source code. It provides a powerful CLI for software engineering tasks with support for free LLM providers and built-in bug hunting capabilities.

---

## ✨ Features

### Core Features
- **Interactive REPL** — Terminal-based AI coding assistant
- **40+ Built-in Tools** — Bash, Edit, Read, Write, Grep, Glob, Agent, and more
- **MCP Server Support** — Connect to Model Context Protocol servers
- **Vim Mode** — Full vim keybindings
- **Plugin System** — Extend functionality with plugins
- **Hook System** — Execute commands on events
- **Skill System** — Reusable prompt templates

### 🎯 Bug Hunter Skill (`/bughunt`)
Comprehensive security testing skill with **43 vulnerability types**:

| Category | Vulnerabilities |
|----------|-----------------|
| **Injection** | SQL Injection, NoSQL Injection, Command Injection, XXE, SSTI |
| **Web** | XSS, CSRF, CORS, Clickjacking, Web Cache Poisoning, Web Cache Deception |
| **Authentication** | OAuth, JWT, Session Management, Authentication Bypass |
| **Authorization** | IDOR, Broken Function Level Authorization, Mass Assignment |
| **Server** | SSRF, RCE, Path Traversal, Insecure Deserialization |
| **API** | GraphQL, REST API, HTTP Request Smuggling, Host Header Attacks |
| **JavaScript** | Prototype Pollution, DOM-Based Vulnerabilities |
| **Business Logic** | Race Conditions, Business Logic Flaws |
| **Info Disclosure** | Information Disclosure, Subdomain Takeover |

### 🌍 Free Provider Support
Use free LLM providers instead of Anthropic's paid API:

| Provider | Rate Limit | API Key Required |
|----------|------------|------------------|
| **NVIDIA NIM** | 40 req/min | Yes (free) |
| **OpenRouter** | Varies | Yes (free tier) |
| **LM Studio** | Unlimited | No (local) |
| **llama.cpp** | Unlimited | No (local) |

---

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) v1.1+

### Installation

```bash
# Clone the repository
git clone https://github.com/fazxes/claude-code.git
cd claude-code

# Install dependencies
bun install

# Build the CLI
bun run build

# Run Claude Code
bun dist/cli.js
```

### First Run

```bash
# Set your API key (optional - needed for Anthropic API)
export ANTHROPIC_API_KEY="sk-ant-api03-your-key"

# Or use free providers (recommended)
export USE_FREE_PROVIDER=true
export NVIDIA_NIM_API_KEY="nvapi-your-key"

# Launch the CLI
bun dist/cli.js
```

---

## 🔧 Configuration

### Environment Variables

#### Free Provider Configuration

Create a `.env` file (copy from `.env.example`):

```bash
# Enable free provider mode
USE_FREE_PROVIDER=true

# NVIDIA NIM (recommended - 40 req/min free)
NVIDIA_NIM_API_KEY="nvapi-your-key"
MODEL_OPUS="nvidia_nim/z-ai/glm4.7"
MODEL_SONNET="nvidia_nim/moonshotai/kimi-k2-thinking"
MODEL_HAIKU="nvidia_nim/stepfun-ai/step-3.5-flash"

# OR OpenRouter (free tier)
OPENROUTER_API_KEY="sk-or-your-key"
MODEL_OPUS="open_router/deepseek/deepseek-r1-0528:free"
MODEL_SONNET="open_router/openai/gpt-oss-120b:free"
MODEL_HAIKU="open_router/stepfun/step-3.5-flash:free"

# OR LM Studio (local)
LM_STUDIO_BASE_URL="http://localhost:1234/v1"
MODEL_OPUS="lmstudio/unsloth/MiniMax-M2.5-GGUF"

# OR llama.cpp (local)
LLAMACPP_BASE_URL="http://localhost:8080/v1"
MODEL_OPUS="llamacpp/local-model"
```

#### Other Options

```bash
# Disable all telemetry
DISABLE_TELEMETRY=1

# Disable non-essential traffic
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1

# Use specific model
bun dist/cli.js --model sonnet "your prompt"

# Non-interactive mode
echo "hello" | bun dist/cli.js
```

---

## 📖 Commands

### Basic Usage

```bash
bun dist/cli.js                    # Launch interactive REPL
bun dist/cli.js --help             # Show all options
bun dist/cli.js --version          # Show version
bun dist/cli.js -p "your prompt"  # Non-interactive mode
```

### Slash Commands

| Command | Description |
|---------|-------------|
| `/help` | Show help |
| `/clear` | Clear the screen |
| `/model` | Switch models (Opus/Sonnet/Haiku) |
| `/compact` | Compact context |
| `/resume` | Resume previous session |
| `/bughunt` | Bug hunting assistant |
| `/verify` | Verify code against spec |
| `/debug` | Debug code issues |
| `/batch` | Batch operations |

---

## 🛠️ Architecture

```
src/
├── main.tsx                 # Entry point (Commander.js parser)
├── entrypoints/             # CLI entry points
├── commands/                # Slash command implementations
├── tools/                   # Agent tool implementations
│   ├── BashTool/            # Shell execution
│   ├── FileEditTool/        # File editing
│   ├── FileReadTool/        # File reading
│   ├── FileWriteTool/       # File writing
│   ├── GrepTool/            # Content search
│   ├── GlobTool/            # File search
│   └── AgentTool/            # Subagent spawning
├── services/
│   ├── api/                 # Anthropic API client
│   ├── proxy/               # Free provider support
│   ├── mcp/                 # MCP server/client
│   └── plugins/             # Plugin system
├── skills/                  # Built-in skills
│   └── bundled/              # Bundled skills (bughunt, verify, etc.)
├── components/              # React UI components
├── ink/                     # Custom Ink fork (terminal React)
├── screens/                 # Full-screen UIs (REPL)
└── native-ts/               # Pure TS ports
```

---

## 🔐 Security & Privacy

### Telemetry

By default, Claude Code sends telemetry to Anthropic. To disable:

```bash
# Disable all telemetry
DISABLE_TELEMETRY=1 bun dist/cli.js

# Maximum privacy
DISABLE_TELEMETRY=1 CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1 bun dist/cli.js
```

### Bug Hunting Ethics

When using the `/bughunt` skill:

1. **Only test what you own** — Never test without permission
2. **Respect scope** — Stay within defined boundaries
3. **Document everything** — Keep detailed records
4. **Report responsibly** — Follow responsible disclosure
5. **Don't cause damage** — Avoid destructive testing

---

## 🏗️ Build Details

The build uses Bun's bundler to:

1. Bundle 4,500+ modules into a single `dist/cli.js` (~22 MB)
2. Define `MACRO.*` build-time constants (version, feedback channel)
3. Externalize optional native deps

### Build Command

```bash
bun run build
```

Output: `dist/cli.js` (~22 MB)

---

## 📝 Files Overview

### New Additions (This Fork)

| File | Description |
|------|-------------|
| `.env.example` | Environment variable template |
| `src/services/proxy/` | Free provider system (NVIDIA NIM, OpenRouter, LM Studio, llama.cpp) |
| `src/skills/bundled/bughunt/` | Bug hunter skill (43 vulnerability types) |

### Stubbed Features

Some internal features are stubbed (no native binaries):

- **Computer Use** — Screen control (requires native binaries)
- **Chrome Integration** — Browser automation
- **Sandbox Runtime** — Sandboxed execution
- **Voice Mode** — Feature flag disabled

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `bun run build` to verify
5. Submit a pull request

---

## ⚠️ Disclaimer

This repository contains source code that was unintentionally exposed by Anthropic. It is provided for educational and research purposes only.

- **Not affiliated with Anthropic**
- **No warranty provided**
- **Use at your own risk**
- **Don't use for commercial purposes**

---

## 📚 Resources

- [Anthropic API Docs](https://docs.anthropic.com)
- [NVIDIA NIM](https://build.nvidia.com)
- [OpenRouter](https://openrouter.ai)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

---

<p align="center">
  <strong>Happy Coding! 🛡️</strong>
</p>
