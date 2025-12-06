import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart } from 'lucide-react';
import './CookieConsent.css';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing banner slightly for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    const consentData = {
      essential: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  const acceptEssential = () => {
    const consentData = {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-banner">
      <div className="cookie-consent-container">
        {!showDetails ? (
          // Simple Banner View
          <div className="cookie-banner-simple">
            <div className="cookie-banner-content">
              <div className="cookie-banner-header">
                <Cookie className="cookie-icon" />
                <h3 className="cookie-banner-title">
                  We value your privacy
                </h3>
              </div>
              <p className="cookie-banner-description">
                We use cookies to enhance your browsing experience, analyze site traffic, and 
                personalize content. By clicking "Accept All", you consent to our use of cookies.{' '}
                <button
                  onClick={() => setShowDetails(true)}
                  className="cookie-banner-link"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  Customize
                </button>
                {' or '}
                <a 
                  href="/privacy" 
                  className="cookie-banner-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </p>
            </div>
            <div className="cookie-banner-buttons">
              <button
                onClick={acceptEssential}
                className="cookie-btn cookie-btn-secondary"
              >
                Essential Only
              </button>
              <button
                onClick={acceptAll}
                className="cookie-btn cookie-btn-primary"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed Preferences View
          <div className="cookie-preferences">
            <div className="cookie-preferences-header">
              <h3 className="cookie-preferences-title">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="cookie-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CookieCategory
              icon={<Shield className="w-5 h-5" />}
              title="Essential Cookies"
              description="Required for the website to function properly. These cannot be disabled."
              required={true}
            />

            <CookieCategory
              icon={<BarChart className="w-5 h-5" />}
              title="Analytics Cookies"
              description="Help us understand how visitors interact with our website by collecting anonymous data."
              id="analytics"
            />

            <div className="cookie-preferences-footer">
              <button
                onClick={acceptEssential}
                className="cookie-btn cookie-btn-secondary"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="cookie-btn cookie-btn-primary"
              >
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CookieCategory = ({ icon, title, description, required = false }) => {
  const [enabled, setEnabled] = React.useState(required);

  return (
    <div className="cookie-category">
      <div className="cookie-category-icon">{icon}</div>
      <div className="cookie-category-content">
        <div className="cookie-category-header">
          <h4 className="cookie-category-title">{title}</h4>
          {required ? (
            <span className="cookie-badge">
              Always Active
            </span>
          ) : (
            <label className="cookie-toggle">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span className="cookie-toggle-slider"></span>
            </label>
          )}
        </div>
        <p className="cookie-category-description">{description}</p>
      </div>
    </div>
  );
};
