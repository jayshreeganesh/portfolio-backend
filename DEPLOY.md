# Deploying the backend (so the live site's features work)

The site at https://jayshreeganesh.github.io/portfolio-website/ currently shows a
"email me directly" message on the contact form and hides the visitor counter,
because `API_BASE` still points at `localhost`. This guide makes both work live.

Everything below uses **free tiers**. Total time: ~15 minutes.

---

## Step 1 — MongoDB Atlas (free cloud database)

Your local MongoDB isn't reachable from the internet, so the hosted API needs a
cloud database.

1. Sign up at **https://www.mongodb.com/cloud/atlas/register**
2. Create a **free M0 cluster** (any provider/region — pick one near you).
3. **Database Access** → *Add New Database User*
   - Username + password (use a generated password, and **save it**).
4. **Network Access** → *Add IP Address* → **Allow access from anywhere**
   (`0.0.0.0/0`).
   > Required because Render's outbound IPs aren't fixed on the free plan.
5. **Clusters** → *Connect* → *Drivers* → copy the connection string. It looks like:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. Insert the database name `portfolio` before the `?`:

   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

   Replace `USER`/`PASSWORD` with the values from step 3. If your password has
   special characters, URL-encode them (`@` → `%40`, `#` → `%23`).

---

## Step 2 — Deploy the API to Render

1. Sign up at **https://render.com** (log in with GitHub).
2. **New** → **Blueprint** → select the `portfolio-backend` repo.
   Render reads [`render.yaml`](./render.yaml) and configures the service.
   *(Or: **New** → **Web Service**, build `npm ci`, start `npm start`.)*
3. When prompted for environment variables, set:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | the Atlas string from Step 1 |
   | `CORS_ORIGIN` | `https://jayshreeganesh.github.io` |
   | `TRUST_PROXY` | `true` |

   > `CORS_ORIGIN` is the **origin only** — no `/portfolio-website` path, no
   > trailing slash. Add `,http://localhost:8000` if you also want local testing
   > against the hosted API.
   >
   > Don't set `PORT` — Render injects it.

4. Deploy, then confirm it's up:

   ```
   https://YOUR-SERVICE.onrender.com/api/health   →   {"ok":true,"status":"up"}
   ```

---

## Step 3 — Point the frontend at the hosted API

In **`portfolio-website/script.js`**, change the one marked line near the top:

```js
const API_BASE = "https://YOUR-SERVICE.onrender.com";
```

Then commit and push — GitHub Pages redeploys automatically:

```bash
cd portfolio-website
git commit -am "config: point API_BASE at hosted backend"
git push
```

For the **React** app, set `portfolio-react/.env` instead:

```
VITE_API_URL=https://YOUR-SERVICE.onrender.com/api/contact
```

---

## Step 4 — Verify

Open the live site and check:

- **Footer** shows a visitor count (it was hidden before).
- **Contact form** submits and says "your message has been sent".
- Messages appear in Atlas under **portfolio → messages**, and the count under
  **portfolio → counters**.

---

## Known free-tier caveat

Render's free web services **sleep after ~15 minutes idle**. The first request
after that takes 30–60s to wake the container, so the very first page load may
show the counter late and a submission may feel slow. Paid plans and some other
hosts (Fly.io, Railway) avoid this.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Counter still hidden | `API_BASE` still `localhost`, or the API is asleep — hit `/api/health` first |
| CORS error in console | `CORS_ORIGIN` must be `https://jayshreeganesh.github.io`, origin only |
| `MongooseServerSelectionError` | Atlas Network Access missing `0.0.0.0/0`, or a bad password in the URI |
| Form says "server unavailable" | Service is down/asleep, or the URL has a typo |
| Rate-limited too aggressively | `TRUST_PROXY` isn't `true`, so all users share one IP bucket |
