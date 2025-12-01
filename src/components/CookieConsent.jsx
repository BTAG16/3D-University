import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart } from 'lucide-react';

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

  const saveCustomPreferences = (preferences) => {
    const consentData = {
      ...preferences,
      essential: true, // Always required
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto p-6">
        {!showDetails ? (
          // Simple Banner View
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-[#667eea]" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  We value your privacy
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We use cookies to enhance your browsing experience, analyze site traffic, and 
                personalize content. By clicking "Accept All", you consent to our use of cookies.{' '}
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-[#667eea] hover:underline font-medium"
                >
                  Customize
                </button>
                {' or '}
                <a 
                  href="/privacy" 
                  className="text-[#667eea] hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={acceptEssential}
                className="flex-1 md:flex-none px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
              >
                Essential Only
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed Preferences View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
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

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={acceptEssential}
                className="flex-1 px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
              >
                Save Preferences
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg"
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

const CookieCategory = ({ icon, title, description, required = false, id }) => {
  const [enabled, setEnabled] = React.useState(required);

  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-[#667eea] mt-1">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
          {required ? (
            <span className="text-xs bg-[#667eea]/20 text-[#667eea] px-2 py-1 rounded-full font-medium">
              Always Active
            </span>
          ) : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#667eea]/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#667eea]"></div>
            </label>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
};
