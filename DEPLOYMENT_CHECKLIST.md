# Deployment Checklist ✅

Use this checklist to ensure your project is ready for deployment to Render.

## Pre-Deployment Checklist

### 1. Code & Configuration ✅

- [x] `package.json` has `start` script
- [x] `server/index.js` serves static files from `/dist`
- [x] `render.yaml` is configured
- [x] `.gitignore` excludes `.env` and `node_modules`
- [x] `.env.example` is updated with all required variables
- [x] Build command works: `npm run build`
- [x] Production server works: `npm start`

### 2. Environment Variables 🔑

- [ ] Get Gemini API Key from [Google AI Studio](https://aistudio.google.com/apikey)
- [ ] Test API key locally in `.env` file
- [ ] Prepare to add these to Render:
    - `VITE_GEMINI_API_KEY` (your Gemini API key)
    - `NODE_ENV` (set to `production`)
    - `PORT` (set to `10000`)

### 3. Git Repository 📦

- [ ] Initialize git: `git init`
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Create GitHub repository
- [ ] Add remote: `git remote add origin YOUR_REPO_URL`
- [ ] Push: `git push -u origin main`

### 4. Test Locally 🧪

- [ ] Run `npm install` succeeds
- [ ] Run `npm run dev` works
- [ ] Upload CSV file works
- [ ] Chat interface works
- [ ] Charts generate correctly
- [ ] Forecast feature works
- [ ] Build succeeds: `npm run build`
- [ ] Production works: `npm start` (test at localhost:3001)

### 5. Render Setup 🚀

- [ ] Sign up for [Render](https://render.com)
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub account
- [ ] Select your repository
- [ ] Configure service:
    - Name: `data-brew-ai`
    - Build Command: `npm install && npm run build`
    - Start Command: `npm start`
    - Instance Type: `Free`
- [ ] Add environment variables
- [ ] Click "Create Web Service"

### 6. Post-Deployment 🎉

- [ ] Wait for deployment to complete (3-5 minutes)
- [ ] Visit your Render URL
- [ ] Test all features:
    - [ ] Homepage loads
    - [ ] Upload CSV works
    - [ ] Data profile displays
    - [ ] Charts render
    - [ ] Chat interface works
    - [ ] Forecast button works
    - [ ] PDF export works
- [ ] Check `/api/health` endpoint returns `{"ok": true}`
- [ ] Test on mobile device
- [ ] Share your app! 🎊

## Common Issues & Solutions

### Build Fails

```bash
# Clear cache and rebuild locally
rm -rf node_modules package-lock.json
npm install
npm run build
git add .
git commit -m "Fix build"
git push
```

### API Key Not Working

- Double-check key in Render dashboard
- Ensure key name is exactly: `VITE_GEMINI_API_KEY`
- Regenerate key if needed

### App Shows Blank Page

- Check browser console (F12)
- Check Render logs
- Verify all environment variables are set

## Quick Commands

```bash
# Local Development
npm run dev

# Production Build
npm run build

# Start Production Server
npm start

# Git Push (triggers auto-deploy)
git add .
git commit -m "Your message"
git push origin main
```

## Resources

- [Deployment Guide](DEPLOYMENT.md) - Full deployment instructions
- [README](README.md) - Project documentation
- [Render Docs](https://render.com/docs)
- [Google AI Studio](https://aistudio.google.com/apikey)

---

**Once all items are checked, you're ready to deploy! 🚀**
