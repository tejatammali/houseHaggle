# HouseHaggle Integration & Deployment Guide

This guide covers integrating real AI, maps, market data APIs, and deploying your app to production.

---

## Table of Contents
1. [OpenAI Integration (Real AI Analysis)](#1-openai-integration)
2. [Google Maps Integration](#2-google-maps-integration)
3. [Zillow/Real Estate Data Integration](#3-real-estate-data-integration)
4. [Database: Viewing Previous Analyses](#4-database-previous-analyses)
5. [Deployment to Production](#5-deployment)

---

## 1. OpenAI Integration (Real AI Analysis)

### Step 1: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)

### Step 2: Add to Server Environment
Add to `server/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo for lower cost
```

### Step 3: Install OpenAI Library
```bash
cd server
pip install openai
```

### Step 4: Update AI Service
Edit `server/services/ai_service.py`:

```python
import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

def generate_negotiation_report(property_data, questionnaire_data):
    """Generate AI-powered negotiation report using GPT-4"""

    # Build comprehensive prompt
    prompt = f\"\"\"You are a real estate valuation expert. Analyze this property and provide negotiation advice.

PROPERTY DETAILS:
Address: {property_data['address']}
Listing Price: ${property_data['listing_price']:,}

PROPERTY SCORECARD (1-10 scale):
Location: {questionnaire_data['scorecard']['location']}/10
Lot Quality: {questionnaire_data['scorecard']['lot_quality']}/10
Lot Utilization: {questionnaire_data['scorecard']['lot_utilization']}/10
Orientation & Sunlight: {questionnaire_data['scorecard']['lot_orientation']}/10
Privacy: {questionnaire_data['scorecard']['privacy']}/10
View: {questionnaire_data['scorecard']['view']}/10
Architectural Style: {questionnaire_data['scorecard']['architectural_style']}/10
Finishes: {questionnaire_data['scorecard']['finishes']}/10
Layout: {questionnaire_data['scorecard']['layout']}/10
Scale & Volume: {questionnaire_data['scorecard']['scale_and_volume']}/10

PROPERTY STRENGTHS (Seductive Hooks):
{format_hooks(questionnaire_data['seductive_hooks'])}

PROPERTY WEAKNESSES:
{format_weakspots(questionnaire_data['weak_spots'])}

ESTIMATED RENOVATION COSTS:
{format_renovation_costs(questionnaire_data['renovation_costs'])}
Total Renovation Budget: ${sum([r['cost'] for r in questionnaire_data['renovation_costs']]):,}

BUYER'S MAX PRICE (Gut-Check): ${questionnaire_data['gut_check_price']:,}

TASK:
1. Recommend a specific offer price or range
2. Explain the rationale using the scorecard, hooks, weak spots, and market factors
3. Provide 5 specific negotiation talking points
4. Give strategic advice for the negotiation
5. Calculate expected value after renovations

Format your response as JSON:
{{
  "recommended_offer": 000000,
  "offer_rationale": "...",
  "negotiation_talking_points": ["...", "...", "...", "...", "..."],
  "negotiation_strategy": "...",
  "post_renovation_value": 000000,
  "renovation_roi_analysis": "...",
  "market_positioning": "..."
}}
\"\"\"

    try:
        response = openai.ChatCompletion.create(
            model=os.getenv('OPENAI_MODEL', 'gpt-4'),
            messages=[
                {"role": "system", "content": "You are an expert real estate valuation analyst."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        import json
        result = json.loads(response.choices[0].message.content)

        return {
            "report": {
                "recommended_offer": result['recommended_offer'],
                "offer_rationale": result['offer_rationale'],
                "negotiation_talking_points": result['negotiation_talking_points'],
                "negotiation_strategy": result['negotiation_strategy'],
                "post_renovation_value": result.get('post_renovation_value', 0),
                "renovation_roi_analysis": result.get('renovation_roi_analysis', ''),
                "market_positioning": result.get('market_positioning', '')
            }
        }
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        # Fallback to mock data if API fails
        return generate_mock_report(property_data, questionnaire_data)

def format_hooks(hooks):
    return "\\n".join([f"- {h['what']}: {h['why']}" for h in hooks])

def format_weakspots(spots):
    return "\\n".join([f"- {s['what']}: {s['why']}" for s in spots])

def format_renovation_costs(costs):
    return "\\n".join([f"- {c['what']}: ${c['cost']:,}" for c in costs])
```

---

## 2. Google Maps Integration

### Step 1: Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Street View Static API
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key

### Step 2: Restrict API Key (Important for Security)
1. Click on your API key
2. Under **Application restrictions**, select **HTTP referrers**
3. Add: `http://localhost:3000/*` and `https://yourdomain.com/*`
4. Under **API restrictions**, select **Restrict key**
5. Choose the 4 APIs listed above

### Step 3: Add to Client Environment
Add to `client/.env`:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your-key-here
```

### Step 4: Install Google Maps Library
```bash
cd client
npm install @react-google-maps/api
```

### Step 5: Create PropertyMap Component
Create `client/src/components/PropertyMap.js`:

```javascript
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const PropertyMap = ({ address, lat, lng }) => {
  const mapStyles = {
    height: "400px",
    width: "100%",
    borderRadius: "12px"
  };

  const defaultCenter = {
    lat: lat || 37.7749,
    lng: lng || -122.4194
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
    >
      <GoogleMap
        mapContainerStyle={mapStyles}
        zoom={15}
        center={defaultCenter}
      >
        <Marker position={defaultCenter} />
      </GoogleMap>
    </LoadScript>
  );
};

export default PropertyMap;
```

### Step 6: Add Geocoding Service
Create `client/src/services/geocoding.js`:

```javascript
export const geocodeAddress = async (address) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
```

### Step 7: Use in Property Form
Update your property input form to geocode addresses and display maps.

---

## 3. Real Estate Data Integration

### Option A: Zillow API (RapidAPI)
Zillow doesn't offer direct public API access. Use RapidAPI instead:

1. Go to [RapidAPI Zillow](https://rapidapi.com/apimaker/api/zillow-com1/)
2. Subscribe to a plan (free tier available)
3. Copy your API key

Add to `server/.env`:
```env
RAPIDAPI_KEY=your-rapidapi-key
RAPIDAPI_HOST=zillow-com1.p.rapidapi.com
```

Install requests library:
```bash
pip install requests
```

Create `server/services/property_service.py`:

```python
import requests
import os

def get_property_data(address):
    """Fetch real property data from Zillow API"""
    url = "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch"

    querystring = {"location": address}

    headers = {
        "X-RapidAPI-Key": os.getenv('RAPIDAPI_KEY'),
        "X-RapidAPI-Host": os.getenv('RAPIDAPI_HOST')
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        data = response.json()

        if data and 'props' in data and len(data['props']) > 0:
            prop = data['props'][0]
            return {
                "address": prop.get('address'),
                "price": prop.get('price'),
                "bedrooms": prop.get('bedrooms'),
                "bathrooms": prop.get('bathrooms'),
                "sqft": prop.get('livingArea'),
                "lot_size": prop.get('lotSize'),
                "year_built": prop.get('yearBuilt'),
                "property_type": prop.get('homeType'),
                "zestimate": prop.get('zestimate'),
                "images": prop.get('imgSrc'),
                "listing_url": prop.get('detailUrl')
            }
    except Exception as e:
        print(f"Property API Error: {e}")
        return None

def get_comparable_properties(address, radius_miles=1):
    """Get comparable properties (comps) near the address"""
    url = "https://zillow-com1.p.rapidapi.com/similarProperty"

    querystring = {"zpid": get_zpid_from_address(address)}

    headers = {
        "X-RapidAPI-Key": os.getenv('RAPIDAPI_KEY'),
        "X-RapidAPI-Host": os.getenv('RAPIDAPI_HOST')
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        return response.json()
    except Exception as e:
        print(f"Comps API Error: {e}")
        return []
```

### Option B: Redfin (Web Scraping - Use Carefully)
Web scraping may violate terms of service. Better to use official APIs.

### Option C: Attom Data Solutions
Enterprise-level property data API:
1. Go to [Attom Data](https://www.attomdata.com/)
2. Sign up for developer account
3. Get API key
4. Similar integration as Zillow above

---

## 4. Database: Viewing Previous Analyses

Your app already saves to Firestore! Let's enhance the Dashboard to show them.

### Update Dashboard Component
Edit `client/src/pages/Dashboard.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const q = query(
          collection(db, 'analyses'),
          where('user_id', '==', currentUser.uid),
          orderBy('created_at', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const analysesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAnalyses(analysesData);
      } catch (error) {
        console.error('Error fetching analyses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [currentUser.uid]);

  return (
    <div className="dashboard-container">
      <h1>My Property Analyses</h1>

      <Link to="/analyze" className="btn-primary">
        + Analyze New Property
      </Link>

      {loading ? (
        <p>Loading your analyses...</p>
      ) : analyses.length === 0 ? (
        <div className="empty-state">
          <p>No analyses yet. Start by analyzing your first property!</p>
        </div>
      ) : (
        <div className="analyses-grid">
          {analyses.map(analysis => (
            <Link
              key={analysis.id}
              to={`/report/${analysis.id}`}
              className="analysis-card"
            >
              <h3>{analysis.property.address}</h3>
              <p className="listing-price">
                ${analysis.property.listing_price.toLocaleString()}
              </p>
              <p className="recommended-offer">
                Recommended: ${analysis.report.recommended_offer.toLocaleString()}
              </p>
              <p className="date">
                {new Date(analysis.created_at.seconds * 1000).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
```

---

## 5. Deployment to Production

### Option A: Deploy to Vercel (Frontend) + Railway (Backend)

#### Deploy Frontend to Vercel
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Click **Import Project**
4. Select your GitHub repository
5. Configure:
   - Framework: Create React App
   - Root Directory: `client`
   - Environment Variables: Add all `REACT_APP_*` variables
6. Click **Deploy**
7. Your app will be live at `https://your-app.vercel.app`

#### Deploy Backend to Railway
1. Push your code to GitHub
2. Go to [Railway](https://railway.app/)
3. Click **New Project** → **Deploy from GitHub**
4. Select your repository
5. Configure:
   - Root Directory: `server`
   - Start Command: `gunicorn app:app`
   - Environment Variables: Add all server `.env` variables
6. Click **Deploy**
7. Your API will be live at `https://your-app.up.railway.app`

#### Update Frontend API URL
In `client/.env`:
```env
REACT_APP_API_URL=https://your-app.up.railway.app/api
```
Redeploy frontend.

### Option B: Deploy Everything to AWS

#### EC2 + RDS Setup
1. Launch EC2 instance (Ubuntu)
2. Install Node.js and Python
3. Clone your repository
4. Set up Nginx as reverse proxy
5. Use PM2 for Node.js and Gunicorn for Python
6. Configure SSL with Let's Encrypt

### Option C: Deploy to Google Cloud Run
1. Containerize both frontend and backend with Docker
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Set environment variables in Cloud Run console

---

## Production Checklist

### Security
- [ ] Remove all hardcoded API keys
- [ ] Enable Firestore security rules
- [ ] Add rate limiting to backend
- [ ] Use HTTPS everywhere
- [ ] Enable CORS only for your domain
- [ ] Implement Firebase App Check

### Performance
- [ ] Enable frontend build optimization
- [ ] Add caching headers
- [ ] Compress images
- [ ] Use CDN for static assets

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Add analytics (Google Analytics)
- [ ] Monitor API usage and costs
- [ ] Set up uptime monitoring

---

## Cost Estimates (Monthly)

| Service | Free Tier | Paid (Light Use) |
|---------|-----------|------------------|
| OpenAI GPT-4 | $0 (none) | $30-100 |
| Google Maps | $200 credit | $20-50 |
| Zillow/RapidAPI | 500 calls | $10-30 |
| Firebase | Generous free | $25-50 |
| Vercel | Free | Free (hobby) |
| Railway | $5 credit | $10-20 |
| **Total** | ~$5/mo | **$100-270/mo** |

---

## Custom Domain Setup

### Add Custom Domain to Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., `househaggle.com`)
3. Update DNS records at your domain registrar
4. Vercel handles SSL automatically

### Add Custom Domain to Railway
1. Go to Project Settings → Domains
2. Add your domain (e.g., `api.househaggle.com`)
3. Update DNS records
4. Railway provides SSL cert

---

## Support & Resources

- [OpenAI Docs](https://platform.openai.com/docs)
- [Google Maps API Docs](https://developers.google.com/maps/documentation)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)

---

Need help? Create an issue in the GitHub repository!
