# PixelMouse (Local-Only)

PixelMouse is a local-only CRM + templates + campaign queue assistant for WhatsApp Web.

## Stack
- Next.js App Router + TypeScript + TailwindCSS
- Prisma + SQLite
- Zod validation

## Safety design
- **No bulk auto-send** and **no WhatsApp DOM automation**.
- Campaigns are **assisted sending**:
  1. PixelMouse opens WhatsApp Web with prefilled message.
  2. User manually clicks Send in WhatsApp.
  3. User clicks "Mark as Sent" in PixelMouse.

## Prerequisites
- Node.js 18+
- Windows + Google Chrome

## Setup
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Open http://localhost:3000

## Environment variables
```env
DATABASE_URL="file:./dev.db"
CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```
If `CHROME_PATH` is missing, PixelMouse falls back to common Chrome location.

## Multiple WhatsApp accounts with Chrome profiles
1. In Chrome, create profiles (Default, Profile 2, etc.).
2. Open each profile once and login to WhatsApp Web in that profile.
3. In `/accounts`, create one account per profile with matching `chromeProfileDir`.
4. Use **Test launch** to verify profile opens WhatsApp Web session.

## Linking WhatsApp account to a profile
- Launch Chrome profile manually if needed:
  - `chrome.exe --profile-directory="Default" https://web.whatsapp.com`
- Scan QR once for that profile.
- Future launches from PixelMouse reuse that session.

## CSV import/export
- Import columns: `name,phoneE164,notes,status,tags`
- `tags` can use `|` separator, e.g. `buyer|vip`.

## Campaign run flow
- Create campaign with account + delay range + contacts + message lines.
- Run campaign queue.
- Click **Open WhatsApp Web** (opens selected profile + prefilled text).
- Manually send in WhatsApp.
- Click **Mark as Sent** or **Skip**.
- Random cooldown is shown before next send action.

## Offline behavior
Everything is local and offline except WhatsApp Web access itself.
