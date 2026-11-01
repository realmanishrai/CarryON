# CarryON AI — The AI Recovery Layer for the Internet

CarryON AI is an AI-powered browser workflow intelligence and recovery layer designed to prevent progress loss, resolve validation roadblocks, and automate context-aware workflows across complex web forms (such as job, internship, scholarship, and onboarding portals).

Conventional assistants simply answer user questions in an isolated chat window. CarryON takes a fundamentally different approach:
- Directly observes and interacts with webpage DOM elements.
- Identifies form field semantic intent and constraints.
- Injects non-intrusive, isolated inline visual highlights and diagnostic tooltips.
- Provides user-approved autofill using locally saved, structured profile memory.
- Maintains a persistent state machine of workflow progress and checkpoints.
- Performs **Recovery Replay** to restore interrupted sessions after crashes, reloads, or session timeouts.

---

## 1. System Architecture & Tech Stack

```text
USER IN CHROME
      │
      ▼
┌───────────────────────────────┐
│     TARGET APPLICATION        │
│   (HTML / Forms / Errors)     │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│            CHROME EXTENSION (MV3)             │
│  ┌──────────────────────┐  ┌───────────────┐  │
│  │    Content Script    │  │  React Side   │  │
│  │ (DOM Engine/Overlay) │  │   Panel UI    │  │
│  └──────────┬───────────┘  └───────┬───────┘  │
│             │                      │          │
│             ▼                      ▼          │
│         Background Service Worker             │
└───────────────────────┬───────────────────────┘
                        │ REST API (JSON)
                        ▼
┌───────────────────────────────────────────────┐
│                FASTAPI BACKEND                │
│  ┌─────────────────┐     ┌─────────────────┐  │
│  │ Workflow Service│     │    AI Service   │  │
│  └────────┬────────┘     └────────┬────────┘  │
│           │                       │           │
│           ▼                       ▼           │
│   SQLite Database            OpenAI API       │
│    (carryon.db)          (Structured Schema)  │
└───────────────────────────────────────────────┘
```

- **Frontend / Extension**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, Chrome Extension Manifest V3, Chrome Side Panel API, MutationObserver, Shadow DOM.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2, SQLite, Uvicorn.
- **AI Integration**: OpenAI Python SDK with Structured Outputs and robust heuristic/deterministic fallback when an API key is not present.
- **Testing**: Pytest, Vitest, React Testing Library, JSDOM.

---

## 2. Prerequisites & Dependencies

Before beginning, install the following tools:

1. **Git**: [https://git-scm.com/](https://git-scm.com/) (Version 2.30+ recommended).
2. **Node.js & npm**: [https://nodejs.org/](https://nodejs.org/) (Node 18.x or 20.x+; npm 9.x+ recommended).
3. **Python**: [https://www.python.org/](https://www.python.org/) (Python 3.10, 3.11, 3.12, 3.13, or 3.14).
4. **Google Chrome**: [https://www.google.com/chrome/](https://www.google.com/chrome/) (Chromium version 116+ supporting Side Panel API).
5. **OpenAI API Key** *(Optional)*: If you want live LLM generation. CarryON automatically runs in deterministic mode if no key is configured!

---

## 3. Complete First-Time Setup Guide

### Windows (PowerShell) — Recommended
Run the following sequential commands in Windows PowerShell:

```powershell
# 1. Clone repository
git clone https://github.com/<your-org>/CarryON.git
cd CarryON

# 2. Set up Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Install backend dependencies
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt

# 4. Configure environment file
Copy-Item .env.example .env

# 5. Install extension dependencies & build Chrome extension
cd extension
npm install
npm run build
cd ..

# 6. Verify automated tests pass
.\.venv\Scripts\pytest backend\tests -v
cd extension; npm test; cd ..
```

### macOS / Linux (Bash / Zsh)
```bash
# 1. Clone repository
git clone https://github.com/<your-org>/CarryON.git
cd CarryON

# 2. Set up Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install backend dependencies
pip install --upgrade pip
pip install -r backend/requirements.txt

# 4. Configure environment file
cp .env.example .env

# 5. Install extension dependencies & build Chrome extension
cd extension
npm install
npm run build
cd ..

# 6. Verify automated tests pass
pytest backend/tests -v
cd extension && npm test && cd ..
```

---

## 4. Environment Configuration

The repository includes a `.env.example` file. Create your local `.env` by copying `.env.example`:

```ini
# OpenAI API Configuration (Optional - deterministic engine operates if omitted)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Backend Server Configuration
HOST=127.0.0.1
PORT=8000
DATABASE_URL=sqlite:///./carryon.db
CORS_ORIGINS=["*"]
```

> [!IMPORTANT]
> Never commit `.env` or any real API keys to Git. The `.gitignore` is preconfigured to ignore `.env`, `carryon.db`, `.venv/`, and `node_modules/`.

---

## 5. Running the Complete Application

To run the full CarryON environment, open three terminal windows:

### Terminal 1: Start FastAPI Backend
```powershell
# In CarryON root:
.\.venv\Scripts\uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

### Terminal 2: Start Controlled Demo Website
```powershell
# In CarryON root:
.\.venv\Scripts\python demo-website\server.py 8080
```
- Portal Home: `http://localhost:8080/index.html`
- Interactive Application: `http://localhost:8080/application.html`

### Terminal 3: Build or Watch the Extension (Optional during development)
```powershell
cd extension
npm run build
# Or for live rebuild on changes:
npm run dev
```

---

## 6. Chrome Extension Installation Guide

1. Open Google Chrome.
2. In the URL address bar, enter: `chrome://extensions` and press Enter.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. In the file picker, select the compiled extension directory:
   ```text
   C:\Dev\CarryON\extension\dist
   ```
6. The extension **"CarryON AI — Workflow Intelligence & Recovery"** will appear in your installed extensions list.
7. Click the Chrome Extensions puzzle icon in the toolbar and pin CarryON.
8. Navigate to `http://localhost:8080/application.html` and click the CarryON icon. The Side Panel will slide open!

### How to Reload After Code Changes
- If you edit extension code, run `npm run build` in `extension/`.
- On `chrome://extensions`, click the circular reload arrow on the CarryON card.
- Refresh the target webpage.

---

## 7. Database Setup & Inspection

- **Location**: `carryon.db` (created automatically in the repository root on first run).
- **SQLite Pragma**: `PRAGMA foreign_keys=ON` is automatically enabled on every connection.
- **Tables**:
  - `user_profiles`: Stores local user profile credentials and skills.
  - `workflows`: Tracks title, URL, current step, total steps, and status.
  - `workflow_steps`: Tracks step details and blocker status.
  - `checkpoints`: Stores JSON state snapshots for Recovery Replay.
- **Safe Reset**: If you wish to reset your development database, delete `carryon.db`. The backend will recreate empty tables on next startup.

---

## 8. Automated Testing

Execute the complete test suite across backend and frontend:

```powershell
# 1. Backend tests (14 tests)
.\.venv\Scripts\pytest backend\tests -v

# 2. Frontend & DOM engine tests (18 tests)
cd extension
npm test
cd ..
```

All 32 tests pass out-of-the-box in isolated in-memory test environments.

---

## 9. Controlled Demonstration Scenarios

Open `http://localhost:8080/application.html` in Chrome with the CarryON side panel open.

| Scenario | What to do | Expected CarryON Behavior |
| :--- | :--- | :--- |
| **Scenario A: Invalid Phone Number** | On Step 1, enter `phone123` in Phone Number. | CarryON flags alphabetic characters, draws a red highlight around the field, and injects an inline explanation card. |
| **Scenario B: Missing Required Fields** | Leave required fields empty and click "Next Section". | CarryON detects missing fields and provides a "Locate in Page" button that smoothly scrolls to the field. |
| **Scenario C: Invalid Experience** | On Step 3, enter `-2` into Years of Experience. | CarryON flags negative experience and offers a "Quick Fix" button. |
| **Scenario D: Smart Autofill** | Save credentials under the **Profile** tab, reload application, and open **Autofill**. | CarryON matches credentials (e.g. college &rarr; institution) with confidence scores. Clicking **Approve & Autofill** populates the inputs. |
| **Scenario E: Recovery Replay** | Fill Steps 1 & 2, click **Save Checkpoint**, then click **⚡ Simulate Session Interruption** (or reload). | CarryON retains the checkpoint. In the **Recovery** tab, click **Restore Saved Progress** to restore your data. |
| **Scenario F: File Validation** | On Step 4, upload an invalid file (e.g. `.exe` or `> 5MB`). | CarryON flags format/size incompatibility based on visible portal constraints. |

---

## 10. Troubleshooting Guide

1. **`uvicorn: command not found` / Python packages missing**:
   - Verify you activated the virtual environment: `.\.venv\Scripts\Activate.ps1` (or `source .venv/bin/activate`).
   - Run `python -m pip install -r backend\requirements.txt`.
2. **`npm install` errors**:
   - Ensure Node.js version is $\ge 18$. Run `node -v`.
   - Run `npm cache clean --force` and retry.
3. **Port 8000 or 8080 in use**:
   - Specify another port: `uvicorn backend.main:app --port 8001` and update the backend URL in the extension settings modal.
4. **Chrome extension fails to load (`Manifest file is missing or unreadable`)**:
   - Ensure you selected `extension/dist` (the compiled folder) and not the source folder.
   - Run `npm run build` in `extension/` first.
5. **Side Panel does not open on icon click**:
   - Right-click the extension icon in Chrome toolbar and select "Open side panel".
   - Ensure Chrome is version 116 or higher.
6. **Autofill does not update React controlled forms**:
   - CarryON uses native descriptor setters (`prototypeValueSetter.call(el, value)`) and dispatches `input`, `change`, and `blur` events with `bubbles: true`.
7. **OpenAI API Key errors (`401 Unauthorized` or quota exceeded)**:
   - CarryON seamlessly falls back to the deterministic engine. Check `.env` configuration or leave `OPENAI_API_KEY` blank to use offline heuristics.

---

## 11. Setting Up CarryON on a New Developer's Machine Using AntiGravity

If you are a new developer setting up CarryON in AntiGravity, paste this exact prompt into AntiGravity:

```text
You are onboarding a new developer to the CarryON AI project. First, read the complete README.md and inspect the repository. Follow the documented setup instructions for this operating system. Check installed versions of Python, Node.js, npm, and Git. Create the required virtual environment, install all backend and frontend dependencies, configure local environment files using .env.example, and build the Chrome extension. Do not overwrite existing source code or shared configuration. Never create, expose, or commit real API keys. Once setup is complete, run the available tests, verify that the backend and frontend start successfully, and report any remaining issues. Explain the commands required to run the entire project locally. If something fails, diagnose and fix it where possible.
```

---

## 12. Team Development Workflow (4 Developers)

- **Branches**:
  - `main`: Production-ready, verified code only.
  - `dev`: Active integration branch.
  - `feature/frontend`: Extension React sidepanel UI and styles.
  - `feature/backend`: FastAPI routers, database models, and services.
  - `feature/dom-engine`: Content scripts, error detection, and Shadow DOM overlays.
  - `feature/demo-testing`: Demo website enhancements and automated tests.
- **Workflow**:
  1. Pull latest `dev`: `git pull origin dev`
  2. Create feature branch: `git checkout -b feature/<name>`
  3. Commit cleanly: `git commit -m "feat(dom): enhance phone regex error detection"`
  4. Run automated tests before pushing: `pytest backend/tests` and `npm test`
  5. Open Pull Request into `dev`.

---

## 13. Project Documentation Links

- [Architecture Specification](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API.md)
- [Testing & Verification Guide](docs/TESTING.md)
