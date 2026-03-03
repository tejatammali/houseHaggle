import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analysisAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalyses();
  }, [currentUser]);

  const fetchAnalyses = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await analysisAPI.getUserAnalyses(currentUser.uid);
      setAnalyses(response.analyses || []);
    } catch (err) {
      console.error('Error fetching analyses:', err);
      setError('Failed to load your property analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const handleNewAnalysis = () => {
    navigate('/analyze');
  };

  const handleViewAnalysis = (analysisId) => {
    navigate(`/report/${analysisId}`);
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      await analysisAPI.deleteAnalysis(analysisId);
      setAnalyses(analyses.filter((a) => a.id !== analysisId));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Failed to delete analysis');
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>HouseHaggle</h1>
        <div className="header-actions">
          <span className="user-email">{currentUser?.email}</span>
          <button onClick={handleLogout} className="btn-secondary">
            Log Out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-top">
          <h2>My Property Analyses</h2>
          <button onClick={handleNewAnalysis} className="btn-primary">
            + Analyze New Property
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading your analyses...</div>
        ) : analyses.length === 0 ? (
          <div className="empty-state">
            <h3>No properties analyzed yet</h3>
            <p>
              Click "Analyze New Property" to get started with your first
              property analysis.
            </p>
          </div>
        ) : (
          <div className="analyses-grid">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="analysis-card">
                <div className="analysis-header">
                  <h3>{analysis.property_data.address}</h3>
                  <span className={`status-badge ${analysis.status}`}>
                    {analysis.status}
                  </span>
                </div>

                <div className="analysis-details">
                  <p>
                    <strong>Listing Price:</strong> $
                    {analysis.property_data.listing_price.toLocaleString()}
                  </p>
                  {analysis.report && (
                    <p>
                      <strong>Recommended Offer:</strong> $
                      {analysis.report.recommended_offer.amount.toLocaleString()}
                    </p>
                  )}
                  <p className="analysis-date">
                    Created:{' '}
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="analysis-actions">
                  <button
                    onClick={() => handleViewAnalysis(analysis.id)}
                    className="btn-primary"
                  >
                    {analysis.status === 'completed' ? 'View Report' : 'Continue'}
                  </button>
                  <button
                    onClick={() => handleDeleteAnalysis(analysis.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
