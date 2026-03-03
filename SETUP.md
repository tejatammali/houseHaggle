# HouseHaggle Setup Guide

This guide will walk you through setting up and running the HouseHaggle application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **Git** (optional, for version control)

## Step 1: Firebase Setup

HouseHaggle uses Firebase for authentication and database. Follow these steps to set up Firebase:

### 1.1 Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter a project name (e.g., "HouseHaggle")
4. Follow the prompts to create your project

### 1.2 Enable Firebase Authentication

1. In your Firebase project, go to **Build > Authentication**
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Click "Save"

### 1.3 Enable Firestore Database

1. In your Firebase project, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location (choose one close to you)
5. Click "Enable"

### 1.4 Get Firebase Web App Credentials

1. In your Firebase project, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web icon** (</>) to add a web app
4. Register your app with a nickname (e.g., "HouseHaggle Web")
5. Copy the Firebase config object - you'll need these values:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   }
   ```

### 1.5 Get Firebase Admin SDK Credentials (for Backend)

1. In Firebase Console, go to **Project Settings > Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as `serviceAccountKey.json` in the `server/` directory

**IMPORTANT:** Never commit this file to version control! It's already in `.gitignore`.

## Step 2: Backend Setup

### 2.1 Navigate to Server Directory

```bash
cd server
```

### 2.2 Create Python Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.4 Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your configuration:
   ```env
   SECRET_KEY=your-secret-key-here
   FLASK_DEBUG=True
   FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
   CORS_ORIGINS=http://localhost:3000
   ```

3. Make sure `serviceAccountKey.json` is in the `server/` directory

### 2.5 Run the Backend Server

```bash
python app.py
```

You should see:
```
🏠 HouseHaggle API Server
Running on: http://localhost:5000
```

**Keep this terminal window open!** The backend needs to keep running.

## Step 3: Frontend Setup

### 3.1 Open a New Terminal

Open a **new terminal window** (keep the backend running in the first one)

### 3.2 Navigate to Client Directory

```bash
cd client
```

### 3.3 Install Dependencies

```bash
npm install
```

This will install React, Firebase, and all other frontend dependencies.

### 3.4 Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Firebase config (from Step 1.4):
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key-here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### 3.5 Run the Frontend

```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

## Step 4: Test the Application

### 4.1 Create an Account

1. Click "Sign Up" on the login page
2. Enter your email and password (min 6 characters)
3. You'll be redirected to the dashboard

### 4.2 Analyze a Property

1. Click "Analyze New Property"
2. Enter a property address (any address works, we're using mock data)
3. Enter a listing price (e.g., 500000)
4. Click "Continue to Questionnaire"
5. Complete all 5 parts of the questionnaire:
   - Part 1: Rate the property (1-10 for each category)
   - Part 2: Add "Seductive Hooks" (property strengths)
   - Part 3: Add "Weak Spots" (property issues)
   - Part 4: Estimate renovation costs
   - Part 5: Enter your gut-check price
6. Click "Generate Negotiation Report"

### 4.3 View Your Report

After generating the report, you'll see:
- Recommended offer price
- Price rationale
- Negotiation talking points
- Strategy recommendations
- Analysis summary

## Troubleshooting

### Backend Issues

**Error: "Firebase credentials not found"**
- Make sure `serviceAccountKey.json` is in the `server/` directory
- Check that `FIREBASE_CREDENTIALS_PATH` in `.env` points to the correct file

**Error: "Port 5000 already in use"**
- Stop any other process using port 5000
- Or change the port in `server/app.py`

### Frontend Issues

**Error: "Firebase not configured"**
- Make sure you created the `.env` file in the `client/` directory
- Verify all Firebase config values are correct
- Restart the React dev server after changing `.env`

**Error: "Cannot connect to backend"**
- Make sure the Flask backend is running on port 5000
- Check `REACT_APP_API_URL` in `client/.env`
- Check for CORS errors in browser console

### Firebase Issues

**Error: "auth/operation-not-allowed"**
- Make sure Email/Password authentication is enabled in Firebase Console

**Error: "permission-denied" in Firestore**
- Make sure Firestore is in test mode (for development)
- Production apps should use proper security rules

## Next Steps

### Adding Real Property Data

Currently, the app uses mock data. To integrate real property data:

1. Sign up for a real estate API (Zillow, Redfin, etc.)
2. Add your API key to `server/.env`
3. Update `server/services/property_service.py` to call the real API

### Adding Real AI Analysis

Currently, the app uses algorithmic mock analysis. To integrate GPT-4:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to `server/.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```
3. Install the OpenAI library:
   ```bash
   pip install openai
   ```
4. Update `server/services/ai_service.py` to call the OpenAI API

### Deployment

When ready to deploy:

1. Update Firestore security rules for production
2. Set up environment variables on your hosting platform
3. Build the React app: `npm run build`
4. Deploy the backend to a service like Heroku, Railway, or AWS
5. Deploy the frontend to Netlify, Vercel, or Firebase Hosting

## Project Structure

```
househaggle/
├── client/              # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── styles/      # CSS files
│   │   ├── config/      # Firebase config
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   └── package.json
│
├── server/              # Flask backend
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── app.py           # Main Flask app
│   ├── config.py        # Configuration
│   └── requirements.txt
│
├── README.md
└── SETUP.md (this file)
```

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the error messages in the console
3. Make sure all environment variables are set correctly
4. Verify Firebase is configured properly

## Security Notes

**For Development:**
- Test mode Firestore rules are fine
- Local environment variables are acceptable

**Before Production:**
- Set up proper Firestore security rules
- Use environment variables on your hosting platform
- Never commit API keys or credentials to version control
- Enable Firebase App Check
- Set up rate limiting on your backend

---

Happy house hunting! 🏠
