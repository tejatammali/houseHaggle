import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import Questionnaire from '../components/Questionnaire';
import '../styles/PropertyAnalysis.css';

const PropertyAnalysis = () => {
  const [step, setStep] = useState('address'); // 'address' or 'questionnaire'
  const [address, setAddress] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setError('');

    if (!address || !listingPrice) {
      return setError('Please enter both address and listing price');
    }

    const price = parseFloat(listingPrice.replace(/,/g, ''));
    if (isNaN(price) || price <= 0) {
      return setError('Please enter a valid listing price');
    }

    try {
      setLoading(true);

      // Fetch property data from backend
      const data = await propertyAPI.getPropertyData(address, price);
      setPropertyData(data);
      setStep('questionnaire');
    } catch (err) {
      console.error('Error fetching property data:', err);
      setError('Failed to fetch property data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (step === 'questionnaire' && propertyData) {
    return <Questionnaire propertyData={propertyData} />;
  }

  return (
    <div className="property-analysis-container">
      <div className="analysis-header">
        <button onClick={handleBackToDashboard} className="btn-back">
          ← Back to Dashboard
        </button>
        <h1>Analyze New Property</h1>
      </div>

      <div className="analysis-card">
        <div className="card-header">
          <h2>Property Information</h2>
          <p>Enter the property details to get started</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmitAddress}>
          <div className="form-group">
            <label htmlFor="address">
              Property Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State ZIP"
              required
              className="input-large"
            />
            <small>Enter the complete property address</small>
          </div>

          <div className="form-group">
            <label htmlFor="listingPrice">
              Listing Price <span className="required">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="text"
                id="listingPrice"
                value={listingPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setListingPrice(value ? parseInt(value).toLocaleString() : '');
                }}
                placeholder="500,000"
                required
                className="input-large"
              />
            </div>
            <small>Current asking price for the property</small>
          </div>

          <div className="info-box">
            <h4>What happens next?</h4>
            <ul>
              <li>We'll fetch comparable sales data for this property</li>
              <li>You'll complete a detailed questionnaire about the property</li>
              <li>Our AI will generate a negotiation report with a recommended offer price</li>
            </ul>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-large">
            {loading ? 'Loading Property Data...' : 'Continue to Questionnaire →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PropertyAnalysis;
