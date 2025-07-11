# Refactoring Prompt Plan

## Purpose

Guide a code‑generation LLM through a safe, test‑driven refactor that satisfies *specs.md* requirements and the additional tasks you outlined.

## Global Rules (apply to **every** prompt)

1. **TDD first** – write/adjust failing tests *before* production code.

2. Run **test → lint → build** locally; each step passes only when all three succeed.

3. Craft a conventional commit message (e.g. `feat:`, `chore:`, `refactor:`) that succinctly describes the change, then **push immediately** (`git push --set-upstream origin <branch>`).\
   *Goal: many small commits — look busy!*

4. Follow folder guidance in `@/docs`.

---

## Prompt Sequence

Each section contains a **Prompt ID** and the exact ``** fenced prompt** to feed the LLM.

> **Tip for the operator**: After giving each prompt, wait for the LLM to propose patches/tests, then run the CI loop locally before issuing the next prompt.

### Prompt 0 — Bootstrap context

```text
You are the code‑generation agent for our TypeScript/Node project.
The repo already exists locally.
Always follow the Global Rules.
Reply only with the diff (unified format) and the commit message for each task.
```

### Prompt 1 — Branch setup

```text
# Task ► git branch hygiene
1. Verify you are on `dev`; fetch & rebase if needed.
2. From `dev`, create `refactor/folder-structure-and-name-change`.
3. Push the new branch.

Write a failing shell‑test (e.g. using your preferred test runner) that asserts `git symbolic-ref --short HEAD` equals the new branch.
Commit as `chore: start refactor branch`.
```

### Prompt 2 — Pluralise Supabase table names

```text
# Task ► Update table references
1. Using `@supabase.ts` as the single source of truth for **table names**, rename every table reference from singular to plural across backend & frontend code.
2. Add/adjust unit tests that query/insert using the plural names.
3. Run full CI loop.
Commit as `refactor(db): pluralise table names from singular → plural`.
```

### Prompt 3 — Create `backend` & `common` folders and migrate code

```text
# Task ► Folder restructuring (phase 1)
1. At repo root create `backend/` and `backend/common/`.
2. For each folder under `api/`:
   • If the folder (or a subfolder) ends with `(adaptor)`, move it **together with its parent folder**.
   • Otherwise move the folder **unchanged** into `backend/`.
3. All non‑`adaptor` folders formerly outside `api/` go to `backend/common/`.
4. Fix absolute/relative imports after the moves.
5. Update path‑based tests.
6. **Promote `dto/` and `usecase/`**: for every `application/` directory encountered, lift its `dto/` and `usecase/` subfolders up one level (so they sit alongside what used to be `application`), then delete the empty `application/` folder.
Commit as `refactor(fs): create backend/common and promote dto & usecase`.
```

### Prompt 4 — Pluralise backend folders

```text
# Task ► Folder renaming (phase 2)
Within `backend/` (excluding `common`, `user`, `admin`, and the verb‑named folders **signin** and **signup**):
1. Identify nouns; rename each to its plural form (e.g. `supply` → `supplies`).
2. Adjust imports, ts‑config paths, and tests accordingly.
3. Ensure build passes.
Commit as `refactor(fs): pluralise backend folder names`.
```

### Prompt 5 — Validation & cleanup

```text
# Task ► Final validation
1. Run the entire CI suite (`yarn test`, `yarn lint`, `yarn build`).
2. Generate a summary report of all changes (`git shortlog`).
3. Commit workspace upgrades or minor fixes if anything left.
Commit as `chore: finalise refactor`.
```

### Prompt 6 — Document folder conventions

```text
# Task ► Update coding convention docs
1. Create or update `@/docs/@coding_convention.md` to capture the final folder hierarchy, including promoted `dto/` and `usecase/` moves and pluralised folder names.
2. Provide a concise rationale for each top‑level folder and an example import snippet.
3. Run `yarn test && yarn lint && yarn build` to ensure docs don't break the build.
Commit as `docs: update coding convention`.
```

---

## Hand‑off Checklist

-

Happy refactoring!

