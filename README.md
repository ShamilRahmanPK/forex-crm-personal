# TradeCRM frontend

White-label forex CRM: a client portal for traders and a back office for staff.
React 19 + Vite + React Router. All data is mocked in the browser for now.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run lint
```

## Two apps in one

| | URL | Who |
|---|---|---|
| Client portal | `/` → `/accounts/sign-in` → `/pa/...` | Traders |
| Back office | `/admin/login` → `/admin/...` | Staff |

The two have separate sessions, so you can be signed in to both at once (use two tabs).

### Signing in

**Client portal:** go to `/accounts/sign-in` and enter any valid email and any password.

**Admin:** go to `/admin/login`. Any password works with these demo staff emails:

| Email | Role | Can access |
|---|---|---|
| `admin@example.com` | Owner | Everything, including Branding and Team |
| `compliance@example.com` | Compliance | Dashboard, Clients, ID checks |
| `finance@example.com` | Finance | Dashboard, Clients, Transactions |
| `support@example.com` | Support | Dashboard, Clients, Support tickets |

Any other email signs in as an Owner, so the demo is never blocked.

> These are mock logins. Before going live, replace `adminSignIn` in
> `src/admin/api.js` with your real staff authentication (and enforce roles on
> the server, not only in the UI).

## Try the full loop

1. In tab 1, sign in to the portal and complete verification up to uploading an ID document.
2. In tab 2, sign in at `/admin/login` as `admin@example.com`.
3. Open **ID checks**. The portal user appears as "Demo user". Review it, then approve or reject it.
4. Back in the portal, the Verification page updates and deposits unlock.
5. Open a support ticket in the portal, then reply to it from **Support tickets** in the admin.
6. Change the main color in **Settings → Branding** and save. The portal restyles.

## Where things live

```
src/
  config/brand.js          Tenant brand: logo, colors, fonts, copy, legal text, KYC settings
  config/questionnaire.js  Appropriateness questions (data, per tenant)
  config/support.js        Ticket topics and FAQ
  services/api.js          Portal mock API: replace with real fetch() calls
  admin/api.js             Back-office mock API
  admin/                   Back-office layout, auth, pages
  layouts/, pages/         Client portal
  features/verification/   Onboarding + KYC flow
  components/ui/           Shared components (Button, Modal, Drawer, fields…)
  styles/tokens.css        Design tokens (overwritten at runtime from the brand)
```

## Admin settings

**Admin → Settings** (Owner role) covers: General, Branding, Team, MT5 servers,
Account types, Payment methods, Email, SMS, Identity verification and Security.

- Settings are stored by `src/services/platformConfig.js` (localStorage in the
  mock). The client portal reads account types, payment methods and KYC rules from it.
- Secrets (MT5 manager password, API keys, SMTP password) are write-only: after
  saving, the UI only shows `••••last4`. Keep that contract in the real API.
- MT5 "Test connection" and "Sync groups" are simulated in `src/admin/settingsApi.js`.
  In production they must be backend endpoints that use the MT5 Manager API. The
  browser can't and shouldn't connect to MT5 directly.

## Branding per tenant

Everything visual comes from `src/config/brand.js`. Owners can also change the
name, logo text, colors, font and corner style from **Admin → Settings → Branding**.
In this mock those edits are saved in the browser. In production, store them per
tenant and pass a loader to `<BrandProvider loadBrand={…}>` in `src/App.jsx`.

To demo verification without staff review, set `kyc.mockAutoApprove: true` in
`brand.js`; documents then approve themselves after a few seconds.
