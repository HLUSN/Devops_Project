# GitHub Webhook Setup for Automatic Jenkins Triggers

## Overview
This guide helps you configure automatic Jenkins pipeline execution when you push changes to GitHub.

## Quick Start (Local Jenkins)

1. **Expose Jenkins with ngrok**:
   ```powershell
   ngrok http 8080
   ```
   Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

2. **Enable webhook trigger in Jenkins job**:
   - Job → Configure → Build Triggers → ✅ "GitHub hook trigger for GITScm polling"

3. **Add webhook in GitHub**:
   - Repo Settings → Webhooks → Add webhook
   - Payload URL: `https://YOUR-NGROK-URL/github-webhook/`
   - Content type: `application/json`
   - Events: "Just the push event"

4. **Test**: Push a commit and watch Jenkins auto-start! 🚀

---

## Prerequisites
- Jenkins running locally on your machine (port 8080)
- ngrok installed (for exposing local Jenkins to internet)
- GitHub repository: https://github.com/HLUSN/Devops_Project.git
- Admin access to the GitHub repository
- Jenkins installed with Git plugin

---

## Step 1: Install Required Jenkins Plugins

1. Go to Jenkins Dashboard → **Manage Jenkins** → **Manage Plugins**
2. Click on **Available** tab
3. Search and install:
   - **GitHub Integration Plugin**
   - **GitHub Plugin**
   - **Git Plugin** (should already be installed)
4. Restart Jenkins if prompted

---

## Step 2: Configure Jenkins for GitHub Webhooks

### 2.1 Make Local Jenkins Accessible (Using ngrok)

Since you're running Jenkins locally, you need to expose it to the internet for GitHub webhooks to work.

1. **Download ngrok**:
   - Go to: https://ngrok.com/download
   - Or install via PowerShell:
   ```powershell
   # Using Chocolatey (if installed)
   choco install ngrok
   
   # Or download from https://ngrok.com/download and extract
   ```

2. **Run ngrok** to expose your local Jenkins:
   ```powershell
   ngrok http 8080
   ```

3. **Copy the forwarding URL**:
   - You'll see output like:
   ```
   Forwarding    https://abc123.ngrok.io -> http://localhost:8080
   ```
   - **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)
   - ⚠️ Keep the ngrok terminal window open (closing it will stop the tunnel)

4. **Important**: This URL changes each time you restart ngrok (unless you have a paid plan)
   - You'll need to update the GitHub webhook URL if you restart ngrok

### 2.2 Configure Jenkins Job

1. Go to your Jenkins job (the pipeline job)
2. Click **Configure**
3. Under **Build Triggers**, enable:
   - ✅ **GitHub hook trigger for GITScm polling**
4. Save the configuration

---

## Step 3: Configure GitHub Webhook

1. Go to your GitHub repository:
   ```
   https://github.com/HLUSN/Devops_Project
   ```

2. Click **Settings** → **Webhooks** → **Add webhook**

3. Configure the webhook:
   - **Payload URL**: `http://YOUR_NGROK_URL/github-webhook/`
     - Example: `https://abc123.ngrok.io/github-webhook/`
     - Replace with your actual ngrok URL from Step 2.1
     - ⚠️ **Important**: Don't forget the trailing slash `/`
     - ⚠️ Use the **HTTPS** URL from ngrok, not HTTP
   
   - **Content type**: `application/json`
   
   - **Secret**: (leave empty or add a secret token)
   
   - **SSL verification**: Enable (or disable if using self-signed cert)
   
   - **Which events would you like to trigger this webhook?**
     - Select: **Just the push event**
   
   - ✅ **Active** (make sure this is checked)

4. Click **Add webhook**

5. Test the webhook:
   - GitHub will send a test ping
   - Check for a green checkmark ✅ next to the webhook

---

## Step 4: Test the Automatic Trigger

1. Make a small change to your code:
   ```bash
   echo "# Test webhook" >> README.md
   git add .
   git commit -m "Test: Trigger Jenkins pipeline"
   git push origin Automation
   ```

2. Watch Jenkins:
   - Go to Jenkins Dashboard
   - Your pipeline should automatically start building within seconds
   - You'll see a new build appearing

3. Check the build log to confirm it was triggered by GitHub webhook

---

## Troubleshooting

### Webhook not triggering?

1. **Check GitHub webhook delivery**:
   - Go to Settings → Webhooks → Click on your webhook
   - Check **Recent Deliveries** tab
   - Look for Response codes:
     - ✅ `200 OK` = Working
     - ❌ `500/404/timeout` = Problem

2. **Check Jenkins logs**:
   - Go to: `Manage Jenkins → System Log`
   - Look for webhook-related errors

3. **Firewall issues**:
   - Not applicable for local Jenkins with ngrok
   - ngrok handles all port forwarding

4. **Jenkins not accessible**:
   - Make sure ngrok is still running
   - Test: Open your ngrok URL in browser (e.g., `https://abc123.ngrok.io`)
   - You should see Jenkins login page

5. **Wrong branch**:
   - Make sure you're pushing to the `Automation` branch
   - Check Jenkinsfile has correct branch in checkout stage

6. **ngrok session expired**:
   - Free ngrok sessions expire after ~2 hours
   - Restart ngrok and update GitHub webhook with new URL

### Backup: Poll SCM (Already configured)

If webhook doesn't work, the Jenkinsfile includes a fallback:
- **Poll SCM trigger**: Checks GitHub every minute for changes
- Not ideal (delayed, resource-intensive) but works without webhooks

---

## Current Configuration Summary

✅ **Jenkinsfile Updated** with triggers:
- `githubPush()` - Webhook trigger
- `pollSCM('* * * * *')` - Fallback polling every minute

✅ **Repository**: https://github.com/HLUSN/Devops_Project.git
✅ **Branch**: Automation

---

## Next Steps

1. ☐ Install Jenkins GitHub plugins
2. ☐ Enable "GitHub hook trigger" in Jenkins job
3. ☐ Add webhook in GitHub repository settings
4. ☐ Test by pushing a commit
5. ☐ Verify pipeline runs automatically

---

## Notes

- **ngrok URL changes**: Free ngrok URLs change when you restart ngrok. Update the GitHub webhook if needed.
- **Keep ngrok running**: Don't close the ngrok terminal while testing webhooks.
- The `pollSCM` trigger will work even without webhooks (checks every minute)
- Webhooks are instant and more efficient
- For production, deploy Jenkins on a public server or use ngrok pro (persistent URLs)

---

**Your pipeline will now automatically run whenever you push changes to the Automation branch!** 🚀
