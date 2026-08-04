# Contributing

Thanks for your interest in **Mushaf Imad Expo** — a React Native / Expo
Quran reader. This guide explains how to set up the project, propose a
change, and get it through review.

The project has no formal release calendar. Outside contributors have
historically shipped features and fixes from their own forks. You don't
need to ask first; open a pull request.

## Quick start

Prerequisites: **Node.js 24.x**, **Yarn 4.13.0** (pinned by Corepack),
**Git**, plus the platform toolchain (Xcode for iOS, Android Studio +
JDK for Android). See [Requirements](#requirements) below for details.

```bash
git clone https://github.com/adelpro/mushaf-imad-expo.git
cd mushaf-imad-expo
yarn install
yarn start
```

If you changed anything under `assets/images/quran/`, also run
`yarn generate-map` before `yarn start` so Expo can statically resolve
the page images.

## Code of conduct

Be respectful, assume good faith, and keep feedback on-topic. Harassment
of any kind is not tolerated. This project follows the
[Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/);
when in doubt, read that document.

A dedicated `CODE_OF_CONDUCT.md` is not yet committed to this repository.
Until one is added, the text at the link above is the operative
document.

## Security

Do not open a public issue for a security-sensitive report. Disclose
privately through GitHub's private security-advisories workflow, which
preserves attribution and tracks triage:

> **https://github.com/adelpro/mushaf-imad-expo/security/advisories/new**

Please reproduce the issue locally before filing. If you can't reproduce
it, say so — that itself is useful information, and we can work with
you on a setup that does. Avoid pasting secrets, tokens, or full SQLite
database dumps into the report; attach them only when the maintainer
asks.

A dedicated `SECURITY.md` is not yet committed. Until then, this section
is the disclosure channel.

## Requirements

| Requirement          | Version / note                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Node.js              | `24.x` (matches `.github/workflows/ci.yml`; no `engines` field in `package.json` yet)           |
| Yarn                 | `4.13.0` (pinned in `package.json#packageManager` via Corepack; do not bypass with npm or pnpm) |
| Corepack             | Enabled (`corepack enable` once, in any Node 16.10+)                                            |
| Git                  | Any reasonably current version                                                                  |
| Xcode                | Version required by Expo SDK 54 / React Native 0.81 (iOS development)                           |
| Android Studio + JDK | Version required by Expo SDK 54 / React Native 0.81 (Android development; Hermes / New Arch on) |
| Watchman             | Recommended on macOS for fast file watching                                                     |

If `yarn install` complains about the package manager, you skipped
Corepack. Run `corepack enable` and try again — the
[`packageManager`](package.json) field is intentionally integrity-hashed,
so Yarn 4.13.0 is the only accepted version.

## Branch model

| Branch    | Purpose                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------- |
| `main`    | Production-tracked. Tagged releases (the latest is `0.2.0-athar`).                                            |
| `develop` | Integration branch. New PRs land here first.                                                                  |
| `staging` | Reserved. Currently unused — see `.github/workflows/ci.yml` for the historic declaration. Treat as `develop`. |

**Default base for new work is `develop`.** Production release PRs go
from `develop` to `main`.

Create your branch using one of these prefixes:

- `feat/<short-kebab-desc>` — new user-visible capability
- `fix/<short-kebab-desc>` — bug fix
- `chore/<short-kebab-desc>` — tooling / non-runtime change
- `refactor/<short-kebab-desc>` — internal change with no behavior change
- `docs/<short-kebab-desc>` — documentation only
- `test/<short-kebab-desc>` — tests only

Avoid unprefixed branches (a few older PRs in this repo used names like
`highlight-bug-fix` — they make filtering the branch list and the
release notes impossible).

## Development workflow

- **Language:** TypeScript, `strict: true`. See [tsconfig.json](tsconfig.json) — it extends `expo/tsconfig.base`, which sets `target: ESNext`, `module: ESNext`, `jsx: react-jsx`. The project ships ESM.
- **Formatter:** Prettier — double quotes, semicolons on, 2-space tabs, 100-col, trailing comma `es5`, always-arrow-parens, auto line endings. Apply with `yarn format`; verify with `yarn format:check`. See [.prettierrc](.prettierrc).
- **Linter:** ESLint flat config (`eslint.config.mjs`) covering JS, TypeScript, React, and React Native. Prettier is wired in as **warnings**, not errors — do not rely on lint to catch formatting. Run with `yarn lint`; autofix with `yarn lint:fix`.
- **Native code:** `android/` and `ios/` are regenerated by `yarn prebuild`. Never hand-edit them; the next prebuild will wipe your edits.
- **One concern per PR.** If you find yourself fixing two unrelated things, split into two PRs.

## Pre-PR quality gate

Run these in order. The order matches `.github/workflows/ci.yml`, plus
the test step that CI currently omits:

```bash
yarn format:check   # verify formatting without rewriting
yarn lint           # ESLint
yarn doctor:expo    # Expo health checks
yarn test           # Vitest
```

Notes on what's around the gate:

- CI runs `yarn format` (the writer, not the checker) rather than `yarn format:check`. That's a known CI bug — the gate above uses `format:check` so failures are visible locally. Fixing CI itself is out of scope for a contributor-side change.
- `yarn doctor:react` is a deeper React-Doctor scan. Run it before opening a PR that touches component rendering, gestures, or React-Native performance work.
- If you touched TypeScript types, also run `npx tsc --noEmit`. There is no `typecheck` script yet.
- If you touched image assets, also run `yarn generate-map`.

## Commit messages

Conventional Commits. Subject + optional scope + colon + imperative
description. Wrap body lines at 100 columns (Prettier setting).

Allowed types, in priority order:

| Type        | Use for                                                      |
| ----------- | ------------------------------------------------------------ |
| `feat:`     | New user-visible capability                                  |
| `fix:`      | Bug fix                                                      |
| `chore:`    | Tooling or non-runtime change                                |
| `refactor:` | Internal change with no behavior change                      |
| `docs:`     | Documentation only                                           |
| `perf:`     | Performance improvement                                      |
| `test:`     | Tests only                                                   |
| `build:`    | Build system or dependency-only                              |
| `ci:`       | CI-only change                                               |
| `style:`    | Formatting-only (rare here; usually `chore:` if tooling too) |
| `revert:`   | Revert a previous commit                                     |

Scope is optional and tracks the area of the codebase:
`feat(progress):`, `fix(page-input):`, `fix(gestures):`. Used
sporadically in this repo's history — include one when it makes the
subject shorter, omit it otherwise.

Examples from the actual history:

```text
feat(progress): add save-progress button to verse popup
fix(page-input): only shift editing bubble up when keyboard would cover it
chore: align yarn.lock with package.json (expo-haptics ^55.0.8)
```

No `BREAKING CHANGE:` footer is required for this project today. If
your change requires a major-version bump, call it out in the PR body.

## Verifying AI-generated or auto-generated code

This is the most common reviewer complaint in 2026, so it gets its own
section. If any portion of your diff was generated by an AI tool or by
an auto-codegen step:

- **Build and run locally.** `yarn install` then `yarn test`, plus a real-device run of `yarn android` or `yarn ios`. Don't ship a diff you haven't exercised.
- **Re-read your diff.** If you can't explain why a line is there, rewrite or remove it. Reviewers will not accept "the model put it there."
- **Run the project's linters.** `yarn lint` and `yarn doctor:expo`. Address every warning they flag, even if you didn't write the line that triggered it.
- **Add or update tests.** AI-generated code without coverage is a fast-track to a "needs tests" review.
- **No secrets or copied snippets.** Don't paste credentials, tokens, or copied proprietary snippets. Gitleaks runs weekly and on every PR via `.github/workflows/gitleaks.yml`.
- **You own the result.** "The tool said so" is not a review-defense. If you would not defend the line in a code-review comment, delete the line.

## Pull requests

- **Target branch:** `develop`. Production release PRs go `develop` → `main`.
- **Use the template.** [.github/pull_request_template.md](.github/pull_request_template.md) mirrors the workflow in this file.
- **One logical change per PR.** Multiple unrelated commits in a single PR will be asked to split.
- **Reference issues** with `Fixes #NN` or `Refs #NN` in the PR body, not in commit subjects.
- **For user-visible changes** (UI, gesture behavior, screens, theme): attach before/after screenshots, or a short screen recording. Mobile rendering bugs without repro screenshots are much harder to triage.
- **For bug fixes:** include the repro steps and the actual fix in the PR body. Don't bury them in the commit log.
- **Don't squash-merge yourself.** This repo merges feature branches with a merge commit, not a squash. Keep your branch tidy, but the merge strategy is the maintainer's call.

## Adding to the Quran view

> **Start here:** [docs/quran-component.md](docs/quran-component.md)
> documents the `QuranView` API, supported props, hooks, and known
> limitations. That page is the source of truth for what the component
> is and isn't. Don't duplicate it here.

If you're modifying the database schema or migrating stored data, see
[docs/migration-realm-to-sqlite.md](docs/migration-realm-to-sqlite.md)
for the current schema, the Realm→SQLite migration story, and the
debug scripts under `scripts/check-*.js`.

When your change lives anywhere outside `src/components/quran/**` —
hooks, services, store, theme, utilities, screens — keep it small and
focal. A single screen or service rarely needs a 600-line PR.

## Reporting bugs / requesting features

No issue templates are committed yet. Until there are, open issues
directly on GitHub:

> **https://github.com/adelpro/mushaf-imad-expo/issues/new**

For bug reports, include:

- A one-line summary.
- Environment: device, OS version, app version, `yarn start` output.
- Repro steps as a numbered list.
- Expected vs actual behavior.
- Logs, screenshots, or a screen recording.
- Whether you can reproduce on a fresh `yarn install` after `yarn clean:all`.

For feature requests, include the **motivation** — what user problem
does this solve? — not just the proposed change. A request that names
the problem gets a faster and more useful response than one that names
only the implementation.

## License

This project is licensed under the **MIT License** — see
[LICENSE](LICENSE). Copyright (c) 2026 AdelPro.

By submitting a contribution (a pull request, a patch attached to an
issue, or a commit pushed to a fork that lands here), you agree to
license your contribution under the same MIT terms. If your employer
has rights to your work, make sure you have authorization to grant that
license — it's your responsibility to confirm.
