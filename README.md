# HouseHaggle

A web application that helps homebuyers analyze properties, determine data-driven offer prices, and generate negotiation talking points.

## Features

- 🔐 User authentication (Firebase Auth)
- 📊 Property analysis with objective market data
- 📝 Comprehensive property evaluation questionnaire
- 🤖 AI-powered negotiation reports and offer price recommendations
- 💾 Save and manage multiple property analyses

## Tech Stack

- **Frontend**: React
- **Backend**: Python Flask
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth

## Project Structure

```
househaggle/
├── client/          # React frontend
└── server/          # Flask backend
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- Firebase project with Firestore and Authentication enabled

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your Firebase credentials:
   ```
   FIREBASE_CREDENTIALS_PATH=path/to/serviceAccountKey.json
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Firebase config:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Register a new account or log in
2. Click "Analyze a New Property"
3. Enter the property address and listing price
4. Complete the 5-part questionnaire
5. Receive your AI-generated negotiation report with recommended offer price

## Note on Data

Currently, the app uses mock data for property comps and AI analysis. To integrate real data:
- Add Zillow/Redfin API credentials for property data
- Add OpenAI API key for GPT-4 analysis

## License

MIT
