import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle, CheckCircle, XCircle, Mail } from 'lucide-react';

const Terms = () => {
  const navigate = useNavigate();
  const lastUpdated = "December 7, 2024";
  const contactEmail = "seuncloud03@gmail.com";

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'white' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = 'white'}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          >
            <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
            Back to Home
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#667eea' }} />
            <span style={{ fontWeight: '600' }}>Terms of Service</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: '64rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
        {/* Title Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 'bold', marginBottom: '1rem' }}>Terms of Service</h1>
          <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
            Last updated: <span style={{ color: '#667eea' }}>{lastUpdated}</span>
          </p>
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: '0.5rem'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
              <strong>TL;DR:</strong> Use our platform respectfully, don't break things, we're not 
              liable for everything, and you retain ownership of your content. Standard legal stuff.
            </p>
          </div>
        </div>

        {/* Acceptance */}
        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Campus Explorer ("Service"), you agree to be bound by these Terms of 
            Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
          </p>
          <InfoBox type="warning">
            These Terms constitute a legally binding agreement between you and Campus Explorer Inc. 
            ("Company," "we," "us," or "our").
          </InfoBox>
        </Section>

        {/* Service Description */}
        <Section title="2. Description of Service">
          <p>
            Campus Explorer provides a 3D campus mapping platform designed for educational institutions. 
            The Service includes:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <li>Interactive 3D campus maps</li>
            <li>Building and room management tools</li>
            <li>Navigation and wayfinding features</li>
            <li>Administrative dashboard and analytics</li>
            <li>API access (for applicable subscription tiers)</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time 
            with or without notice.
          </p>
        </Section>

        {/* Account Registration */}
        <Section title="3. Account Registration and Security">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>3.1 Account Creation</h3>
          <p>
            To use certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '1.5rem' }}>3.2 Account Eligibility</h3>
          <p>
            You must be at least 18 years old or have reached the age of majority in your jurisdiction 
            to create an account. Accounts are intended for authorized university administrators only.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '1.5rem' }}>3.3 Account Termination</h3>
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms or engage in 
            fraudulent, abusive, or illegal activity.
          </p>
        </Section>

        {/* Acceptable Use */}
        <Section title="4. Acceptable Use Policy">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
                You May:
              </h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#d1d5db' }}>
                <li>Use the Service for legitimate educational and administrative purposes</li>
                <li>Create and manage campus maps for your institution</li>
                <li>Integrate the Service with other authorized tools</li>
                <li>Export your own data as permitted by your subscription</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <XCircle style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
                You May Not:
              </h3>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#d1d5db' }}>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malware, viruses, or malicious code</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Reverse engineer, decompile, or disassemble the Service</li>
                <li>Use the Service to harass, abuse, or harm others</li>
                <li>Scrape, crawl, or extract data using automated means</li>
                <li>Resell or redistribute the Service without authorization</li>
                <li>Use the Service for competitive analysis</li>
                <li>Overload or interfere with Service infrastructure</li>
              </ul>
            </div>
          </div>

          <InfoBox type="warning" style={{ marginTop: '1.5rem' }}>
            Violation of this Acceptable Use Policy may result in immediate account suspension or 
            termination without refund.
          </InfoBox>
        </Section>

        {/* Intellectual Property */}
        <Section title="5. Intellectual Property Rights">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' }}>5.1 Our Intellectual Property</h3>
          <p>
            The Service, including all software, designs, text, graphics, logos, and other content, is 
            owned by Campus Explorer and protected by copyright, trademark, and other intellectual property 
            laws. You are granted a limited, non-exclusive, non-transferable license to use the Service 
            solely as permitted by these Terms.
          </p>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '1.5rem' }}>5.2 Your Content</h3>
          <p>
            You retain ownership of all content you upload to the Service ("User Content"). By uploading 
            User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, 
            display, and process your User Content solely to provide the Service.
          </p>
          <InfoBox type="info" style={{ marginTop: '1rem' }}>
            We will never sell your User Content or use it for purposes other than providing and improving 
            the Service.
          </InfoBox>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', marginTop: '1.5rem' }}>5.3 User Content Responsibility</h3>
          <p>You are solely responsible for your User Content and warrant that:</p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <li>You own or have rights to all User Content you upload</li>
            <li>User Content does not violate any third-party rights</li>
            <li>User Content complies with all applicable laws</li>
            <li>User Content does not contain malicious code or harmful materials</li>
          </ul>
        </Section>

        {/* Warranties and Disclaimers */}
        <Section title="7. Warranties and Disclaimers">
          <div style={{
            padding: '1.5rem',
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '0.5rem'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Important Legal Notice:</p>
            <p style={{ fontSize: '0.875rem' }}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS 
              OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.75rem' }}>
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM 
              VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </div>

          <p style={{ marginTop: '1rem' }}>
            We make reasonable efforts to ensure the accuracy and reliability of the Service, but we 
            cannot guarantee perfect operation at all times. Use of the Service is at your own risk.
          </p>
        </Section>

        {/* Limitation of Liability */}
        <Section title="8. Limitation of Liability">
          <div style={{
            padding: '1.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Liability Cap:</p>
            <p style={{ fontSize: '0.875rem' }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CAMPUS EXPLORER SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS 
              OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, 
              OR OTHER INTANGIBLE LOSSES.
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.75rem' }}>
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT 
              EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO 
              THE CLAIM.
            </p>
          </div>

          <InfoBox type="info" style={{ marginTop: '1rem' }}>
            Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of 
            the above limitations may not apply to you.
          </InfoBox>
        </Section>

        {/* Contact */}
        <Section title="16. Contact Information">
          <p>
            If you have questions about these Terms, please contact us:
          </p>
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div>
              <strong>Email:</strong>{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: '#667eea', textDecoration: 'none' }}>
                {contactEmail}
              </a>
            </div>
            <div>
              <strong>Support:</strong>{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: '#667eea', textDecoration: 'none' }}>
                {contactEmail}
              </a>
            </div>
          </div>
        </Section>

        {/* Acknowledgment */}
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          background: 'linear-gradient(to right, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
          borderRadius: '1rem',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#667eea', flexShrink: 0, marginTop: '0.25rem' }} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Acknowledgment</h3>
              <p style={{ color: '#d1d5db' }}>
                BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, 
                UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, 
                YOU MUST NOT USE THE SERVICE.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer contactEmail={contactEmail} />
    </div>
  );
};

// Helper Components
const Section = ({ title, children }) => (
  <section style={{ marginBottom: '3rem' }}>
    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 'bold', marginBottom: '1.5rem' }}>{title}</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#d1d5db', lineHeight: '1.75' }}>
      {children}
    </div>
  </section>
);

const InfoBox = ({ type = 'info', children, style = {} }) => {
  const styles = {
    info: { background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd' },
    warning: { background: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.3)', color: '#fde047' },
    success: { background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.3)', color: '#86efac' },
  };

  return (
    <div style={{
      padding: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid',
      marginTop: '1rem',
      ...styles[type],
      ...style
    }}>
      {children}
    </div>
  );
};

const Footer = ({ contactEmail }) => (
  <footer style={{
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '5rem',
    padding: '3rem 1.5rem',
    backgroundColor: '#0a0a0f'
  }}>
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Company Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'linear-gradient(to top right, #667eea, #32b8c6)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold' }}>C</span>
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Campus Explorer</span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.5' }}>
            Modern 3D campus mapping platform for universities worldwide.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>Home</a>
            <a href="/privacy" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>Terms of Service</a>
            <a href="/admin/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem' }}>Admin Login</a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Contact Us</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <a
              href={`mailto:${contactEmail}`}
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Mail style={{ width: '1rem', height: '1rem' }} />
              {contactEmail}
            </a>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Response time: Within 48 hours
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          © {new Date().getFullYear()} Campus Explorer. All rights reserved.
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>
          GDPR Compliant | EU Data Privacy Framework
        </p>
      </div>
    </div>
  </footer>
);

export default Terms;
