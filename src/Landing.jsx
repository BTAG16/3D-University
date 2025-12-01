import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, Check, Menu, X, ArrowRight, Star, Globe, Shield, Zap, ExternalLink } from 'lucide-react';
import { InteractiveMap } from './components/InteractiveMap';
import { MagneticButton } from './components/ui/MagneticButton';
import { FEATURES, STATS, TESTIMONIALS, PRICING } from './constants';
import './Landing.css';

export default function Landing() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Progress Bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const percent = (scrolled / scrollHeight) * 100;
      setScrollPercent(percent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cursor Follower
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({
        x: e.clientX - 300,
        y: e.clientY - 300
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Smooth Scroll
  const handleNavClick = (e, href) => {
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        setMobileMenuOpen(false);
      }
    }
  };

  // Button Click Handler
  const handleButtonClick = (text) => {
    console.log('Button clicked:', text);
  };

  return (
    <>
      {/* Progress Bar */}
      <div 
        className="progress-bar active" 
        style={{ width: `${scrollPercent}%` }}
      ></div>

      {/* Custom Cursor Follower */}
      <div 
        className="cursor-follower"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`
        }}
      ></div>

      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="logo-icon">C</div>
            <span>Campus Explorer</span>
          </div>

          {/* Desktop Nav */}
          <div className="nav-links">
            <a href="#features" className="nav-link" onClick={(e) => handleNavClick(e, '#features')}>
              Features
            </a>
            <a href="#benefits" className="nav-link" onClick={(e) => handleNavClick(e, '#benefits')}>
              Benefits
            </a>
            <a href="#testimonials" className="nav-link" onClick={(e) => handleNavClick(e, '#testimonials')}>
              Stories
            </a>
            <a href="#pricing" className="nav-link" onClick={(e) => handleNavClick(e, '#pricing')}>
              Pricing
            </a>
            <button 
              className="nav-button nav-button-signin"
              onClick={() => handleButtonClick('Sign In')}
            >
              Sign In
            </button>
            <button 
              className="nav-button nav-button-primary"
              onClick={() => handleButtonClick('Get Started')}
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? '' : 'hidden'}`}>
        <div className="mobile-menu-content">
          <a 
            href="#features" 
            className="mobile-menu-link"
            onClick={(e) => handleNavClick(e, '#features')}
          >
            Features
          </a>
          <a 
            href="#benefits" 
            className="mobile-menu-link"
            onClick={(e) => handleNavClick(e, '#benefits')}
          >
            Benefits
          </a>
          <a 
            href="#testimonials" 
            className="mobile-menu-link"
            onClick={(e) => handleNavClick(e, '#testimonials')}
          >
            Testimonials
          </a>
          <a 
            href="#pricing" 
            className="mobile-menu-link"
            onClick={(e) => handleNavClick(e, '#pricing')}
          >
            Pricing
          </a>
          <hr className="mobile-menu-divider" />
          <button 
            className="btn btn-primary mobile-menu-button"
            onClick={() => {
              handleButtonClick('Get Started Free');
              setMobileMenuOpen(false);
            }}
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">

            <h1 className="hero-title">
              Explore Campus <br />
              <span className="hero-gradient-text">In a New Dimension</span>
            </h1>

            <p className="hero-description">
              Empower students with immersive 3D maps, real-time navigation, and instant room search. The digital twin your university deserves.
            </p>

            <div className="hero-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => handleButtonClick('Get Started Free')}
              >
                Get Started Free →
              </button>
              <button 
                className="btn btn-outline"
                onClick={() => handleButtonClick('Watch Demo')}
              >
                ▶ Watch Demo
              </button>
            </div>

          </div>

          <div className="hero-right">
            <div className="interactive-map">
              <div className="map-placeholder">🗺️</div>
            </div>
          </div>
        </div>

        <div className="hero-background-beam"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">Everything you need to <br /> navigate the future</h2>
            <p className="features-subtitle">Full-stack campus mapping infrastructure designed for scale.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3 className="feature-card-title">3D Campus Maps</h3>
              <p className="feature-card-description">Interactive, photorealistic 3D models of your entire campus with real-time navigation.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3 className="feature-card-title">Real-time Navigation</h3>
              <p className="feature-card-description">Smart routing that adapts to campus conditions and student preferences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-card-title">Instant Room Search</h3>
              <p className="feature-card-description">Find any classroom, lab, or facility in seconds with intelligent search.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-card-title">Mobile First</h3>
              <p className="feature-card-description">Optimized for smartphones</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">♿</div>
              <h3 className="feature-card-title">Accessibility</h3>
              <p className="feature-card-description">Full wheelchair routing and accessibility compliance built-in.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-card-title">Real-time Updates</h3>
              <p className="feature-card-description">Instant notifications for room changes, events, and campus alerts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits-section">
        <div className="benefits-container">
          <div className="benefits-visual-wrapper">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23667eea' width='400' height='300'/%3E%3Ctext x='50%' y='50%' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3E📊%3C/text%3E%3C/svg%3E" 
              alt="Students using app"
              className="benefits-image"
            />
            <div className="benefits-floating-widget">
              <div className="widget-header">
                <div className="widget-status-dot"></div>
                <span className="widget-title">Class in 10 min</span>
              </div>
              <div className="widget-description">Route optimized for lowest walking time.</div>
            </div>
          </div>

          <div>
            <h2 className="benefits-title">Why choose us</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-check-icon">✓</div>
                <div>
                  <h4 className="benefit-item-title">Increase Student Engagement</h4>
                  <p className="benefit-item-description">Interactive maps gamify the campus discovery process.</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-check-icon">✓</div>
                <div>
                  <h4 className="benefit-item-title">Reduce Administrative Load</h4>
                  <p className="benefit-item-description">Automated timetables reduce 'where is my class' emails.</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-check-icon">✓</div>
                <div>
                  <h4 className="benefit-item-title">Accessibility Compliance</h4>
                  <p className="benefit-item-description">Native support for wheelchair-friendly routing.</p>
                </div>
              </div>
              
            </div>
            <div className="benefits-button-wrapper">
              <button 
                className="btn btn-primary"
                onClick={() => handleButtonClick('Schedule a Consultation')}
              >
                Schedule a Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">500+</div>
            <div className="stat-label">Universities</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">5M+</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">180+</div>
            <div className="stat-label">Countries</div>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="pricing-container">
          <div className="pricing-header">
            <h2 className="pricing-title">Transparent Pricing</h2>
            <p className="pricing-subtitle">Choose the plan that fits your campus size.</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-tier">
              <h3 className="pricing-tier-name">Starter</h3>
              <div className="pricing-tier-price">
                $2,999<span style={{ fontSize: '14px', color: '#9ca3af' }}> /month</span>
              </div>
              <p className="pricing-tier-description">Perfect for small campuses</p>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Up to 10,000 students</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Advanced 3D</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Email support</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Analytics dashboard</li>
              </ul>
              <button 
                className="btn btn-outline pricing-tier-button"
                onClick={() => handleButtonClick('Choose Starter')}
              >
                Choose Starter
              </button>
            </div>

            <div className="pricing-tier recommended">
              <div className="pricing-badge">Recommended</div>
              <h3 className="pricing-tier-name">Professional</h3>
              <div className="pricing-tier-price">
                $9,999<span style={{ fontSize: '14px', color: '#9ca3af' }}> /month</span>
              </div>
              <p className="pricing-tier-description">Best for growing universities</p>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Up to 50,000 students</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Advanced 3D</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Priority support</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Custom integrations</li>
              </ul>
              <button 
                className="btn btn-primary pricing-tier-button"
                onClick={() => handleButtonClick('Choose Professional')}
              >
                Choose Professional
              </button>
            </div>

            <div className="pricing-tier">
              <h3 className="pricing-tier-name">Enterprise</h3>
              <div className="pricing-tier-price">Custom</div>
              <p className="pricing-tier-description">For large university networks</p>
              <ul className="pricing-features-list">
                <li className="pricing-feature-item"><span className="check-mark">✓</span> Unlimited students</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> White-label solution</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> 24/7 dedicated support</li>
                <li className="pricing-feature-item"><span className="check-mark">✓</span> On-premise deployment</li>
              </ul>
              <button 
                className="btn btn-outline pricing-tier-button"
                onClick={() => handleButtonClick('Contact Sales')}
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="final-cta-background"></div>
        <div className="final-cta-content">
          <h2 className="final-cta-title">Ready to transform your campus?</h2>
          <p className="final-cta-description">
            Join the forward-thinking universities that are redefining student navigation today.
          </p>
          <button 
            className="btn btn-primary final-cta-button"
            onClick={() => handleButtonClick('Start Your Free Trial')}
          >
            Start Your Free Trial
          </button>

          <div className="final-cta-badges">
            <span className="cta-badge-item">🌍 GDPR Compliant</span>
            <span className="cta-badge-item">🔒 Enterprise Security</span>
            <span className="cta-badge-item">⚡ 99.9% Uptime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                <div className="footer-logo-icon"></div>
                <span>Campus Explorer</span>
              </div>
              <p className="footer-description">
                3D mapping platform for higher education institutions globally.
              </p>
            </div>

            

            <div>
              <h4 className="footer-column-title">Company</h4>
              <ul className="footer-links-list">
                
                <li><a href="#" className="footer-link">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-column-title">Legal</h4>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link">Privacy Policy</a></li>
                <li><a  href="#" className="footer-link">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2025 Campus Explorer Inc. All rights reserved.
            </div>
            <div className="footer-social-icons">
              <div className="social-icon"></div>
              <div className="social-icon"></div>
              <div className="social-icon"></div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}