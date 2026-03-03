import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import '../styles/Report.css';

const Report = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await analysisAPI.getAnalysis(analysisId);
      setAnalysis(response.analysis);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading">Loading your negotiation report...</div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="report-container">
        <div className="error-message">{error || 'Report not found'}</div>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { property_data, questionnaire_data, report } = analysis;

  if (!report) {
    return (
      <div className="report-container">
        <div className="info-message">
          This analysis is incomplete. Please complete the questionnaire to generate
          a report.
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
        <h1>Negotiation Report</h1>
      </div>

      {/* Property Summary */}
      <div className="report-card">
        <h2>{property_data.address}</h2>
        <div className="property-summary">
          <div className="summary-item">
            <span className="label">Listing Price</span>
            <span className="value">
              ${property_data.listing_price.toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Avg. Comp Price</span>
            <span className="value">
              ${property_data.market_trends.avg_comp_price.toLocaleString()}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Market Temperature</span>
            <span className={`badge ${property_data.market_trends.market_temperature}`}>
              {property_data.market_trends.market_temperature}
            </span>
          </div>
        </div>
      </div>

      {/* Recommended Offer */}
      <div className="report-card highlight">
        <h2>Recommended Offer</h2>
        <div className="offer-price">
          ${report.recommended_offer.amount.toLocaleString()}
        </div>
        <div className="offer-range">
          Range: ${report.recommended_offer.range.low.toLocaleString()} - $
          {report.recommended_offer.range.high.toLocaleString()}
        </div>
        <div className="offer-percentage">
          {report.recommended_offer.percentage_of_listing}% of listing price
        </div>
      </div>

      {/* Rationale */}
      <div className="report-card">
        <h2>Price Rationale</h2>
        <p className="rationale-text">{report.rationale}</p>
      </div>

      {/* Analysis Summary */}
      <div className="report-card">
        <h2>Analysis Summary</h2>
        <div className="analysis-grid">
          <div className="analysis-item">
            <span className="label">Avg. Scorecard Rating</span>
            <span className="value">
              {report.analysis_summary.avg_scorecard_rating}/10
            </span>
          </div>
          <div className="analysis-item">
            <span className="label">Overall Score</span>
            <span className="value">
              {report.analysis_summary.score_percentage}%
            </span>
          </div>
          <div className="analysis-item">
            <span className="label">Total Renovation Cost</span>
            <span className="value">
              ${report.analysis_summary.total_renovation_cost.toLocaleString()}
            </span>
          </div>
          <div className="analysis-item">
            <span className="label">Seductive Hooks</span>
            <span className="value">
              {report.analysis_summary.num_seductive_hooks}
            </span>
          </div>
          <div className="analysis-item">
            <span className="label">Weak Spots</span>
            <span className="value">{report.analysis_summary.num_weak_spots}</span>
          </div>
          <div className="analysis-item">
            <span className="label">Market Temperature</span>
            <span className="value">
              {report.analysis_summary.market_temperature}
            </span>
          </div>
        </div>
      </div>

      {/* Negotiation Talking Points */}
      <div className="report-card">
        <h2>Negotiation Talking Points</h2>
        <p className="section-description">
          Use these key points when negotiating with the seller:
        </p>
        <div className="talking-points">
          {report.talking_points.map((point, index) => (
            <div key={index} className="talking-point">
              <div className="point-number">{index + 1}</div>
              <div className="point-content">
                <h4>{point.title}</h4>
                <p>{point.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Negotiation Strategy */}
      <div className="report-card">
        <h2>Negotiation Strategy</h2>
        <div className="strategy-list">
          {report.negotiation_strategy.map((item, index) => (
            <div key={index} className="strategy-item">
              <span className="strategy-bullet">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Your Inputs Summary */}
      <div className="report-card">
        <h2>Your Input Summary</h2>

        <div className="input-section">
          <h3>Seductive Hooks</h3>
          {questionnaire_data.seductive_hooks.length > 0 ? (
            <ul>
              {questionnaire_data.seductive_hooks.map((hook, index) => (
                <li key={index}>
                  <strong>{hook.what}:</strong> {hook.why}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No hooks listed</p>
          )}
        </div>

        <div className="input-section">
          <h3>Weak Spots</h3>
          {questionnaire_data.weak_spots.length > 0 ? (
            <ul>
              {questionnaire_data.weak_spots.map((spot, index) => (
                <li key={index}>
                  <strong>{spot.what}:</strong> {spot.why}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No weak spots listed</p>
          )}
        </div>

        <div className="input-section">
          <h3>Renovation Costs</h3>
          {questionnaire_data.renovation_costs.length > 0 ? (
            <ul>
              {questionnaire_data.renovation_costs.map((item, index) => (
                <li key={index}>
                  <strong>{item.what}:</strong> ${item.cost.toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No renovation costs listed</p>
          )}
        </div>

        <div className="input-section">
          <h3>Your Gut-Check Price</h3>
          <p className="gut-check-value">
            ${questionnaire_data.gut_check_price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Print Button */}
      <div className="report-actions">
        <button onClick={() => window.print()} className="btn-secondary">
          Print Report
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Report;
