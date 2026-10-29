# Barangay Lumangbayan Online Service Portal

This project keeps the existing Barangay Lumangbayan seal and adds a server-backed resident/staff service portal. It uses Node.js' built-in HTTP and SQLite modules; no JavaScript packages or remote scripts are required.

For a short, beginner-friendly explanation of the main files and request workflow, see [PROJECT_GUIDE.md](./PROJECT_GUIDE.md).

## Requirements

- Node.js 22.13 or later (Node 24 LTS is recommended). `node:sqlite` is used by the server.
- A private, writable local data directory for the SQLite database and uploaded documents.

## Run locally (Windows PowerShell)

1. Open PowerShell in the `barangay-lumangbayan-main` project folder.
2. Check the Node version: `node --version`.
3. This project already has a `data` directory. Preserve it. Before an upgrade or first startup against existing records, make a consistent backup of the database and `data\uploads` (stop the server before copying SQLite files, or use SQLite's backup facility; do not copy only the main database file while WAL mode is active).
4. Start the backend: `npm.cmd start`. Leave this terminal running; by default it serves the pages and `/api/*` at `http://127.0.0.1:3000`.
5. To use the simplest setup, open `http://127.0.0.1:3000`. To preview `index.html` with VS Code Live Server instead, keep the backend running on port `3000`, right-click `index.html`, and choose **Open with Live Server**. Use a `localhost` or `127.0.0.1` Live Server address. The sign-in and sign-up forms send requests to the local backend, and successful sign-in opens the authenticated dashboard on the backend address. Do not open the file with `file://`; it needs the Live Server web origin and the running backend.
6. In a second PowerShell window, create the first administrator **only if this database does not already have one**:

   ```powershell
   npm.cmd run create-admin -- admin@example.org
   ```

   The command creates an administrator only when no administrator exists and refuses if one is already provisioned. Do not delete or replace the database to recreate an account. It prints a random one-time password once; run it in a private terminal, do not save or share the output insecurely, and change the password immediately after signing in. Admins sign in through the same sign-in form; administrator accounts are provisioned only through this command or an authorized administrator.

7. Sign in as administrator, change the password from **My profile**, then configure and verify service availability, local requirements, fees and processing instructions before enabling any services. Create staff/secretary and captain accounts from **Staff accounts**; the generated temporary password is shown once and must be changed at first sign-in.
8. Register a separate resident account to test the resident flow. Admin / Staff applicants can submit an application, but an administrator must approve it before it can access the portal.

To use a different port or data location, set environment variables before starting the server:

```powershell
$env:PORT = "3100"
$env:PORTAL_DATA_DIR = "C:\private\lumangbayan-data"
npm.cmd start
```

The Live Server preview connects to backend port `3000` by default. If you run the backend on another port, add that port to the Live Server URL, for example `http://127.0.0.1:5500/index.html?apiPort=3100`.

Configuration variables are listed in `.env.example`. It is an example only; this project does not automatically load `.env` files. Set variables in your shell or hosting provider, and never put private values in frontend files.

## Production deployment

The remote [GitHub repository](https://github.com/gerometemio930-pixel/barangay-lumangbayan) currently deploys its `main` branch to GitHub Pages. That branch contains a static-only site and does not include this local project's `server.cjs`; GitHub Pages cannot run this backend or its SQLite database. The workspace containing this version is not a Git checkout, so these changes have not been pushed or deployed. Do not treat the existing Pages deployment as this server-backed portal.

No backend host or automated Node.js deployment is configured. Deploy this version only to a Node.js host that supports Node 22.13 or later and provides a **private persistent disk**. The app stores accounts, sessions, requests and announcements in SQLite and stores uploaded documents on the local filesystem. It is designed for one server instance; ephemeral disks, multiple replicas, and shared/network SQLite files are not supported.

1. Deploy the project files to your Node.js host and select Node 24 LTS (or Node 22.13+).
2. Configure these environment variables in the host:
   - `NODE_ENV=production`
   - `HOST=0.0.0.0`
   - `PORT` to the port assigned by the host
   - `PORTAL_DATA_DIR` to a private, persistent mounted directory, such as `/var/lib/lumangbayan`
   - Optionally set `SESSION_TTL_HOURS` and `MAX_UPLOAD_MB` within the limits in `.env.example`.
3. Ensure the mounted directory is writable by the app process and is not served publicly. The SQLite database and `uploads` directory are created under it. Keep this same mount attached across restarts and deploys.
4. Route public traffic through the host's HTTPS endpoint or a correctly configured HTTPS reverse proxy. Do not expose the Node process, database, or upload directory directly to the internet. Production session cookies require HTTPS.
5. Before starting the server for the first time, provision the administrator with the same `PORTAL_DATA_DIR` and `NODE_ENV` environment as the app, using the host's private terminal or one-off command:

   ```sh
   npm run create-admin -- admin@example.org
   ```

   Deliver the one-time password securely, sign in, and replace it immediately. Confirm local requirements, fees, availability and processing times with the barangay before enabling any service.
6. Start the app with `npm start`, then verify `https://your-hostname/api/health`, sign-in, and a resident account. Back up the database and uploads together before deploying updates.

Do not increase the instance count or move SQLite onto an ephemeral/shared network filesystem. Multi-instance deployment requires replacing SQLite with a server database and local upload storage with private object storage; that integration is not included.

Forgot-password self-service is not configured because the project has no verified email delivery flow. Residents must contact the barangay office to confirm identity and request help. The `.env.example` values are configuration examples only; no real credentials are required or included.

## Run automated tests

```powershell
npm.cmd test
```

The integration tests start an isolated local server and database and exercise account roles, request processing, private uploads, announcements, reporting, logout and persistence. The tests do not need real resident information.

## Included workflows

- Resident sign-up creates an active `resident` and requires matching password confirmation. Admin / Staff sign-up creates a pending application; applicants cannot sign in until an administrator approves it. Administrator accounts are never publicly registered. Passwords are hashed with Node's scrypt implementation and sessions are server-side, time-limited, HttpOnly and SameSite cookies protected by per-session CSRF tokens.
- Residents can manage contact information and password, view their own request history and notifications, submit concerns, and request enabled services. They cannot read other residents' requests or private files.
- Staff can process only requests assigned to them. Captains can review requests waiting for captain approval and record an approval or rejection decision; staff and portal administrators cannot approve or mark a request ready for pickup before that decision. Administrators can configure catalog entries, assign requests, manage staff/captain roles, publish announcements, and view reports and audit activity.
- Requests have server-generated reference numbers, role-validated status transitions, status history, remarks, missing requirements, assignments and completion timestamps. Uploaded files are limited by configured size, checked for PDF/JPEG/PNG signatures, stored outside the public directory, and served only after a request-specific authorization check.
- The resident dashboard shows only services that are both enabled and verified by an administrator. The **Barangay services** page separates services that can be requested online from other catalog examples. Fifteen common service examples have editable **sample requirement checklists**. Each item is explicitly marked `[SAMPLE - VERIFY WITH BARANGAY]`, and all services start disabled. These samples are not official requirements. Administrators must confirm and edit each applicable item, remove the sample marker, confirm the barangay's requirements, and only then enable a service. The server will reject attempts to publish unverified samples.
- Service availability, eligibility, fees and processing times must be verified and configured by authorized barangay personnel. No official fee, approval rule, processing time or program availability is assumed. The sample checklist is not legal advice and does not replace instructions from the barangay, municipal social welfare office, OSCA, PDAO or the receiving government agency.

## Configuration and deployment notes

- The database and private files are local disk resources under `data/` by default. Back them up together and restrict OS access. Do not commit that folder.
- Use HTTPS, a managed/private persistent disk, tested backups, monitoring and a production security review before exposing the portal publicly. The built-in HTTP server is intended as a compact, dependency-free deployment starting point, not a substitute for a hardened reverse proxy and operational controls.
- Email delivery, password-reset emails, SMS, digital signatures, online payments, and an external document-storage provider are not configured. Forgotten-password assistance must currently be handled by authorized office personnel.
- Configure and publish official office hours, emergency contacts, holidays, signatory availability, notices and service rules through the administrator dashboard only after verification.
- Staff invitations and password resets display a one-time generated password in the administrator's browser. Deliver it over a separately verified secure channel; email delivery is intentionally not implemented.
- The application limits each upload to the configured `MAX_UPLOAD_MB` size and accepts PDF, JPEG and PNG only. It does not inspect document contents for malware; use approved endpoint protection and operational retention/deletion policies before production use.
- Public registration does not verify email addresses. Add an approved email verification and account recovery integration before relying on email identity for sensitive services.

## Test scenarios

1. **Resident:** Register; attempt an invalid login; sign in; update profile/password; submit a request with a small valid PDF and a deliberately invalid file type; check the reference, status history, receipt details, announcements and concern form. Verify another resident cannot access that reference or document URL.
2. **Staff/Secretary:** Have an administrator create a staff account and securely provide its temporary password. Change it at first sign-in. Assign a request, review it, add remarks or missing requirements, and move it through relevant processing states. Confirm an unassigned request and an approval decision are denied.
3. **Captain/Approver:** Create a captain account, change its temporary password, route a request to **Waiting for Captain's Approval/Signature**, then approve or reject with an appropriate reason. Confirm the captain cannot publish services, manage accounts or change another status.
4. **Administrator:** Create the first administrator using the CLI, change the generated password, enable a service only after verifying local details, assign requests, publish an announcement, manage staff roles, view reports, export CSV, and inspect the audit log.
5. **Persistence and session:** Stop and restart the server without removing `data/`; sign in and verify records remain. Sign out and verify API access is denied. Test the responsive navigation at phone/tablet widths and keyboard focus through forms.

## Data model

SQLite tables are initialized automatically at server start. No existing database is replaced. A first administrator is provisioned by the one-time CLI command; there are no seeded users or sample resident records.
