# Claude Code — Project Map

> **This file must be kept up to date.** Whenever you add files, create stubs, extract new sources, or change the build — update the relevant section here. This is the single source of truth for what's in this repo and how it works.

## How to Build & Run

```bash
bun install          # install dependencies
bun run build        # bundles to dist/cli.js (~23MB)
bun dist/cli.js      # run it
```

## Using with Agent SDK (in Tauri or other apps)

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";
const response = query({
  prompt: "your prompt",
  options: {
    pathToClaudeCodeExecutable: "/path/to/claude-code/dist/cli.js",
  },
});
```

## Project Structure

```
claude-code/
├── dist/                          # Build output (gitignored)
│   └── cli.js                     # Bundled CLI (23MB, single file)
│
├── .env.example                   # Environment variable template
│
├── src/                           # Main source (1,929 files) — leaked from Anthropic
│   ├── main.tsx                   # CLI entrypoint — Commander.js parser, all flags
│   ├── services/
│   │   ├── proxy/                 # [NEW] Free provider support
│   │   │   ├── settings.ts        # Environment config
│   │   │   ├── types.ts           # Type definitions
│   │   │   ├── converter.ts       # Anthropic ↔ OpenAI conversion
│   │   │   ├── rate-limiter.ts    # Rate limiting
│   │   │   ├── server.ts          # Proxy server logic
│   │   │   └── providers/         # Provider implementations
│   │   │       ├── index.ts       # Provider factory
│   │   │       ├── base.ts        # Base provider interface
│   │   │       ├── nvidia-nim.ts  # NVIDIA NIM provider
│   │   │       ├── open-router.ts # OpenRouter provider
│   │   │       ├── lm-studio.ts   # LM Studio provider
│   │   │       └── llamacpp.ts    # llama.cpp provider
│   │   └── api/
│   │       └── client.ts          # [MODIFIED] Free provider routing
│   ├── skills/
│   │   └── bundled/
│   │       ├── bughunt.ts          # [NEW] Bug hunter skill
│   │       ├── bughuntContent.ts   # [NEW] Content loader
│   │       └── bughunt/
│   │           └── SKILL.md       # [NEW] 43 vulnerability types
│   ├── commands/                  # Slash commands (~50)
│   │   ├── agents-platform/       # [STUB] Ant-only
│   │   └── assistant/             # [STUB] Assistant wizard
│   │
│   ├── tools/                     # Agent tools (~40)
│   │   ├── BashTool/              # Shell execution
│   │   ├── FileEditTool/          # File editing
│   │   ├── FileReadTool/          # File reading
│   │   ├── FileWriteTool/         # File writing
│   │   ├── GlobTool/              # File search
│   │   ├── GrepTool/              # Content search
│   │   ├── AgentTool/             # Subagent spawning
│   │   ├── WebFetchTool/          # HTTP fetching
│   │   ├── TungstenTool/          # [STUB] Ant-only debug tool
│   │   ├── REPLTool/              # [STUB] Ant-only REPL
│   │   ├── SuggestBackgroundPRTool/ # [STUB] Ant-only
│   │   ├── VerifyPlanExecutionTool/ # [STUB] Env-gated
│   │   └── WorkflowTool/          # [STUB] Feature-gated (WORKFLOW_SCRIPTS)
│   │
│   ├── components/                # React (Ink) UI components (~140)
│   │   ├── agents/
│   │   │   └── SnapshotUpdateDialog.tsx  # [STUB]
│   │   ├── design-system/         # Theme, colors, tokens
│   │   ├── LogoV2/                # Welcome screen, release notes
│   │   ├── Message.tsx            # Message rendering
│   │   ├── StructuredDiff/        # Syntax-highlighted diffs
│   │   └── permissions/           # Permission approval dialogs
│   │
│   ├── screens/
│   │   └── REPL.tsx               # Main interactive screen (2800+ lines)
│   │
│   ├── ink/                       # Custom Ink fork (terminal React renderer)
│   │   ├── layout/                # Flexbox layout engine
│   │   ├── components/            # Box, Text, ScrollBox, Button, etc.
│   │   ├── hooks/                 # useInput, useStdin, useSelection, etc.
│   │   ├── events/                # Click, keyboard, focus events
│   │   ├── termio/                # Terminal I/O, ANSI parsing
│   │   └── reconciler.ts          # React reconciler
│   │
│   ├── services/
│   │   ├── api/                   # Anthropic API client, streaming, errors
│   │   ├── mcp/                   # MCP client/server implementation
│   │   ├── oauth/                 # OAuth flow
│   │   ├── analytics/             # Telemetry, GrowthBook, DataDog
│   │   ├── lsp/                   # Language Server Protocol
│   │   ├── compact/               # Context compaction
│   │   │   ├── snipCompact.ts     # [STUB] Feature-gated (HISTORY_SNIP)
│   │   │   └── cachedMicrocompact.ts  # [STUB] Feature-gated
│   │   ├── contextCollapse/       # [STUB] Not in leak
│   │   ├── plugins/               # Plugin installation & management
│   │   └── tools/                 # Tool execution (StreamingToolExecutor)
│   │
│   ├── native-ts/                 # Pure TypeScript ports of native modules
│   │   ├── yoga-layout/           # Flexbox engine (port of Meta's Yoga)
│   │   ├── color-diff/            # Syntax-highlighted diffs (port of Rust module)
│   │   └── file-index/            # Fuzzy file search (port of nucleo)
│   │
│   ├── constants/
│   │   ├── prompts.ts             # FULL system prompt — the actual instructions sent to Claude
│   │   ├── oauth.ts               # OAuth config (client IDs, endpoints)
│   │   └── product.ts             # Product constants
│   │
│   ├── utils/
│   │   ├── autoUpdater.ts         # Version check [PATCHED — remote check disabled]
│   │   ├── computerUse/           # Computer use integration layer
│   │   │   └── executor.ts        # 22KB CLI executor — wraps Swift/Rust native modules
│   │   ├── claudeInChrome/        # Chrome integration layer
│   │   ├── sandbox/               # Sandbox adapter
│   │   ├── settings/              # Settings system
│   │   ├── model/                 # Model selection, aliases
│   │   ├── auth.ts                # Authentication
│   │   ├── hooks/                 # Hook execution engine (155 files total)
│   │   │   ├── AsyncHookRegistry.ts    # Hook registration & lifecycle
│   │   │   ├── execAgentHook.ts        # Agent-spawning hooks
│   │   │   ├── execHttpHook.ts         # HTTP webhook hooks
│   │   │   ├── execPromptHook.ts       # Prompt-based hooks
│   │   │   ├── hookEvents.ts           # All hook event types
│   │   │   └── hooksConfigManager.ts   # settings.json hook config
│   │   ├── plugins/               # Plugin system (65+ files)
│   │   │   ├── pluginLoader.ts         # Loads plugins from directories
│   │   │   ├── loadPluginAgents.ts     # Agent definitions from plugins
│   │   │   ├── loadPluginCommands.ts   # Slash commands from plugins
│   │   │   ├── loadPluginHooks.ts      # Hooks from plugins
│   │   │   ├── schemas.ts             # plugin.json schema validation
│   │   │   └── marketplaceManager.ts  # Marketplace browsing/install
│   │   ├── permissions/           # Permission & auto-mode classifier
│   │   │   ├── yoloClassifier.ts  # 52KB — auto-mode LLM classifier logic
│   │   │   ├── bashClassifier.ts  # Bash-specific classifier
│   │   │   ├── classifierDecision.ts  # Safe tool allowlist
│   │   │   ├── autoModeState.ts   # Auto-mode state management
│   │   │   └── yolo-classifier-prompts/  # [MISSING] DCE'd by feature flag
│   │   ├── protectedNamespace.ts  # [STUB] Ant-only
│   │   └── filePersistence/
│   │       └── types.ts           # [STUB]
│   │
│   ├── skills/                    # Built-in skills (23 files)
│   │   ├── bundledSkills.ts       # Skill registry
│   │   ├── loadSkillsDir.ts       # Load skills from directories
│   │   └── bundled/               # 16 bundled skills (batch, claudeApi, debug, loop, etc.)
│   │
│   ├── assistant/
│   │   ├── sessionHistory.ts      # Session history
│   │   └── AssistantSessionChooser.tsx  # [STUB]
│   │
│   ├── vim/                       # Vim mode (motions, operators, text objects)
│   ├── state/                     # App state management
│   ├── hooks/                     # React hooks
│   ├── types/
│   │   └── connectorText.ts       # [STUB]
│   ├── bridge/                    # Cloud session bridging
│   ├── coordinator/               # Multi-agent coordinator
│   ├── plugins/                   # Plugin system entry
│   ├── bootstrap/                 # Bootstrap/startup state
│   └── voice/                     # Voice mode
│
├── stubs/                         # Extracted proprietary source code
│   ├── @ant/                      # Private Anthropic packages (28 files)
│   │   ├── computer-use-mcp/      # Computer Use MCP server
│   │   │   └── src/
│   │   │       ├── index.ts       # Exports
│   │   │       ├── toolCalls.ts   # 137KB — full tool implementation
│   │   │       ├── tools.ts       # Tool definitions
│   │   │       ├── mcpServer.ts   # MCP server setup
│   │   │       ├── types.ts       # All CU types
│   │   │       ├── deniedApps.ts  # App blocklist
│   │   │       ├── keyBlocklist.ts # Key combo blocklist
│   │   │       ├── sentinelApps.ts # Sentinel app detection
│   │   │       ├── imageResize.ts # Screenshot resizing
│   │   │       ├── pixelCompare.ts # Click target validation
│   │   │       ├── executor.ts    # [STUB] Native Swift/Rust bridge interface
│   │   │       └── subGates.ts    # [STUB] Permission sub-gates
│   │   │
│   │   ├── claude-for-chrome-mcp/ # Chrome automation (8 source files)
│   │   │   └── src/
│   │   │       ├── index.ts       # Exports
│   │   │       ├── bridgeClient.ts # 37KB — Chrome bridge via WebSocket
│   │   │       ├── browserTools.ts # 25KB — browser tool definitions
│   │   │       ├── mcpServer.ts   # MCP server
│   │   │       ├── mcpSocketClient.ts # WebSocket client
│   │   │       ├── mcpSocketPool.ts   # Connection pooling
│   │   │       ├── toolCalls.ts   # Tool call handling
│   │   │       └── types.ts       # Types
│   │   │
│   │   ├── computer-use-swift/    # macOS native bridge
│   │   │   └── js/index.js        # JS loader for Swift binary
│   │   │
│   │   └── computer-use-input/    # Input device bridge
│   │       └── js/index.js        # JS loader for Rust binary
│   │
│   ├── @anthropic-ai/            # Anthropic SDK sources (105+ files)
│   │   ├── sandbox-runtime/       # Sandbox system (17 files, 180KB)
│   │   │   ├── dist/
│   │   │   │   ├── sandbox/
│   │   │   │   │   ├── sandbox-manager.js    # 31KB — core orchestrator
│   │   │   │   │   ├── sandbox-config.js     # Config/schema
│   │   │   │   │   ├── sandbox-schemas.js    # Zod schemas
│   │   │   │   │   ├── parent-proxy.js       # 17KB — parent process proxy
│   │   │   │   │   ├── macos-sandbox-utils.js # 28KB — macOS Seatbelt profiles
│   │   │   │   │   ├── linux-sandbox-utils.js # 42KB — Linux namespaces + seccomp
│   │   │   │   │   ├── generate-seccomp-filter.js # 12KB — raw BPF bytecode gen
│   │   │   │   │   ├── http-proxy.js         # HTTP egress proxy
│   │   │   │   │   ├── socks-proxy.js        # SOCKS proxy
│   │   │   │   │   └── sandbox-violation-store.js
│   │   │   │   └── utils/
│   │   │   │       └── config-loader.js      # Config file loader
│   │   │   └── vendor/
│   │   │       ├── seccomp-src/
│   │   │       │   ├── apply-seccomp.c       # C — seccomp BPF loader
│   │   │       │   └── seccomp-unix-block.c  # C — Unix socket blocker
│   │   │       └── seccomp/                  # Precompiled binaries (arm64 + x64)
│   │   │
│   │   ├── mcpb/                  # MCP Bundle tools (11 files, 75KB)
│   │   │   └── dist/
│   │   │       ├── cli/           # pack.js, unpack.js, init.js (26KB scaffolder)
│   │   │       ├── node/          # files.js, sign.js (12KB), validate.js
│   │   │       └── shared/        # config.js, log.js
│   │   │
│   │   ├── sdk/                   # Anthropic SDK source (40+ files, 232KB)
│   │   │   ├── client.mjs         # 28KB — main API client
│   │   │   ├── resources/         # API resources (messages, models, batches, skills)
│   │   │   ├── lib/
│   │   │   │   ├── MessageStream.mjs     # 29KB — response streaming
│   │   │   │   ├── BetaMessageStream.mjs # 31KB — beta streaming
│   │   │   │   ├── tools/BetaToolRunner.mjs # 18KB — tool use loop
│   │   │   │   ├── tools/CompactionControl.mjs # Context compaction
│   │   │   │   └── parser.mjs           # Partial JSON streaming parser
│   │   │   └── internal/          # Headers, auth, request handling
│   │   │
│   │   ├── bedrock-sdk/           # AWS Bedrock (12 files, 36KB)
│   │   │   ├── client.mjs         # Bedrock API client
│   │   │   └── core/auth.mjs      # SigV4 signing
│   │   │
│   │   ├── vertex-sdk/            # GCP Vertex (7 files, 13KB)
│   │   │   └── client.mjs         # Vertex AI client with Google auth
│   │   │
│   │   └── foundry-sdk/           # Foundry (8 files, 16KB)
│   │       └── client.mjs         # Foundry client with custom auth
│   │
│   └── downloads/                 # Additional packages from npm + GCS
│       ├── tokenizer/             # Claude's BPE tokenizer
│       │   ├── claude.json        # 680KB — full vocabulary (64,739 tokens)
│       │   ├── index.ts           # Tokenizer implementation
│       │   └── tests/             # Test suite
│       │
│       ├── claude-trace/          # OTEL trace viewer for Claude sessions
│       │   ├── dist/server.cjs    # 838KB — trace server
│       │   └── viewer/dist/       # Web UI (HTML + JS + CSS)
│       │
│       ├── claude-agent-sdk/      # Agent SDK package
│       │   ├── sdk.mjs            # Main SDK — spawns CLI as subprocess
│       │   ├── sdk.d.ts           # Full type definitions
│       │   ├── bridge.mjs         # Session bridge protocol
│       │   ├── browser-sdk.js     # Browser-compatible SDK
│       │   ├── embed.js           # Embedding helpers
│       │   └── manifest.json      # SDK manifest
│       │
│       └── official-plugins/      # Official plugin marketplace (from GCS bucket)
│           └── marketplaces/claude-plugins-official/
│               ├── plugins/       # 32 official plugins
│               │   ├── feature-dev/       # Feature dev with agents
│               │   ├── code-review/       # Code review
│               │   ├── plugin-dev/        # Plugin development tools
│               │   ├── mcp-server-dev/    # MCP server builder
│               │   ├── claude-code-setup/ # Automation recommender
│               │   ├── claude-md-management/ # CLAUDE.md improver
│               │   ├── skill-creator/     # Skill creation
│               │   ├── frontend-design/   # Frontend design generation
│               │   ├── security-guidance/ # Security review
│               │   ├── agent-sdk-dev/     # Agent SDK tools
│               │   ├── hookify/           # Hook creation
│               │   ├── commit-commands/   # Git commit helpers
│               │   ├── playground/        # Plugin playground
│               │   ├── ralph-loop/        # Looping agent
│               │   ├── math-olympiad/     # Math problem solving
│               │   ├── typescript-lsp/    # TypeScript LSP
│               │   ├── pyright-lsp/       # Python LSP
│               │   ├── rust-analyzer-lsp/ # Rust LSP
│               │   ├── gopls-lsp/         # Go LSP
│               │   └── ... (13 more LSP + output style plugins)
│               └── external_plugins/  # 3rd-party plugins (asana, context7, discord)
│
├── shims/                         # Build-time shims
│   ├── bun-bundle.ts              # Runtime shim for feature() — returns false
│   ├── bun-bundle.d.ts            # Type declaration
│   └── globals.d.ts               # MACRO.* type declarations
│
├── scripts/
│   └── generate-sdk-types.ts      # Generates coreTypes.generated.ts from Zod schemas
│
├── vendor/                        # Native binaries from npm package (gitignored)
│   ├── ripgrep/                   # rg binary (arm64/x64 for darwin/linux/win32)
│   └── audio-capture/             # Voice capture native addon (all platforms)
│
├── build.ts                       # Bun build script
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── bun.lock                       # Bun lockfile
├── .gitignore
├── LICENSE                        # MIT
├── README.md
│
├── cli.js.map                     # Original 57MB source map (gitignored, saved locally)
└── sourcemap-extract.tar.gz       # Full extraction archive (gitignored, saved locally)
```

## What's Patched

- `src/utils/autoUpdater.ts` — remote version check disabled (line 72: early return)
- `build.ts` — MACRO.VERSION set to `2.1.88`, all feature() flags return false

## What's Stubbed (marked [STUB] above)

Files that exist but contain minimal placeholder code because:
1. **Not in leak** — source files excluded from the original zip
2. **Native bindings** — Rust/Swift code can't be in a source map (executor.ts, subGates.ts)
3. **Generated files** — were generated by build scripts (coreTypes.generated.ts — we regenerated this)
4. **Ant-only** — internal Anthropic tools gated by `USER_TYPE === 'ant'`

## Feature Flags (all disabled)

The source uses `feature('FLAG_NAME')` from `bun:bundle` for dead code elimination.
Our shim returns `false` for all flags. Known flags:
VOICE_MODE, COORDINATOR_MODE, KAIROS, PROACTIVE, ULTRAPLAN, BRIDGE_MODE,
BG_SESSIONS, WORKFLOW_SCRIPTS, TRANSCRIPT_CLASSIFIER, TOKEN_BUDGET,
HISTORY_SNIP, BUDDY, TEAMMEM, AGENT_TRIGGERS, WEB_BROWSER_TOOL,
MESSAGE_ACTIONS, HOOK_PROMPTS, CACHED_MICROCOMPACT, CHICAGO_MCP,
ABLATION_BASELINE, DUMP_SYSTEM_PROMPT

## What Works vs What Doesn't

### Fully Working
- All standard tools (Bash, Edit, Read, Write, Grep, Glob, WebFetch, WebSearch, Agent)
- Terminal UI (full React/Ink REPL with custom flexbox layout)
- OAuth authentication (same flow as official)
- MCP server support
- Slash commands (/help, /clear, /compact, /resume, etc.)
- Session persistence and resume
- Plugin system (full source: loading, agents, commands, hooks, marketplace)
- Hook system (full source: async registry, agent/HTTP/prompt hooks, SSRF guard)
- Skill system (full source: 16 bundled skills, skill loader, MCP skill builders)
- Vim mode
- Sandbox mode (real @anthropic-ai/sandbox-runtime from npm)
- AWS Bedrock / GCP Vertex / Foundry backends (real SDKs from npm)
- Agent SDK integration (set `pathToClaudeCodeExecutable` to `dist/cli.js`)
- System prompt (full source in src/constants/prompts.ts)

### Not Working
- **Computer Use** — full logic extracted (137KB toolCalls.ts) but needs native
  Swift/Rust binaries for screen capture and input. Could be rebuilt using macOS
  system commands (screencapture, osascript, pbcopy/pbpaste). The 22KB executor
  wrapper (src/utils/computerUse/executor.ts) shows the exact native API surface.
- **Auto-mode classifier prompts** — the classifier logic is all there (52KB
  yoloClassifier.ts) but the 3 prompt .txt files were DCE'd by the
  TRANSCRIPT_CLASSIFIER feature flag. The code shows the expected format
  (allow/soft_deny/environment rules with XML tags).
- **Feature-flagged features** — voice, coordinator, ultraplan, etc. All disabled
  via feature() shim. The source is there but many depend on backend infra.
- **Ant-only tools** — TungstenTool, REPLTool, SuggestBackgroundPRTool. Internal
  tools never available in external builds.

## Source Extraction Summary

| Source | Method | Files | What |
|--------|--------|-------|------|
| Original leak | .map file on R2 bucket | 1,929 | Full src/ directory |
| npm source map | `cli.js.map` in `@anthropic-ai/claude-code` | 4,756 total | Everything bundled into the CLI |
| npm source map | Same file, `@ant/*` entries | 20 | Computer use + Chrome (private, not on npm) |
| npm source map | Same file, `@anthropic-ai/*` entries | 105 | SDK, sandbox, mcpb, bedrock, vertex, foundry |
| npm registry | `npm pack @anthropic-ai/tokenizer` | 15 | Claude's BPE tokenizer + 64,739-token vocabulary |
| npm registry | `npm pack @anthropic-ai/claude-trace` | 6 | OTEL session trace viewer |
| npm registry | `npm pack @anthropic-ai/claude-agent-sdk` | 18 | Agent SDK source + types |
| npm registry | `npm pack @anthropic-ai/sandbox-runtime` | 10 | Extra files not in source map (parent-proxy, seccomp C source) |
| GCS bucket | `storage.googleapis.com/claude-code-dist-*` | 334 | Official plugin marketplace (32 plugins) |
| GCS bucket | Same bucket, `manifest.json` per version | 228 versions | Native binary manifests (all platforms, checksums) |

## All @anthropic-ai npm Packages (as of 2026-03-31)

| Package | On npm? | In our repo? | Status |
|---------|---------|-------------|--------|
| `@anthropic-ai/claude-code` | Yes | src/ + stubs/ | **Full source extracted** |
| `@anthropic-ai/claude-agent-sdk` | Yes | stubs/downloads/ | **Downloaded** |
| `@anthropic-ai/sdk` | Yes | stubs/@anthropic-ai/sdk/ | **Source from map + npm install** |
| `@anthropic-ai/bedrock-sdk` | Yes | stubs/@anthropic-ai/bedrock-sdk/ | **Source from map + npm install** |
| `@anthropic-ai/vertex-sdk` | Yes | stubs/@anthropic-ai/vertex-sdk/ | **Source from map + npm install** |
| `@anthropic-ai/foundry-sdk` | Yes | stubs/@anthropic-ai/foundry-sdk/ | **Source from map + npm install** |
| `@anthropic-ai/sandbox-runtime` | Yes | stubs/@anthropic-ai/sandbox-runtime/ | **Source from map + npm + extras** |
| `@anthropic-ai/mcpb` | Yes | stubs/@anthropic-ai/mcpb/ | **Source from map + npm install** |
| `@anthropic-ai/tokenizer` | Yes | stubs/downloads/tokenizer/ | **Downloaded** |
| `@anthropic-ai/claude-trace` | Yes | stubs/downloads/claude-trace/ | **Downloaded** |
| `@ant/computer-use-mcp` | **No** (private) | stubs/@ant/computer-use-mcp/ | **Source from map** |
| `@ant/claude-for-chrome-mcp` | **No** (private) | stubs/@ant/claude-for-chrome-mcp/ | **Source from map** |
| `@ant/computer-use-swift` | **No** (private) | stubs/@ant/computer-use-swift/ | **JS loader only** (binary missing) |
| `@ant/computer-use-input` | **No** (private) | stubs/@ant/computer-use-input/ | **JS loader only** (binary missing) |

## Open GCS Bucket (no auth required)

```
https://storage.googleapis.com/claude-code-dist-86c565f3-f756-42ad-8dfa-d59b1c096819/
├── claude-code-releases/
│   ├── {version}/                 # 228 versions (1.0.100 → 2.1.88)
│   │   ├── manifest.json          # Platform checksums and sizes
│   │   ├── darwin-arm64/claude    # macOS ARM binary
│   │   ├── darwin-x64/claude     # macOS Intel binary
│   │   ├── linux-arm64/claude    # Linux ARM binary
│   │   ├── linux-x64/claude      # Linux x64 binary
│   │   ├── win32-x64/claude.exe  # Windows binary
│   │   └── ...
│   └── plugins/
│       └── claude-plugins-official/
│           ├── latest             # Points to current hash
│           └── {hash}.zip         # Plugin marketplace bundles
└── test-uploads/                  # Just a test.txt
```

## Keeping This File Updated

**When you modify this repo, update this file:**
- Added a new stub? Add it to the structure tree with `[STUB]` tag
- Extracted new source? Add to extraction summary table
- Found a new npm package? Add to the packages table
- Changed what works/doesn't? Update the status section
- New build steps? Update "How to Build & Run"
