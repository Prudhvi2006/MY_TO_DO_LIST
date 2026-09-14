# OrbitFlow - Real-Time Smart Productivity & Task Engine

A high-performance full-stack task management and productivity suite featuring real-time WebSocket synchronization, automated background email reminders, customizable daily morning planning digests, mission celebration modals, and automated SMTP notifications.

---

## 🚀 Key Features

- **Live WebSocket Synchronization**: Instant real-time updates across multiple open tabs and devices with debounced backend synchronization.
- **Automated SMTP Email Delivery**:
  - Instant Welcome Onboarding email on registration.
  - Scheduled Due Date Reminders (with customizable lead times).
  - Daily Morning Productivity Digests (personalized agenda based on user timezone).
  - Task Completion Celebrations & Missed Task Alerts.
  - In-app live test email dispatch button.
- **Astronaut Mission Celebration**: Interactive celebration card with high-contrast typography, motivational quotes, and smooth animations.
- **Smart Timezone Support**: Automatic browser timezone detection with manual selection (supports all IANA timezones).
- **Comprehensive CSV Export**: Complete historical task velocity, completion percentage, and notification audit logs.
- **Secure Authentication**: Email OTP verification, salted password hashing (bcrypt), and signed JWT sessions.

---

## ▲ Deploy to Vercel

OrbitFlow is pre-configured for instant deployment on Vercel:

### Option 1: Import via Vercel Dashboard (Easiest)
1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com/new](https://vercel.com/new) and click **Import** next to your repository.
3. Vercel automatically detects the configuration via `vercel.json` (Framework preset: **Vite**, Root Directory: `./`).
4. (Optional) Add your Environment Variables in the Vercel project settings:
   - `SMTP_USER`: `your-email@gmail.com`
   - `SMTP_PASSWORD`: `your-16-char-google-app-password`
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `FROM_EMAIL`: `your-email@gmail.com`
   - `JWT_SECRET`: `your-custom-jwt-secret`
5. Click **Deploy**. Your app and serverless API endpoints will be live on your `.vercel.app` domain in seconds!

### Option 2: Deploy using Vercel CLI
```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy directly from your terminal
vercel
```

---

## 📧 SMTP Email Configuration (Deployment & GitHub)

The application is built with a resilient dual-tier email delivery architecture:

### 1. Out-of-the-Box Fallback
The server includes a pre-configured default SMTP delivery engine so email reminders and verification emails dispatch immediately upon deployment without manual intervention.

### 2. Custom Environment Variables (Recommended for Production)
When deploying to **Google Cloud Run**, **Railway**, **Render**, **Docker**, or a VPS, set the following environment variables:

```bash
# SMTP Server Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-character-app-password"
FROM_EMAIL="your-email@gmail.com"

# Public Application URL (Used for links & tracking pixels in emails)
APP_URL="https://your-production-domain.com"

# Session Security
JWT_SECRET="your-strong-production-jwt-secret"
```

### 3. How to Generate a Google App Password for Gmail
If using a Gmail or Google Workspace address:
1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned **ON**.
3. Search for or navigate to **App passwords** ([direct link](https://myaccount.google.com/apppasswords)).
4. Enter an app name (e.g., `OrbitFlow Productivity`) and click **Create**.
5. Copy the generated **16-character password** (e.g. `xxxx xxxx xxxx xxxx`).
6. Paste it into `SMTP_PASSWORD` in your deployment dashboard or in the in-app **Settings &rarr; Configure Custom SMTP** panel.

---

## ⚙️ In-App SMTP Management

Users can also configure and test custom SMTP credentials directly in the app:
1. Navigate to **Settings** in the application.
2. Scroll to the **Email Delivery & Alerts** section.
3. Click **Configure Custom SMTP** to enter custom server credentials (supports Gmail, Google Workspace, SendGrid, Mailgun, Amazon SES, or custom SMTP).
4. Click **Save Preferences**.
5. Click **Send Live Test Email to My Inbox** to confirm delivery instantly.

---

## 📬 Inbox Deliverability & Spam Filter Guidance

- Check your **Promotions** or **Spam** folder if an email does not appear in your Primary tab within 30 seconds.
- Click **"Report not spam"** or drag the email into your **Primary** inbox.
- Add the sender email (`SMTP_USER`) to your **Google Contacts** so Google automatically marks all future digests and reminders as trusted.

---

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   The dev server binds to `http://localhost:3000`.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm run start
   ```

---

## 📜 License
MIT License. Built for seamless productivity and reliable task automation.
