# Contributing to Ember

Thanks for your interest in Ember. Contributions of all kinds are welcome — bug reports, ideas,
docs, and code.

## Principles

Ember is intentionally minimal and calm. Before adding a feature, ask whether it earns its place:
does it help someone move from planning to doing without adding clutter or pressure? Polish and
restraint are features.

## Architecture at a glance

- **`src/lib/`** — pure, side-effect-free domain logic (dates, analytics, streaks, reviews,
  search). This is where the real rules live; keep it framework-free and easy to reason about.
- **`src/store/`** — two small Zustand stores: persisted data and ephemeral UI state.
- **`src/hooks/`** — derived, memoized reads.
- **`src/components/`** — single-responsibility, presentational components grouped by feature.

Keep business logic in `lib/`, not in components.

## Development

```bash
npm install      # Node 20+ (see .nvmrc)
npm run dev      # http://localhost:5173
npm run typecheck
npm run build
```

## Before opening a PR

- Run `npm run typecheck` and `npm run build` — both must pass cleanly.
- Match the existing code style (strict TypeScript, no `any`, explicit types on public APIs).
- Keep changes focused; one concern per PR.
- Update the README/docs if behavior changes.
- Never commit secrets, `.env` files, `node_modules`, or `dist`.

## Commit style

Conventional commits are appreciated (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`) but not
required.

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
