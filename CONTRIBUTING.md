# Contributing

Thank you for your interest in contributing. This document covers how to set up your development environment, run the test suite, and follow the project's code conventions.

---

## Getting Started

### Prerequisites

- Node.js 20+ (check with `node --version`)
- npm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/llms-checker.git
cd llms-checker

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

---

## Development Workflow

### Before committing

Run all checks locally:

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Run tests (once)
npm run test:run

# Build for production
npm run build
```

All four must pass before pushing.

### Running tests

```bash
npm test          # Watch mode — re-runs on file changes
npm run test:run  # Single run, useful for CI
```

Test files live next to the source files they test:

```
src/lib/markdown-parser.ts      → src/lib/markdown-parser.spec.ts
src/lib/charset-decoder.ts      → src/lib/charset-decoder.spec.ts
src/lib/content-sniffer.ts      → src/lib/content-sniffer.spec.ts
src/lib/network-error-mapper.ts → src/lib/network-error-mapper.spec.ts
```

---

## Code Style

### TypeScript rules (enforced via ESLint + TypeScript config)

- **Never use `any`** — use `unknown` with type narrowing instead
- **Never use `// @ts-ignore`** — use `// @ts-expect-error` with a comment explaining why
- **Explicit return types** for all exported functions
- **Use `interface` for object shapes, `type` for unions and primitives**
- **No `enum`** — use `const` maps instead: `const Role = { Admin: 'admin' } as const`
- **`as const`** for all config objects and literal values
- **`satisfies`** to validate object shape without losing literal type inference

### Error handling

- Never swallow errors silently — every `catch` must log the error with context
- Never throw plain strings — always `throw new Error('message')`
- `try/catch` is sufficient — no need for a `Result<T, E>` pattern

### Architecture

Business logic lives in `src/lib/` — no React imports allowed there. Components in `src/components/` may import from `src/lib/` but not vice versa.

Keep functions small — extract to a helper if a function exceeds ~40 lines.

### Imports

Use `import type` for type-only imports. Order: built-in → external → internal → relative.

---

## Adding New Validation Rules

Rules are defined in [`src/lib/validator.ts`](src/lib/validator.ts). Each rule follows this pattern:

```typescript
// Rule N: rule_name (Required/Optional)
if (condition) {
  errors.push({ rule: "rule_name", message: "Human-readable message" });
  // or for optional rules:
  warnings.push({ rule: "rule_name", message: "Human-readable message" });
}
```

After adding a rule:
1. Add the rule identifier to `ValidationCheck` in [`src/lib/validation-checklist.ts`](src/lib/validation-checklist.ts)
2. Add a label mapping in the `label()` function
3. Add test cases in the appropriate `.spec.ts` file
4. Update [`SPEC.md`](SPEC.md) with the new rule's documentation

---

## Adding New Error Codes

Error codes are defined in [`src/lib/types.ts`](src/lib/types.ts) as part of the `ErrorCode` union type.

After adding a new code:
1. Add it to the union in `types.ts`
2. Handle the new code in [`src/lib/network-error-mapper.ts`](src/lib/network-error-mapper.ts)
3. Add a label in `validation-checklist.ts` if it needs a display name
4. Update [`SPEC.md`](SPEC.md) with the new code's description

---

## Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add link checking with Promise.allSettled
fix: handle ENOTFOUND error in charset decoder
docs: update SPEC.md with new WAF detection signatures
test: add charset-decoder spec for GBK decoding
refactor: extract content-sniffer logic from route handler
```

---

## Reporting Issues

Before opening an issue, please verify it is not already reported. When reporting, include:

- The URL you tested
- The error code or validation result returned
- Expected vs actual behavior
- Browser and OS (for UI issues)