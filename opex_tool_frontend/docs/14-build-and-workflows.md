# 14. Build, Run & Common Workflows

---

## 14.1 Prerequisites

The **Django backend must be running** before the frontend can load data.

```powershell
# from the repo root
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt      # first time / after dependency changes
python manage.py migrate             # first time / after model changes
uvicorn opex_project.asgi:application --host 127.0.0.1 --port 8000 --reload
```

> **It must be uvicorn, not `manage.py runserver`.** The app uses Django Channels
> for the OPEX progress WebSocket, so it runs under ASGI
> (`opex_project/asgi.py → application`). Under WSGI, `useOpexProgress` never
> connects and the OPEX modal reports a WebSocket error.

Full instructions: [START.md](../../START.md).

---

## 14.2 npm scripts

| Script | What it does |
|---|---|
| `npm start` | `manifest:public` then `react-scripts start` → `http://localhost:3000`, DevAdmin **ON** |
| `npm run start:prod` | Dev server with `REACT_APP_DEV_MODE=false`. **DevAdmin is still on** — `react-scripts start` forces `NODE_ENV=development`, which wins. Use `npm run build` if you need it truly gone. |
| `npm run build` | `manifest:public` → `react-scripts build` → **deletes `build/files/`**. Output `build/`, DevAdmin stripped, no test fixtures (~9 MB) |
| `npm run build:dev` | `manifest:public` → build with `REACT_APP_DEV_MODE=true` and `BUILD_PATH=build-dev`. DevAdmin included **plus** test fixtures (~340 MB) |
| `npm test` | Jest in watch mode — 3 real test files |
| `npm run manifest` | Regenerates `build/files/manifest.json` |
| `npm run manifest:public` | Regenerates `public/files/manifest.json`; runs automatically before start/build |
| `npm run eject` | Don't. |

### The proxy

`package.json` sets `"proxy": "http://localhost:8000"`, so during `npm start` any
unmatched request (including `/api/v1/*`) is forwarded to the backend. **The
proxy only applies to the dev server** — a production build is served by Django
itself, so the same relative paths work.

The WebSocket is **not** proxied: `useOpexProgress` builds
`ws://<hostname>:8000/ws/opex_progress/` explicitly.

### The file manifest

`manifest:public` scans `public/files/` and writes
`{ "files": [ ... ] }` to `public/files/manifest.json`, creating the directory if
absent. DevAdmin's QuickCreate and the puppet's `fetchTestFiles` read it to
attach real fixtures.

Run it manually if you add fixtures mid-session — nothing watches the folder.

---

## 14.3 The two builds

The builds go to **separate folders** so both can exist at once.

| | `npm run build` | `npm run build:dev` |
|---|---|---|
| Output | `build/` | `build-dev/` |
| `REACT_APP_DEV_MODE` | unset | `true` |
| DevAdmin | stripped | included |
| `files/` fixtures | deleted after build | kept |
| Size | ~9 MB | ~340 MB |
| Use for | end users | QA on a bundled build |

Neither folder is committed — both are in `.gitignore`, and each machine builds
its own.

### Choosing which build Django serves

`opex_project/settings.py`:

```python
OPEX_BUILD = os.environ.get('OPEX_BUILD', 'dev')
_BUILD_FOLDER = {'production': 'build', 'dev': 'build-dev'}.get(OPEX_BUILD, 'build')
REACT_BUILD_DIR = BASE_DIR / 'opex_tool_frontend' / _BUILD_FOLDER
```

Either edit that default and restart, or override for one run:

```powershell
$env:OPEX_BUILD = 'production'
uvicorn opex_project.asgi:application --host 127.0.0.1 --port 8000
```

**Build the matching folder first.** Serving `build-dev` without having run
`npm run build:dev` gives a blank page.

> The in-repo default is currently `'dev'`, while `START.md` documents
> `'production'`. Check the actual line before assuming.

---

## 14.4 Environment variables

| Variable | Default | Effect |
|---|---|---|
| `NODE_ENV` | set by react-scripts | `development` ⇒ dev mode ⇒ DevAdmin available, `PerformanceMonitor` enabled |
| `REACT_APP_DEV_MODE` | unset | `'true'` forces dev mode in a production build |
| `REACT_APP_API_URL` | `/api/v1` | `apiClient`'s base path |
| `BUILD_PATH` | `build` | CRA output folder; `build:dev` sets `build-dev` |
| `PUBLIC_URL` | `''` | Prefix for `exampleUrl()` links to the shipped CSV/XLSX examples |

`cross-env` (a devDependency) sets these portably on Windows.

---

## 14.5 Static assets in `public/`

| Path | Purpose |
|---|---|
| `index.html` | Main app shell — mounts `#root`. Still carries CRA's default `<title>React App</title>`. |
| `help.html` | Standalone help page — mounts `#help-root`, `lang="lv"`, loads Libertinus Serif Display from Google Fonts. |
| `examples/` | Import templates: `imports_paraugs.xlsx`, `imports_paraugs.csv`, `imports_tikai_vienibas.csv`, `imports_tikai_dokumenti.csv` |
| `files/` | Test fixtures for DevAdmin (documents, images, audio, video, `.edoc`) + `manifest.json` |
| `help-images/` | Help chapter illustrations |

> `help.html` loads a **remote font** from `fonts.googleapis.com`. This is the
> only external network dependency in an otherwise fully local application, and
> it fails silently offline (falling back to the system serif).

---

## 14.6 Testing

### Jest (`npm test`)

Only three files:

| File | Covers |
|---|---|
| `Utils/xlsxReader.test.js` | The hand-written `.xlsx` reader |
| `Help/helpDocxExport.test.js` | DOCX generation |
| `Item/MultiCreateItemsPopup.test.js` | Multi-create popup behaviour |

Testing Library (`@testing-library/react`, `/jest-dom`, `/user-event`) is
available.

### The in-browser runner

13 suites covering validation, hooks, contexts, bulk operations, import and E2E
workflows — run from DevAdmin's **Tests** tab, not by `npm test`. See
[12-devadmin.md](12-devadmin.md#126-the-in-browser-test-runner).

### The puppet

**Ctrl+Shift+F** runs the full zero-to-complete project flow against the live UI,
logging every step to the console. The fastest smoke test there is. See
[12-devadmin.md](12-devadmin.md#124-the-form-puppet).

---

## 14.7 How to: common tasks

### Add a field to an entity

Full checklist in
[07-constants-validation.md](07-constants-validation.md#711-adding-a-new-validated-field--checklist).
The short version:

1. Confirm the backend serializer accepts it, and whether it is nullable.
2. Constant + validator + Latvian message in `Constants/<domain>Constants.js`.
3. **Add it to the payload builder** — a field missing from a PUT is erased.
4. Label + placeholder in `Constants/uiStrings/<domain>UI.js`.
5. Input in `Create*`, `Edit*` and the relevant section popup. Date inputs need a
   `name` prop.
6. Entries in `ITEM_FIELD_LABELS` / `ITEM_FIELD_SECTION_LABELS` (or record
   equivalents).
7. Optionally: `bulkConstants` descriptor, `importConstants` column,
   `fieldHelp.js` entry.
8. Update the puppet recipe.

### Add an API endpoint

1. Call it from `src/hooks/<domain>.js` via `apiClient`. **Not** `src/API/`.
2. Add a `QUERY_KEYS` entry if it is cacheable.
3. Wrap in `useQuery` / `useMutation`; invalidate `QUERY_KEYS.project(projectId)`.
4. Surface errors through `setApiErrors` in the consuming form.

### Add a modal

1. Copy an existing one — `SectionEditPopup` if it edits a section, otherwise the
   `*Navigable` pattern.
2. Portal + body-scroll lock + Escape handler (blocked while busy).
3. Use `--z-index-popup`; never a raw number.
4. If it should be pickable by the help picker, add a zone to `helpZones.js`.

### Add a Smart Guide action

1. Add the id to `ACTION_TYPES` in `useGuidanceEngine.js`.
2. Add an `ACTION_HELP` entry, or it renders no help link.
3. Emit the action from the engine's queue builder for the right category.
4. Have `SmartGuideCard` dispatch a window event that some component listens for.

### Add a help chapter

1. Append to `HELP_CHAPTERS` in `helpConstants.js` with a stable `id`.
2. Add the id to `HELP_CHAPTER_IDS` in `Utils/HelpWindow.js`.
3. Use existing block types; add a `case` in `Help.js` only if you need a new one.
4. Wire `<HelpButton chapterId sectionId>` where it belongs, and optionally add a
   `helpZones.js` entry.

### Debug a failing request

1. DevAdmin → **Network** tab shows the intercepted call, timing and response.
2. `ApiError.status === 0` means network/timeout, not an HTTP code — read
   `.message` to tell them apart.
3. `error.fieldErrors` carries the parsed Django field errors; `error.data` is
   the raw body.
4. **Mocks** tab can short-circuit a response to reproduce an error state.

---

## 14.8 Gotchas that cost time

| Symptom | Cause |
|---|---|
| Blank page after switching `OPEX_BUILD` | The matching folder was never built. |
| OPEX progress modal shows a WebSocket error | Backend is running under WSGI, not uvicorn. |
| Project list is empty but projects exist | `useProjects` swallows every error and returns `[]`. Check the Network tab. |
| Editing an item wipes its related-item links | A payload was built by hand instead of with `getItemUpdatePayload`. |
| DRF rejects a create with "This field may not be null" | A CharField was sent as `null`; only `access_restriction_date` is nullable. |
| A puppet recipe times out silently | A container class or an input `name` was renamed. |
| A help zone stops highlighting | Same cause — a container class changed. |
| A form shows an empty `—` instead of a default | A stale preset value that `normalizePreset` does not know. |
| A new nested setting is `undefined` for existing users | Its group is missing from `NESTED_GROUPS`. |
| QuickJump cannot find a photo/video/audio record | `getAllRecordsFromProject()` only reads `item.records`. |
| DevAdmin QuickCreate attaches no file | `public/files/manifest.json` is stale — run `npm run manifest:public`. |
| Bulk edit blanks a field the user never touched | A `MIXED` symbol reached the payload; route values through `plain()`. |

---

## 14.9 Repo documentation map

Frontend docs (this set) live in `opex_tool_frontend/docs/`. Related documents
elsewhere in the repo:

| File | Contents |
|---|---|
| [`START.md`](../../START.md) | How to run backend + frontend |
| [`CLAUDE.md`](../../CLAUDE.md) | **Changelog is mandatory for every change** |
| [`CHANGELOG.md`](../../CHANGELOG.md) | Change history (Latvian) |
| `PROJECT_GOALS.md` | Product goals |
| `LIETOTAJA_ROKASGRAMATA.md` | End-user manual (Latvian) |
| `CSV_IMPORT_PLAN.md` | Import feature design |
| `MULTI_EDIT_PLAN.md` | Bulk edit design |
| `HELP_CONTENT_SPEC.md`, `HELP_ILLUSTRATION_SYSTEM.md`, `HELP_COMPLETION_PLAN.md`, `HELP_SUGGESTIONS.md` | Help system design |
| `DEMO_TESTA_DATI.md` | Demo data notes |
| `FULL_QA_REPORT.md`, `QA/` | QA reports |
| `Lietotaju_Pieteikumi/` | User issue register (Excel + one folder per issue) |
| `opex_tool_frontend/FRONTEND.md` | The earlier single-file developer guide |
| `opex_tool_frontend/README.md` | Script reference |
| `src/Help/README.md`, `BUILD_NOTES.md`, `INTEGRATION_EXAMPLE.md` | Help module notes |

> **Every code change must be recorded in `CHANGELOG.md`** under *Nepublicēts*,
> before reporting the work as done. Risky, unfinished or local-only changes go
> under *Nesakārtots / jāizlemj pirms commit*. See `CLAUDE.md`.
