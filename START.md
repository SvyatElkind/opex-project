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
npm run build      # production build, DevAdmin stripped
npm run build:dev  # production build with DevAdmin enabled
npm test           # run tests
```

The backend must be running before the frontend can load data — the dev server
proxies API calls to `http://localhost:8000` (see `opex_tool_frontend/package.json`
`"proxy"` field).
