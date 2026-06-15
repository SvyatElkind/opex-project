# OPEX — Start Commands

OPEX is a **local desktop application**. The React frontend talks to a local
Django REST backend on `http://localhost:8000` (proxied during `npm start`).
Run each part in its own terminal.

---

## Backend (Django — port 8000)

From the project root (`opex-project/`):

### PowerShell

```powershell
.\.venv\Scripts\Activate.ps1     # activate virtual environment
pip install -r requirements.txt  # first time / after dependency changes
python manage.py migrate         # first time / after model changes
uvicorn opex_project.asgi:application --host 127.0.0.1 --port 8000 --reload
```

### bash / cmd

```bash
.venv\Scripts\activate           # cmd
# source .venv/Scripts/activate  # git bash
pip install -r requirements.txt
python manage.py migrate
uvicorn opex_project.asgi:application --host 127.0.0.1 --port 8000 --reload
```

> The app uses Django Channels (WebSockets), so it runs under ASGI via
> **uvicorn**, not `manage.py runserver`. The ASGI entry point is
> `opex_project/asgi.py` → `application`. Drop `--reload` for production.

---

## Frontend (React — port 3000)

From the project root, in a second terminal:

```bash
cd opex_tool_frontend
npm install        # first time / after dependency changes
npm start          # dev server, DevAdmin ON  -> http://localhost:3000
```

Other useful frontend scripts:

```bash
npm run build      # production build -> build/      (DevAdmin stripped, no test fixtures, ~9 MB)
npm run build:dev  # dev build        -> build-dev/  (DevAdmin enabled + test fixtures, ~340 MB)
npm test           # run tests
```

The two builds go to **separate folders** so you can keep both at once.

---

## Switching which build the backend serves

Django serves one build folder at a time. Pick it with the `OPEX_BUILD`
setting near the top of the static-files section in `opex_project/settings.py`:

```python
OPEX_BUILD = os.environ.get('OPEX_BUILD', 'production')
#   'production' -> opex_tool_frontend/build/      (clean, for end users)
#   'dev'        -> opex_tool_frontend/build-dev/  (DevAdmin + test fixtures)
```

To switch, either:

- **Edit the default** — change `'production'` to `'dev'` in that line, then restart the backend; or
- **Set the env var** for one run (overrides the default, no file edit):

  ```powershell
  $env:OPEX_BUILD = 'dev'                       # PowerShell
  uvicorn opex_project.asgi:application --host 127.0.0.1 --port 8000
  ```

Build the matching folder before serving it (`npm run build` for production,
`npm run build:dev` for dev). Neither build folder is committed to git — each
machine builds its own.

The backend must be running before the frontend can load data — the dev server
proxies API calls to `http://localhost:8000` (see `opex_tool_frontend/package.json`
`"proxy"` field).
