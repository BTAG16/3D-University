# Git Flow: staging → main release

Execute the full git flow for this project:
- `staging` = preview branch (all work lands here first)
- `main` = production branch (only receives merges from staging, always tagged)

## Steps to execute

### 1. Detect current branch and uncommitted changes

Run `git status` and `git branch --show-current` to understand the current state.

### 2. Stage and commit any uncommitted changes

If there are uncommitted changes, stage ALL modified tracked files and commit them with a conventional commit message that accurately summarises what changed. Use the format:

```
<type>: <short description>

<bullet list of key changes>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Do NOT commit `supabase/.temp/` files.

### 3. Ensure we are on `staging`

If not already on `staging`:
- If on a feature branch: merge that branch into `staging` with `--no-ff`, then delete the feature branch locally
- If on `main`: checkout `staging`

Push `staging` to origin: `git push origin staging`

### 4. Merge `staging` → `main`

```bash
git checkout main
git pull origin main --no-rebase   # integrate any remote-only commits first
git merge staging --no-ff -m "chore: merge staging → main for <version> release

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### 5. Determine the next version tag

Run `git tag --sort=-v:refname | grep "^v" | head -1` to find the latest `v*` tag.

- If no version tags exist → use `v1.0.0`
- Otherwise bump according to the nature of changes in this release:
  - Breaking changes or major features → bump **major** (v1.x.x → v2.0.0)
  - New features (non-breaking) → bump **minor** (v1.0.x → v1.1.0)
  - Bug fixes / patches only → bump **patch** (v1.0.0 → v1.0.1)

Ask the user which bump to apply if it is unclear from the commit history.

### 6. Create annotated tag on `main`

```bash
git tag -a <version> -m "Release <version> — <one-line summary>

<bullet list of what's in this release>"
```

### 7. Push `main` and the tag

```bash
git push origin main
git push origin <version>
```

### 8. Switch back to `staging`

```bash
git checkout staging
```

### 9. Report summary

Print a concise summary:
- Branch pushed: `staging` (preview)
- Branch pushed: `main` (production)
- Tag created: `<version>`
- Link to GitHub: `https://github.com/BTAG16/3D-University/releases/tag/<version>`

## Important rules

- NEVER force-push `main`
- NEVER skip the `--no-ff` flag on merges into `main` (preserves merge history)
- NEVER commit `.env`, secrets, or `supabase/.temp/` files
- Always pull remote `main` before merging to avoid non-fast-forward rejections
- Always end the session on `staging`, never leave the user on `main`
- If any step fails, stop and report the exact error — do not attempt workarounds that could corrupt history
