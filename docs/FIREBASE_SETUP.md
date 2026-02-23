# Firebase Setup Guide

## Step 2: Enable Firestore

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll deploy custom rules later)
4. Select your preferred region (e.g., `asia-east2` for Hong Kong)
5. Click **"Enable"**

## Step 3: Enable Authentication with Email Link

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable only "Email link (passwordless sign-in)"** (toggle the second switch)
6. Click **"Save"**

## Step 4: Add Authorized Domains

1. Still in Authentication > Sign-in method
2. Scroll down to **"Authorized domains"**
3. You should see `localhost` already listed
4. Keep this for now - we'll add your Vercel domain later

## Step 5: Get Firebase Config

1. Go to Project Settings (gear icon ⚙️ in left sidebar)
2. Scroll down to **"Your apps"**
3. Click the **Web icon** `</>`
4. Register app with nickname: "Shanghai Forum"
5. **DO NOT** enable Firebase Hosting
6. Click **"Register app"**
7. Copy the `firebaseConfig` object

You'll see something like:
```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

## Step 6: Generate Service Account Key

1. In Project Settings, go to **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the popup
4. A JSON file will download - **keep this file secure!**
5. Open the JSON file and find:
   - `client_email` (looks like `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com`)
   - `private_key` (long string starting with `-----BEGIN PRIVATE KEY-----`)

## Next Steps

Once you have all these values, I'll help you fill in `.env.local` properly.
