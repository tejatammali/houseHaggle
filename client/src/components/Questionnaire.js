import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { analysisAPI } from '../services/api';
import '../styles/Questionnaire.css';

// Evaluation criteria for each scorecard item
const SCORECARD_CRITERIA = {
  location: {
    title: 'Zoning & Location',
    description: 'Evaluate the property\'s location based on multiple factors',
    criteria: [
      { label: 'School Quality', detail: 'Top-rated schools (8-10 rating) = excellent. Check GreatSchools.org ratings.' },
      { label: 'Neighborhood Culture', detail: 'Well-maintained homes, active community, cultural amenities nearby.' },
      { label: 'Transit & Accessibility', detail: 'Close to major roads, public transit, airports. Short commute times.' },
      { label: 'Commercial Proximity', detail: 'Walking distance to quality shops, restaurants, services.' },
      { label: 'Growth Potential', detail: 'Underbuilt areas, tight zoning = higher future value. Research local development plans.' }
    ],
    scoring: '1-3: Poor location, limited amenities | 4-6: Average suburban location | 7-8: Desirable neighborhood | 9-10: Premium location (top schools, amenities, culture)'
  },
  lot_quality: {
    title: 'Lot Quality',
    description: 'Assess the physical characteristics and potential of the lot',
    criteria: [
      { label: 'Lot Size', detail: '15,000 sq ft = ideal. Under 5,000 sq ft = cramped. Over 20,000 sq ft = premium.' },
      { label: 'Terrain', detail: 'Flat terrain = excellent. Gentle slope = good. Steep slope = challenging and costly.' },
      { label: 'Lot Shape', detail: 'Rectangular/Square = best. Flag, pie, corner lots have unique advantages and challenges.' },
      { label: 'Soil & Drainage', detail: 'Good drainage, stable soil. Avoid flood zones or wetlands.' },
      { label: 'Natural Features', detail: 'Mature trees, water features add value. Rock outcrops may limit building.' }
    ],
    scoring: '1-3: Small, problematic lot | 4-6: Average suburban lot | 7-8: Spacious, well-shaped lot | 9-10: Premium lot (large, flat, ideal shape)'
  },
  lot_utilization: {
    title: 'Lot Utilization & Setbacks',
    description: 'Evaluate how well the lot space is used and privacy potential',
    criteria: [
      { label: 'Frontage', detail: 'Over 25 ft = great. 15-25 ft = good. Under 5 ft = poor curb appeal.' },
      { label: 'Side Setbacks', detail: 'Over 20 ft = great privacy. 10-20 ft = adequate. Under 5 ft = cramped.' },
      { label: 'Backyard Space', detail: 'Over 15,000 sq ft = excellent. 5,000-15,000 = good. Under 2,500 = limited.' },
      { label: 'Building Coverage', detail: 'House shouldn\'t dominate lot. Aim for 30-40% lot coverage for balance.' },
      { label: 'Future Expansion', detail: 'Room to add ADU, pool, garage? Check zoning for allowable additions.' }
    ],
    scoring: '1-3: Over-built or cramped | 4-6: Standard utilization | 7-8: Well-proportioned with space | 9-10: Optimal use with expansion potential'
  },
  lot_orientation: {
    title: 'Lot Orientation & Sunlight',
    description: 'Rate natural light, views, and environmental factors',
    criteria: [
      { label: 'Sun Exposure', detail: 'South-facing = ideal (max light). East/West = moderate. North = least light.' },
      { label: 'View Quality', detail: 'Rate: Water/mountain = premium. Park/city = good. Obstructed = poor.' },
      { label: 'View Distance', detail: 'Panoramic long-distance views = excellent. Close-in views = good. Blocked = poor.' },
      { label: 'Natural Light', detail: 'Large windows, skylights, open floor plan maximize light. Dark rooms = lower score.' },
      { label: 'Environmental Risks', detail: 'Avoid: railways, flood zones, fire risk areas, busy roads. Check FEMA maps.' }
    ],
    scoring: '1-3: Poor light, no view, environmental risks | 4-6: Average orientation | 7-8: Good light and views | 9-10: Ideal sun exposure, premium views'
  },
  privacy: {
    title: 'Privacy & Security',
    description: 'Assess the level of privacy and security the property offers',
    criteria: [
      { label: 'Visual Privacy', detail: 'High fencing, mature landscaping, good setbacks = excellent. Exposed = poor.' },
      { label: 'Backyard Privacy', detail: 'Most important. No neighbors overlooking, tall fences/trees = high score.' },
      { label: 'Street Noise', detail: 'Cul-de-sac or quiet street = best. Busy road = poor. Distance from major roads matters.' },
      { label: 'Elevation', detail: 'Higher elevation often means better privacy and views. Avoid being overlooked.' },
      { label: 'Gated/Secure', detail: 'Gated community, security features add points. Open/exposed = lower score.' }
    ],
    scoring: '1-3: Highly exposed, noisy | 4-6: Moderate privacy | 7-8: Good privacy with some exposure | 9-10: Exceptional privacy and security'
  },
  view: {
    title: 'View Quality',
    description: 'Evaluate the quality and impact of views from the property',
    criteria: [
      { label: 'View Type', detail: 'Water/ocean = 10. Mountain = 9. Park/golf = 7-8. City = 6-7. Rooftops/parking = 1-3.' },
      { label: 'Panorama Width', detail: '180°+ panoramic = excellent. 90-180° = very good. Under 45° = limited.' },
      { label: 'Clarity & Distance', detail: 'Unobstructed long-distance views = premium. Close/blocked views = lower score.' },
      { label: 'View Rooms', detail: 'Views from main living areas & master bedroom = high value. Only from small rooms = less impact.' },
      { label: 'Permanence', detail: 'Protected views (water, park) = excellent. Views that could be blocked = risky.' }
    ],
    scoring: '1-3: No view or obstructed | 4-6: Average neighborhood views | 7-8: Quality views | 9-10: Premium, protected, panoramic views'
  },
  architectural_style: {
    title: 'Architectural Style',
    description: 'Rate design authenticity, quality, and market appeal',
    criteria: [
      { label: 'Style Consistency', detail: 'True to original style (Craftsman, Modern, etc.) or well-executed modern design.' },
      { label: 'Proportions', detail: 'Balanced façade, appropriate window/door sizes, good height-to-width ratio.' },
      { label: 'Material Quality', detail: 'Natural materials (stone, wood, brick) = premium. Vinyl siding = budget.' },
      { label: 'Timelessness', detail: 'Classic or modern designs age well. Trendy/dated styles = lower score.' },
      { label: 'Neighborhood Fit', detail: 'Complements surrounding homes without being identical or jarring.' }
    ],
    scoring: '1-3: Dated, poor design | 4-6: Generic builder-grade | 7-8: Attractive, quality design | 9-10: Architecturally significant or exceptional'
  },
  finishes: {
    title: 'Finishes & Materials',
    description: 'Assess interior finishes, materials, and overall quality',
    criteria: [
      { label: 'Finish Age', detail: 'Under 5 years = excellent. 5-10 years = good. 10-20 years = dated. 20+ = outdated.' },
      { label: 'Material Quality', detail: 'Natural materials (hardwood, stone, quartz) = high score. Laminate/vinyl = lower.' },
      { label: 'Color Palette', detail: 'Neutral, timeless tones = best. Bold/trendy colors = lower. Easy to repaint factors in.' },
      { label: 'Consistency', detail: '2-3 natural materials throughout = cohesive. Too many materials = busy/cheap.' },
      { label: 'Durability', detail: 'High-quality finishes last 15-20 years. Budget finishes wear quickly.' }
    ],
    scoring: '1-3: Worn, dated, low-quality | 4-6: Builder-grade, functional | 7-8: Quality finishes, modern | 9-10: Luxury finishes, natural materials'
  },
  layout: {
    title: 'Layout & Flow',
    description: 'Evaluate floor plan functionality and living flow',
    criteria: [
      { label: 'Entry Impact', detail: 'Strong first impression, open foyer, views into home = excellent. Cramped entry = poor.' },
      { label: 'Bedroom Grouping', detail: 'Bedrooms together = ideal. Separated bedrooms = inconvenient for families.' },
      { label: 'Indoor-Outdoor Flow', detail: 'Easy access to outdoor spaces from main living areas = premium.' },
      { label: 'Zoning', detail: 'Private zones (bedrooms) separate from public (living/kitchen) = good design.' },
      { label: 'Circulation', detail: 'Minimal hallways, natural flow between rooms. Avoid choppy layouts.' }
    ],
    scoring: '1-3: Choppy, poor flow, wasted space | 4-6: Functional but dated layout | 7-8: Good flow, modern open concept | 9-10: Exceptional layout, perfect flow'
  },
  scale_and_volume: {
    title: 'Scale & Volume',
    description: 'Assess room proportions, ceiling heights, and spatial quality',
    criteria: [
      { label: 'Ceiling Heights', detail: '9 ft = standard. 11 ft = good. 14 ft = excellent. 18 ft+ = dramatic/luxury.' },
      { label: 'Room Proportions', detail: 'Width-to-length ratio 1:1 to 1:1.5 = ideal. Long narrow rooms = poor.' },
      { label: 'Room Sizes', detail: 'Match ceiling height to room size. 9 ft ceiling needs 12-20 ft rooms. 14 ft needs 25-30 ft.' },
      { label: 'Window Scale', detail: 'Oversized windows, tall doors add perceived luxury and light.' },
      { label: 'Volume Balance', detail: 'Mix of intimate and grand spaces. All same height = monotonous.' }
    ],
    scoring: '1-3: Low ceilings, cramped rooms | 4-6: Standard 8-9 ft ceilings | 7-8: High ceilings, good proportions | 9-10: Dramatic volume, perfect scale'
  }
};

// Quick select options for common hooks, weak spots, and renovations
const QUICK_SELECT_HOOKS = [
  { icon: '🌊', text: 'Ocean/Water View', reason: 'Unobstructed panoramic views' },
  { icon: '🏔️', text: 'Mountain View', reason: 'Scenic natural backdrop' },
  { icon: '🌳', text: 'Mature Trees/Landscaping', reason: 'Private, established grounds' },
  { icon: '🚶', text: 'Walkable Location', reason: 'Near shops, restaurants, parks' },
  { icon: '🎓', text: 'Top-Rated Schools', reason: 'Excellent school district ratings' },
  { icon: '🏛️', text: 'Architectural Character', reason: 'Unique design features' },
  { icon: '☀️', text: 'Natural Light', reason: 'South-facing with large windows' },
  { icon: '🏡', text: 'Updated Interior', reason: 'Recently renovated finishes' },
  { icon: '🚗', text: 'Garage/Parking', reason: 'Multiple car garage with storage' },
  { icon: '🏊', text: 'Pool/Outdoor Space', reason: 'Resort-style amenities' },
  { icon: '🔒', text: 'Privacy', reason: 'Large lot with mature hedging' },
  { icon: '🎯', text: 'Open Floor Plan', reason: 'Modern, flowing layout' }
];

const QUICK_SELECT_WEAK_SPOTS = [
  { icon: '🍳', text: 'Outdated Kitchen', reason: '20+ year old cabinets and appliances' },
  { icon: '🛁', text: 'Old Bathrooms', reason: 'Dated fixtures and finishes' },
  { icon: '🪟', text: 'Single-Pane Windows', reason: 'Poor insulation and efficiency' },
  { icon: '🏚️', text: 'Deferred Maintenance', reason: 'Visible wear and repairs needed' },
  { icon: '📐', text: 'Poor Layout', reason: 'Choppy floor plan or wasted space' },
  { icon: '🌧️', text: 'Roof Age', reason: '15+ years old, nearing replacement' },
  { icon: '🔌', text: 'Electrical System', reason: 'Outdated panel or wiring' },
  { icon: '🚰', text: 'Plumbing Issues', reason: 'Old pipes or leaks' },
  { icon: '❄️', text: 'HVAC System', reason: 'Aging furnace or AC unit' },
  { icon: '🎨', text: 'Cosmetic Updates Needed', reason: 'Paint, flooring, finishes dated' },
  { icon: '🚗', text: 'Limited Parking', reason: 'Small or no garage' },
  { icon: '📏', text: 'Small Lot', reason: 'Limited yard or outdoor space' }
];

const QUICK_SELECT_RENOVATIONS = [
  { icon: '🍳', text: 'Kitchen Remodel', cost: '50000' },
  { icon: '🛁', text: 'Bathroom Renovation', cost: '25000' },
  { icon: '🎨', text: 'Interior Paint', cost: '8000' },
  { icon: '🪵', text: 'Flooring Replacement', cost: '15000' },
  { icon: '🪟', text: 'Window Replacement', cost: '20000' },
  { icon: '🌧️', text: 'New Roof', cost: '18000' },
  { icon: '🏡', text: 'Exterior Paint/Siding', cost: '12000' },
  { icon: '🔌', text: 'Electrical Upgrade', cost: '8000' },
  { icon: '❄️', text: 'HVAC Replacement', cost: '12000' },
  { icon: '🌳', text: 'Landscaping', cost: '10000' },
  { icon: '🏊', text: 'Pool/Deck', cost: '35000' },
  { icon: '📦', text: 'Storage/Garage', cost: '15000' }
];

const Questionnaire = ({ propertyData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Part 1: Scorecard
  const [scorecard, setScorecard] = useState({
    location: 5,
    lot_quality: 5,
    lot_utilization: 5,
    lot_orientation: 5,
    privacy: 5,
    view: 5,
    architectural_style: 5,
    finishes: 5,
    layout: 5,
    scale_and_volume: 5,
  });

  // Part 2: Seductive Hooks
  const [hooks, setHooks] = useState([{ what: '', why: '' }]);
  const [selectedHooks, setSelectedHooks] = useState([]);

  // Part 3: Weak Spots
  const [weakSpots, setWeakSpots] = useState([{ what: '', why: '' }]);
  const [selectedWeakSpots, setSelectedWeakSpots] = useState([]);

  // Part 4: Renovation Costs
  const [renovationCosts, setRenovationCosts] = useState([{ what: '', cost: '' }]);
  const [selectedRenovations, setSelectedRenovations] = useState([]);

  // Part 5: Gut-Check Price
  const [gutCheckPrice, setGutCheckPrice] = useState('');

  const handleScoreChange = (field, value) => {
    setScorecard({ ...scorecard, [field]: parseInt(value) });
  };

  // Quick-select handlers
  const toggleQuickSelectHook = (hook) => {
    const isSelected = selectedHooks.some(h => h.text === hook.text);
    if (isSelected) {
      setSelectedHooks(selectedHooks.filter(h => h.text !== hook.text));
      setHooks(hooks.filter(h => h.what !== hook.text));
    } else {
      if (selectedHooks.length < 5) {
        setSelectedHooks([...selectedHooks, hook]);
        const existingEmptyIndex = hooks.findIndex(h => !h.what && !h.why);
        if (existingEmptyIndex !== -1) {
          const newHooks = [...hooks];
          newHooks[existingEmptyIndex] = { what: hook.text, why: hook.reason };
          setHooks(newHooks);
        } else if (hooks.length < 5) {
          setHooks([...hooks, { what: hook.text, why: hook.reason }]);
        }
      }
    }
  };

  const toggleQuickSelectWeakSpot = (spot) => {
    const isSelected = selectedWeakSpots.some(s => s.text === spot.text);
    if (isSelected) {
      setSelectedWeakSpots(selectedWeakSpots.filter(s => s.text !== spot.text));
      setWeakSpots(weakSpots.filter(w => w.what !== spot.text));
    } else {
      if (selectedWeakSpots.length < 5) {
        setSelectedWeakSpots([...selectedWeakSpots, spot]);
        const existingEmptyIndex = weakSpots.findIndex(w => !w.what && !w.why);
        if (existingEmptyIndex !== -1) {
          const newWeakSpots = [...weakSpots];
          newWeakSpots[existingEmptyIndex] = { what: spot.text, why: spot.reason };
          setWeakSpots(newWeakSpots);
        } else if (weakSpots.length < 5) {
          setWeakSpots([...weakSpots, { what: spot.text, why: spot.reason }]);
        }
      }
    }
  };

  const toggleQuickSelectRenovation = (reno) => {
    const isSelected = selectedRenovations.some(r => r.text === reno.text);
    if (isSelected) {
      setSelectedRenovations(selectedRenovations.filter(r => r.text !== reno.text));
      setRenovationCosts(renovationCosts.filter(c => c.what !== reno.text));
    } else {
      if (selectedRenovations.length < 5) {
        setSelectedRenovations([...selectedRenovations, reno]);
        const existingEmptyIndex = renovationCosts.findIndex(c => !c.what && !c.cost);
        if (existingEmptyIndex !== -1) {
          const newCosts = [...renovationCosts];
          newCosts[existingEmptyIndex] = { what: reno.text, cost: parseInt(reno.cost).toLocaleString() };
          setRenovationCosts(newCosts);
        } else if (renovationCosts.length < 5) {
          setRenovationCosts([...renovationCosts, { what: reno.text, cost: parseInt(reno.cost).toLocaleString() }]);
        }
      }
    }
  };

  const addHook = () => {
    if (hooks.length < 5) {
      setHooks([...hooks, { what: '', why: '' }]);
    }
  };

  const updateHook = (index, field, value) => {
    const newHooks = [...hooks];
    newHooks[index][field] = value;
    setHooks(newHooks);
  };

  const removeHook = (index) => {
    const hookToRemove = hooks[index];
    setHooks(hooks.filter((_, i) => i !== index));
    setSelectedHooks(selectedHooks.filter(h => h.text !== hookToRemove.what));
  };

  const addWeakSpot = () => {
    if (weakSpots.length < 5) {
      setWeakSpots([...weakSpots, { what: '', why: '' }]);
    }
  };

  const updateWeakSpot = (index, field, value) => {
    const newWeakSpots = [...weakSpots];
    newWeakSpots[index][field] = value;
    setWeakSpots(newWeakSpots);
  };

  const removeWeakSpot = (index) => {
    const spotToRemove = weakSpots[index];
    setWeakSpots(weakSpots.filter((_, i) => i !== index));
    setSelectedWeakSpots(selectedWeakSpots.filter(s => s.text !== spotToRemove.what));
  };

  const addRenovationCost = () => {
    if (renovationCosts.length < 5) {
      setRenovationCosts([...renovationCosts, { what: '', cost: '' }]);
    }
  };

  const updateRenovationCost = (index, field, value) => {
    const newCosts = [...renovationCosts];
    if (field === 'cost') {
      const numValue = value.replace(/\D/g, '');
      newCosts[index][field] = numValue ? parseInt(numValue).toLocaleString() : '';
    } else {
      newCosts[index][field] = value;
    }
    setRenovationCosts(newCosts);
  };

  const removeRenovationCost = (index) => {
    const renoToRemove = renovationCosts[index];
    setRenovationCosts(renovationCosts.filter((_, i) => i !== index));
    setSelectedRenovations(selectedRenovations.filter(r => r.text !== renoToRemove.what));
  };

  const handleSubmit = async () => {
    // Validate gut-check price
    const price = parseFloat(gutCheckPrice.replace(/,/g, ''));
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid gut-check price');
      return;
    }

    // Prepare questionnaire data
    const questionnaireData = {
      scorecard,
      seductive_hooks: hooks.filter((h) => h.what && h.why),
      weak_spots: weakSpots.filter((w) => w.what && w.why),
      renovation_costs: renovationCosts
        .filter((r) => r.what && r.cost)
        .map((r) => ({
          what: r.what,
          cost: parseFloat(r.cost.replace(/,/g, '')),
        })),
      gut_check_price: price,
    };

    try {
      setLoading(true);

      // Generate report
      const reportResponse = await analysisAPI.generateReport(
        propertyData,
        questionnaireData
      );

      // Save analysis with report
      const saveResponse = await analysisAPI.saveAnalysis(
        currentUser.uid,
        propertyData,
        questionnaireData,
        reportResponse.report
      );

      // Navigate to report page
      navigate(`/report/${saveResponse.analysis_id}`);
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
    window.scrollTo(0, 0);
  };

  const prevPage = () => {
    setCurrentPage(currentPage - 1);
    window.scrollTo(0, 0);
  };

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <h1>Property Evaluation Questionnaire</h1>
        <p className="property-address">{propertyData.address}</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(currentPage / 5) * 100}%` }}
          ></div>
        </div>
        <p className="progress-text">
          Part {currentPage} of 5
        </p>
      </div>

      <div className="questionnaire-content">
        {/* Part 1: Scorecard */}
        {currentPage === 1 && (
          <div className="questionnaire-page">
            <h2>
              <span className="page-icon">📊</span>
              Part 1: Property Scorecard
            </h2>
            <p className="page-description">
              Rate each aspect of the property from 1 (poor) to 10 (excellent).
              Click the info icon for evaluation guidance.
            </p>

            <div className="scorecard-grid">
              {Object.entries(scorecard).map(([key, value]) => {
                const criteriaInfo = SCORECARD_CRITERIA[key];
                return (
                  <div key={key} className="score-item">
                    <div className="score-header">
                      <label>{criteriaInfo.title}</label>
                      <button
                        type="button"
                        className="info-button"
                        onClick={() => setActiveTooltip(activeTooltip === key ? null : key)}
                        aria-label={`Information about ${criteriaInfo.title}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                    </div>

                    {activeTooltip === key && (
                      <div className="criteria-tooltip">
                        <div className="tooltip-content">
                          <h4>{criteriaInfo.title}</h4>
                          <p className="tooltip-description">{criteriaInfo.description}</p>

                          <div className="criteria-list">
                            <strong>Consider these factors:</strong>
                            <ul>
                              {criteriaInfo.criteria.map((item, idx) => (
                                <li key={idx}>
                                  <strong>{item.label}:</strong> {item.detail}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="scoring-guide">
                            <strong>Scoring Guide:</strong>
                            <p>{criteriaInfo.scoring}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="score-input-group">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) => handleScoreChange(key, e.target.value)}
                        className="score-slider"
                      />
                      <span className="score-value">{value}/10</span>
                    </div>

                    <div className="score-description">
                      {value <= 3 && '❌ Poor'}
                      {value > 3 && value <= 6 && '⚠️ Average'}
                      {value > 6 && value <= 8 && '✓ Good'}
                      {value > 8 && '✨ Excellent'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="page-actions">
              <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                Cancel
              </button>
              <button onClick={nextPage} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Part 2: Seductive Hooks */}
        {currentPage === 2 && (
          <div className="questionnaire-page">
            <h2>
              <span className="page-icon">✨</span>
              Part 2: Seductive Hooks
            </h2>
            <p className="page-description">
              Select the property's standout features and strengths, or add your own custom ones.
            </p>

            <div className="quick-select-section">
              <div className="quick-select-label">Quick Select (Choose up to 5)</div>
              <div className="quick-select-grid">
                {QUICK_SELECT_HOOKS.map((quickHook, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`quick-select-btn ${selectedHooks.some(h => h.text === quickHook.text) ? 'selected' : ''}`}
                    onClick={() => toggleQuickSelectHook(quickHook)}
                  >
                    <span className="quick-select-icon">{quickHook.icon}</span>
                    {quickHook.text}
                  </button>
                ))}
              </div>
            </div>

            {hooks.filter(h => h.what || h.why).length > 0 && (
              <>
                <div className="divider">Selected Hooks</div>
                {hooks.map((hook, index) => (
                  <div key={index} className="list-item">
                    <div className="list-item-header">
                      <h4>Hook {index + 1}</h4>
                      {hooks.length > 1 && (
                        <button
                          onClick={() => removeHook(index)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>What</label>
                        <input
                          type="text"
                          value={hook.what}
                          onChange={(e) => updateHook(index, 'what', e.target.value)}
                          placeholder="e.g., Ocean View"
                        />
                      </div>
                      <div className="form-group">
                        <label>Why</label>
                        <input
                          type="text"
                          value={hook.why}
                          onChange={(e) => updateHook(index, 'why', e.target.value)}
                          placeholder="e.g., Unobstructed 180-degree view"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {hooks.length < 5 && (
                  <button onClick={addHook} className="btn-add">
                    + Add Custom Hook
                  </button>
                )}
              </>
            )}

            <div className="page-actions">
              <button onClick={prevPage} className="btn-secondary">
                ← Previous
              </button>
              <button onClick={nextPage} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Part 3: Weak Spots */}
        {currentPage === 3 && (
          <div className="questionnaire-page">
            <h2>
              <span className="page-icon">⚠️</span>
              Part 3: Weak Spots
            </h2>
            <p className="page-description">
              Select common issues or add custom ones. These will help calculate renovation costs and negotiation leverage.
            </p>

            <div className="quick-select-section">
              <div className="quick-select-label">Quick Select (Choose up to 5)</div>
              <div className="quick-select-grid">
                {QUICK_SELECT_WEAK_SPOTS.map((quickSpot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`quick-select-btn ${selectedWeakSpots.some(s => s.text === quickSpot.text) ? 'selected' : ''}`}
                    onClick={() => toggleQuickSelectWeakSpot(quickSpot)}
                  >
                    <span className="quick-select-icon">{quickSpot.icon}</span>
                    {quickSpot.text}
                  </button>
                ))}
              </div>
            </div>

            {weakSpots.filter(w => w.what || w.why).length > 0 && (
              <>
                <div className="divider">Selected Weak Spots</div>
                {weakSpots.map((spot, index) => (
                  <div key={index} className="list-item">
                    <div className="list-item-header">
                      <h4>Weak Spot {index + 1}</h4>
                      {weakSpots.length > 1 && (
                        <button
                          onClick={() => removeWeakSpot(index)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>What</label>
                        <input
                          type="text"
                          value={spot.what}
                          onChange={(e) => updateWeakSpot(index, 'what', e.target.value)}
                          placeholder="e.g., Outdated Kitchen"
                        />
                      </div>
                      <div className="form-group">
                        <label>Why</label>
                        <input
                          type="text"
                          value={spot.why}
                          onChange={(e) => updateWeakSpot(index, 'why', e.target.value)}
                          placeholder="e.g., 1970s appliances and countertops"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {weakSpots.length < 5 && (
                  <button onClick={addWeakSpot} className="btn-add">
                    + Add Custom Weak Spot
                  </button>
                )}
              </>
            )}

            <div className="page-actions">
              <button onClick={prevPage} className="btn-secondary">
                ← Previous
              </button>
              <button onClick={nextPage} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Part 4: Renovation Costs */}
        {currentPage === 4 && (
          <div className="questionnaire-page">
            <h2>
              <span className="page-icon">🔨</span>
              Part 4: Renovation Costs
            </h2>
            <p className="page-description">
              Select common renovations with estimated costs, or add your own custom items.
            </p>

            <div className="quick-select-section">
              <div className="quick-select-label">Quick Select (Choose up to 5)</div>
              <div className="quick-select-grid">
                {QUICK_SELECT_RENOVATIONS.map((quickReno, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`quick-select-btn ${selectedRenovations.some(r => r.text === quickReno.text) ? 'selected' : ''}`}
                    onClick={() => toggleQuickSelectRenovation(quickReno)}
                  >
                    <span className="quick-select-icon">{quickReno.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div>{quickReno.text}</div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '2px' }}>
                        ${parseInt(quickReno.cost).toLocaleString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {renovationCosts.filter(c => c.what || c.cost).length > 0 && (
              <>
                <div className="divider">Selected Renovations</div>
                {renovationCosts.map((item, index) => (
                  <div key={index} className="list-item">
                    <div className="list-item-header">
                      <h4>Renovation {index + 1}</h4>
                      {renovationCosts.length > 1 && (
                        <button
                          onClick={() => removeRenovationCost(index)}
                          className="btn-remove"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>What</label>
                        <input
                          type="text"
                          value={item.what}
                          onChange={(e) =>
                            updateRenovationCost(index, 'what', e.target.value)
                          }
                          placeholder="e.g., Kitchen Remodel"
                        />
                      </div>
                      <div className="form-group">
                        <label>Estimated Cost</label>
                        <div className="input-with-prefix">
                          <span className="input-prefix">$</span>
                          <input
                            type="text"
                            value={item.cost}
                            onChange={(e) =>
                              updateRenovationCost(index, 'cost', e.target.value)
                            }
                            placeholder="30,000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {renovationCosts.length < 5 && (
                  <button onClick={addRenovationCost} className="btn-add">
                    + Add Custom Renovation
                  </button>
                )}
              </>
            )}

            <div className="page-actions">
              <button onClick={prevPage} className="btn-secondary">
                ← Previous
              </button>
              <button onClick={nextPage} className="btn-primary">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Part 5: Gut-Check Price */}
        {currentPage === 5 && (
          <div className="questionnaire-page">
            <h2>
              <span className="page-icon">💰</span>
              Part 5: Your Gut-Check Price
            </h2>
            <p className="page-description">
              After considering everything, what's the maximum you'd pay for this
              property in its current state?
            </p>

            <div className="gut-check-section">
              <div className="form-group">
                <label htmlFor="gutCheckPrice">Your Maximum Price</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    id="gutCheckPrice"
                    value={gutCheckPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setGutCheckPrice(
                        value ? parseInt(value).toLocaleString() : ''
                      );
                    }}
                    placeholder="500,000"
                    className="input-large"
                  />
                </div>
                <small>
                  This is your personal ceiling - what you're willing to pay before
                  walking away
                </small>
              </div>

              <div className="info-box">
                <h4>Ready to Generate Your Report</h4>
                <p>
                  We'll analyze all your inputs along with market data to create a
                  comprehensive negotiation report with:
                </p>
                <ul>
                  <li>A recommended offer price or range</li>
                  <li>Detailed rationale for the recommendation</li>
                  <li>5 key negotiation talking points</li>
                  <li>Strategic advice based on market conditions</li>
                </ul>
              </div>
            </div>

            <div className="page-actions">
              <button onClick={prevPage} className="btn-secondary">
                ← Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary btn-large"
              >
                {loading ? 'Generating Report...' : 'Generate Negotiation Report'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;
