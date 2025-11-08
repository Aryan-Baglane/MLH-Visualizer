# Deployment Guide - Render

This guide will walk you through deploying **Data Brew AI** to Render.

## 📋 Prerequisites

1. A [GitHub](https://github.com) account
2. A [Render](https://render.com) account (free tier available)
3. A [Gemini API Key](https://aistudio.google.com/apikey) from Google AI Studio

## 🚀 Quick Deploy to Render

### Step 1: Prepare Your Repository

1. **Create a GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Data Brew AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. **Log in to Render**
    - Go to [https://render.com](https://render.com)
    - Click "Get Started" or "Sign In"

2. **Create a New Web Service**
    - Click "New +" button
    - Select "Web Service"
    - Connect your GitHub account (if not already connected)
    - Select your repository

3. **Configure the Web Service**

   Use these settings:

   | Setting | Value |
      |---------|-------|
   | **Name** | `data-brew-ai` (or your preferred name) |
   | **Region** | Choose closest to your location |
   | **Branch** | `main` |
   | **Root Directory** | (leave blank) |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` |

4. **Add Environment Variables**

   Click "Advanced" and add:

   | Key | Value |
      |-----|-------|
   | `VITE_GEMINI_API_KEY` | Your Gemini API key from Google AI Studio |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |

   **Note:** The `VITE_GEMINI_API_KEY` is only used server-side and users will never see a popup requesting an API key.

5. **Deploy**
    - Click "Create Web Service"
    - Render will automatically build and deploy your app
    - This usually takes 3-5 minutes

6. **Access Your App**
    - Once deployed, you'll get a URL like: `https://data-brew-ai.onrender.com`
    - Click the URL to access your live application!

## 🔑 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your Render environment variables

**Important:** The API key is stored server-side only. Users of your deployed app will never be prompted for an API
key - all AI features work automatically using the key you configure in Render.

## ⚙️ Configuration Files

The project includes these deployment files:

- **`render.yaml`** - Render configuration (automated deployment)
- **`package.json`** - Includes `start` script for production
- **`server/index.js`** - Production server that serves built frontend
- **`.env.example`** - Template for environment variables

## 🌐 Custom Domain (Optional)

To use your own domain:

1. In Render dashboard, go to your service
2. Click "Settings"
3. Scroll to "Custom Domains"
4. Click "Add Custom Domain"
5. Follow the instructions to configure DNS

## 🔄 Automatic Deployments

Render automatically deploys when you push to your `main` branch:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main

# Render will automatically redeploy!
```

## 🐛 Troubleshooting

### Build Fails

**Problem:** Build fails with dependency errors

**Solution:**

```bash
# Delete node_modules and package-lock.json locally
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Commit and push
git add .
git commit -m "Fix dependencies"
git push origin main
```

### API Key Not Working

**Problem:** Gemini API returns 404 or authentication errors

**Solution:**

1. Verify your API key in Render dashboard under Environment Variables
2. Make sure the key name is exactly: `VITE_GEMINI_API_KEY`
3. Regenerate the API key at Google AI Studio if needed
4. Update the key in Render and manually redeploy

### App Not Loading

**Problem:** App shows blank page or loading forever

**Solution:**

1. Check Render logs: Dashboard → Your Service → Logs
2. Look for JavaScript errors in browser console (F12)
3. Ensure all environment variables are set correctly
4. Try a manual deploy: Dashboard → Your Service → Manual Deploy → "Clear build cache & deploy"

### Server Not Starting

**Problem:** "Application failed to respond" error

**Solution:**

1. Check that `PORT` environment variable is set to `10000`
2. Verify the start command is: `npm start`
3. Check logs for any server errors
4. Ensure `server/index.js` exists and is not modified

## 📊 Performance Tips

### Free Tier Limitations

Render's free tier includes:

- ⏱️ **750 hours/month** of runtime
- 💤 **Spins down after 15 minutes** of inactivity
- 🐌 **First request may take 30-60 seconds** (cold start)

### Keeping Your App Active

To prevent cold starts, consider:

1. Using a paid tier ($7/month for always-on)
2. Using an uptime monitoring service (like UptimeRobot)
3. Accepting the cold start delay on free tier

## 🔒 Security Best Practices

1. **Never commit `.env` file** to Git (already in `.gitignore`)
2. **Regenerate API keys** if accidentally exposed
3. **Use Render's environment variables** for sensitive data
4. **Keep dependencies updated**: `npm audit fix`

## 📈 Monitoring

Monitor your deployment:

1. **Render Dashboard**
    - View logs in real-time
    - Monitor CPU and memory usage
    - Check deployment history

2. **Application Health**
    - Your app has a health endpoint: `https://your-app.onrender.com/api/health`
    - Should return: `{"ok": true}`

## 🎉 Success!

Once deployed, your app will be live at:

```
https://data-brew-ai.onrender.com
```

You can now:

- ✅ Upload CSV files
- ✅ Chat with AI assistant
- ✅ Generate automatic charts
- ✅ Create forecasts
- ✅ Export dashboards as PDF

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)
- [Google AI Studio](https://aistudio.google.com)

## 💡 Need Help?

- Check Render logs for errors
- Review this deployment guide
- Verify all environment variables are set
- Try clearing build cache and redeploying

---

**Happy Deploying! 🚀**
