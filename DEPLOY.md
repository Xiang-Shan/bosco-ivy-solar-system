# Deploy to Netlify (Free) via GitHub

Target URL: **https://bosco-ivy-solar-system.netlify.app**

This is 100% free on Netlify's Starter plan. No credit card. No "AI deploy" charges (that's a different product).

---

## Step 1 — Open Terminal in this folder

```bash
cd ~/Claude/Bosco/solar-system
```

## Step 2 — Remove the partial .git folder (one-time cleanup)

The sandbox left a half-initialized `.git`. Delete it so we start clean:

```bash
rm -rf .git
```

## Step 3 — Initialize git and make the first commit

```bash
git init -b main
git add .
git commit -m "Initial commit: Bosco Ivy solar system"
```

## Step 4 — Create an empty GitHub repo

1. Go to https://github.com/new
2. Repository name: `bosco-ivy-solar-system`
3. Leave it **Public** (Private also works on free Netlify, but Public is simpler)
4. **Do NOT** check "Add README", "Add .gitignore", or "Add license" — the repo must be empty
5. Click **Create repository**

## Step 5 — Push your code to GitHub

Copy the two commands GitHub shows you, or use these (replace `YOUR-USERNAME`):

```bash
git remote add origin https://github.com/YOUR-USERNAME/bosco-ivy-solar-system.git
git push -u origin main
```

If prompted for a password, use a **GitHub Personal Access Token** (not your password):
https://github.com/settings/tokens → "Generate new token (classic)" → scope: `repo`.

## Step 6 — Connect Netlify to the GitHub repo

1. Go to https://app.netlify.com/
2. Sign in (you can use "Sign up with GitHub" if you don't have a Netlify account)
3. Click **Add new site → Import an existing project**
4. Choose **GitHub** as your Git provider, authorize Netlify
5. Pick the `bosco-ivy-solar-system` repository
6. Build settings (leave defaults — the included `netlify.toml` handles this):
   - Build command: *(leave empty)*
   - Publish directory: `.`
7. Click **Deploy site**

It will deploy in ~10 seconds. You'll get a random URL like `https://lovely-cupcake-12345.netlify.app`.

## Step 7 — Rename the site to `bosco-ivy-solar-system`

1. In your Netlify site dashboard → **Site configuration → Site details → Change site name**
2. Enter: `bosco-ivy-solar-system`
3. Save

Your site is now live at: **https://bosco-ivy-solar-system.netlify.app**

> If the name is already taken, try `bosco-ivy-solar` or add a suffix like `-app`.

## Step 8 — Future updates (auto-deploy)

Anytime you change the site:

```bash
git add .
git commit -m "Update solar system"
git push
```

Netlify rebuilds automatically. Free, unlimited deploys on the Starter plan.

---

## What's in this folder

| File | Purpose |
|---|---|
| `index.html` | The page Netlify serves at `/` |
| `bosco-solar-system.html` | Original copy (kept for reference) |
| `netlify.toml` | Tells Netlify to publish from this folder |
| `.gitignore` | Keeps `.zip`, `.DS_Store`, etc. out of git |
| `README.md` | Public description for the GitHub repo |
| `solar-system.zip` | Excluded from git by `.gitignore` |

## Cost

- Netlify Starter (free) covers: 100 GB bandwidth/month, unlimited sites, HTTPS, auto-deploy from git.
- GitHub free covers: unlimited public repos.
- Total cost: **$0**.

The "AI deploy" feature you saw is Netlify's optional paid Agent Runner. You're not using it — your deploy is a plain static-file deploy.
