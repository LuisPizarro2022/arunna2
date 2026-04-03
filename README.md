# PixelMouse (Local-Only CRM + WhatsApp Assistant)

PixelMouse is a **local-only** CRM for Windows that can run in browser (`http://localhost:3000`) or as a **portable EXE desktop app**.

## What this app does safely
- ✅ Personal CRM (accounts, contacts, tags, templates, campaigns, rules)
- ✅ Assisted sending for WhatsApp Web (manual click in WhatsApp required)
- ✅ Multi-account support using Chrome profile directories (`Default`, `Profile 2`, etc.)
- ❌ No bulk auto-send
- ❌ No WhatsApp DOM automation / bypass

---

## 1) Requirements
- Windows 10/11
- Node.js 18+
- Google Chrome

---

## 2) Quick start (web mode)

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open: `http://localhost:3000`

---

## 3) Environment variables (`.env`)

```env
DATABASE_URL="file:./dev.db"
CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

Fallback Chrome path is used if `CHROME_PATH` is not configured.

---

## 4) Multi-account WhatsApp setup (Chrome profiles)

1. Create Chrome profiles (Default, Profile 2, Profile 3...)
2. Open WhatsApp Web once in each profile and scan QR.
3. In **Accounts** page, create an account per profile and set the exact `chromeProfileDir`.
4. Use **Test launch** to verify the selected profile opens WhatsApp Web.

Manual test command:
```powershell
"C:\Program Files\Google\Chrome\Application\chrome.exe" --profile-directory="Profile 2" "https://web.whatsapp.com"
```

---

## 5) Portable EXE build (what you asked)

This creates a single Windows portable executable (no installer required):

```powershell
npm install
npx prisma generate
npm run build:desktop
npm run dist:portable
```

Output file:
- `dist/PixelMouse Portable <version>.exe`

You can copy that EXE to another Windows PC and run it directly.

### Optional one-command script
PowerShell script included:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-portable.ps1
```

---

## 6) Desktop mode for development

Runs Electron + local Next server automatically:

```bash
npm run dev:desktop
```

---

## 7) Using PixelMouse (step-by-step)

### Accounts
- Create account with `name`, optional `phoneE164`, and `chromeProfileDir`.
- Press **Test launch**.

### Contacts
- Create contacts manually or import CSV.
- CSV headers: `name,phoneE164,notes,status,tags`
- Tags in CSV use `|` separator (e.g. `buyer|vip`).
- Use filters by tag/status and export CSV when needed.

### Tags
- Create/delete tags.

### Templates
- Create template bodies with variables like `{nombre}`, `{telefono}`, `{proyecto}`, `{precio_desde}`.

### Campaigns
1. Create campaign (account + min/max delay + contacts + ordered message lines).
2. Open run screen.
3. Click **Open WhatsApp Web** (prefills message with contact data).
4. Manually send inside WhatsApp Web.
5. Click **Mark as Sent** in PixelMouse.
6. Wait for random cooldown before next item.

### Rules + Helper
- Create keyword rules (contains/starts/ends/exact).
- In Helper page, paste incoming message and select contact.
- App suggests top matching responses.
- Copy response manually or open chat with prefilled suggestion.

---

## 8) Local-only architecture
- DB: SQLite (`prisma/dev.db`)
- ORM: Prisma
- App/API: Next.js route handlers + server actions
- Desktop wrapper: Electron
- No external backend required.

---

## 9) Safety reminder
PixelMouse is intentionally designed for **assisted/manual sending only**. User must manually confirm each message send in WhatsApp Web.
