# Simple project guide

## Main files

- `index.html` is the welcome, sign-in and account registration page. Residents can sign up directly; Admin / Staff applications require approval.
- `dashboard.html` is the dashboard frame. The browser builds the menu from the account role.
- `style.css` contains the shared page and dashboard styles.
- `portal.js` handles clicks and forms in the browser, then asks the server for data.
- `server.cjs` validates requests, checks account roles, saves records in SQLite and protects uploaded files.
- `create-admin.cjs` creates the first administrator from a private terminal. There is no administrator sign-up form.
- `tests/portal.test.cjs` runs the automated sign-in, privacy, request and staff workflow checks.

## How a request moves through the project

1. A resident signs up and gets a resident account. A Staff / Captain application remains pending until an administrator approves it; administrator accounts are created through secure provisioning.
2. The resident dashboard lists only services enabled online after an administrator verifies their requirements. The **Barangay services** page separates requestable services from other catalog examples. Sample items are labeled and must be verified with the barangay; an administrator confirms real requirements, fees and processing instructions before enabling online requests.
3. A resident selects an enabled service and sends the request form. The server checks the form and files, creates the reference number and saves the request and its first history entry.
4. Residents see only their own requests. Administrators see the resident request queue, with new requests first, and can review documents, assign staff and update status. Staff see only requests assigned to them; captains see requests waiting for their approval.
5. The server checks each status change against that user's role and the request's current status, then records the change and notifies the resident.

## Running and checking it

Open PowerShell in this project folder. Run `npm.cmd start` to start the portal and open `http://127.0.0.1:3000`. Use a second PowerShell window and run `npm.cmd run create-admin -- admin@example.org` to securely provision the first administrator. Sign in with the generated one-time password and choose a private replacement password. Follow [README.md](./README.md) for setup details. Run `npm.cmd test` to run the automated integration test.

Node.js and the built-in SQLite database are used so the example stays small and does not need additional packages. The database and private uploads are stored under `data/`; they persist when the server is restarted.
