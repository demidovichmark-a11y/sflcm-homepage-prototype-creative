# Bugbot review rules

Bugbot comments; it never approves or merges anything. Vera's PASS, green CI, and Mark's merge OK are the gate.

## Always flag (blocking)

- **Real client data (PII).** No real names, emails, phone numbers, addresses, student or family details, or other client records in code, tests, fixtures, seeds, logs, or docs. Tests use clearly fake data (example.com / 555-01xx style).
- **Secrets.** No API keys, OAuth tokens, passwords, private keys, session cookies, or webhook secrets committed or printed to logs. Config comes from env vars or the keychain.
- **`send_approval_lock.json` must never be modified, created, deleted, or overwritten** by code, tests, scripts, or fixtures (tests must use a temp path).

## Extra scrutiny for this repo

- Static preview-only prototype (`index.html`, `assets/`). Flag real student/family photos or names without clear consent, tracking scripts, form posts to live endpoints, and any embedded API key.
- Opus1, billing, and Tesla code do not belong here; flag any added.

## Skip

- Style, formatting, naming, and wording nitpicks.
- Pre-existing issues in code this PR does not touch. Review the diff, not old code.
