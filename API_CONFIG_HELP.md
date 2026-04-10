# AIDNET 2.0: API Keys & Configuration Guide

To get AIDNET 2.0 fully functional (beyond the "Mock Mode"), you need to set up a Firebase project and obtain your configuration keys.

## 1. Firebase Configuration (Primary Requirement)
The app uses Firebase Realtime Database for emergency broadcasting and status tracking.

### Step-by-Step Instructions:
1.  **Create a Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and click **"Add project"**. Name it "AIDNET" (or anything you like).
2.  **Add a Web App**: 
    *   On the Project Overview page, click the **Web icon (</>)** to register a new web app.
    *   Name the app (e.g., "AIDNET-Mobile").
3.  **Get the Config Object**: 
    *   Once registered, Firebase will show you a `firebaseConfig` object.
    *   It looks like this:
        ```javascript
        const firebaseConfig = {
          apiKey: "AIza...",
          authDomain: "aidnet-xxxx.firebaseapp.com",
          databaseURL: "https://aidnet-xxxx.firebaseio.com",
          projectId: "aidnet-xxxx",
          storageBucket: "aidnet-xxxx.appspot.com",
          messagingSenderId: "123456789",
          appId: "1:123456789:web:abcdef"
        };
        ```
4.  **Enable Realtime Database**:
    *   In the Firebase sidebar, go to **Build > Realtime Database**.
    *   Click **Create Database**.
    *   Choose a location (choose the one closest to you).
    *   Start in **Test Mode** (this allows you to read/write immediately without complex auth rules initially). *Note: Switch to Locked Mode with proper rules before production.*

### Where to Paste These:
Open [Database.js](file:///d:/aidnet%202.0/aidnet/Database.js) and replace the placeholders in the `firebaseConfig` object (lines 7-13).

---

## 2. Google Maps API Key (Optional / Future)
The app currently uses `expo-location` for coordinates. If you decide to add visual maps later using Google Maps providers:
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Enable **Maps SDK for Android** and **Maps SDK for iOS**.
3.  Create an API Key under **APIs & Services > Credentials**.
4.  This would eventually go into your `app.json` under `ios.config.googleMapsApiKey` and `android.config.googleMapsApiKey`.

---

## 3. Expo Account (Optional but Recommended)
If you want to build the APK/IPA for your phone or share the app with others:
1.  Create an account at [expo.dev](https://expo.dev/).
2.  Run `npx expo login` in your terminal.

## Summary Checklist
- [ ] [Firebase Console](https://console.firebase.google.com/)
- [ ] Create Project
- [ ] Register Web App
- [ ] Enable Realtime Database (Test Mode)
- [ ] Update `Database.js` with your keys
