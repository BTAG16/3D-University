import React from 'react';
import { useNavigate } from 'react-router-dom';

const ACCENT = '#0EA5E9';
const contactEmail = 'seuncloud03@gmail.com';
const lastUpdated = 'December 7, 2024';

/* ── Shared helpers ──────────────────────────────────── */

const baseStyle = {
  minHeight: '100vh',
  background: 'var(--bg, #0B1120)',
  color: 'var(--text-primary, #F1F5F9)',
  fontFamily: 'var(--font-display, Outfit), var(--font-body, Inter), system-ui, sans-serif',
};

const Section = ({ title, children }) => (
  <section style={{ marginBottom: '3rem' }}>
    <h2 style={{
      fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
      fontWeight: 700,
      marginBottom: '1rem',
      color: 'var(--text-primary, #F1F5F9)',
      fontFamily: 'var(--font-display, Outfit), system-ui, sans-serif',
      borderLeft: `3px solid ${ACCENT}`,
      paddingLeft: '0.75rem',
    }}>{title}</h2>
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      color: 'var(--text-secondary, #94A3B8)', lineHeight: '1.75',
    }}>
      {children}
    </div>
  </section>
);

const InfoBox = ({ type = 'info', children }) => {
  const map = {
    info:    { bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.25)',  color: '#7DD3FC' },
    warning: { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  color: '#FCD34D' },
    danger:  { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   color: '#FCA5A5' },
    success: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  color: '#6EE7B7' },
  };
  const s = map[type] || map.info;
  return (
    <div style={{
      padding: '0.875rem 1rem',
      borderRadius: '0.5rem',
      border: `1px solid ${s.border}`,
      background: s.bg,
      color: s.color,
      fontSize: '0.875rem',
      lineHeight: '1.6',
    }}>
      {children}
    </div>
  );
};

const LegalBox = ({ color, children }) => (
  <div style={{
    padding: '1.25rem',
    background: `rgba(${color},0.06)`,
    border: `1px solid rgba(${color},0.2)`,
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    lineHeight: 1.7,
    color: 'var(--text-secondary, #94A3B8)',
  }}>
    {children}
  </div>
);

const PageFooter = () => (
  <footer style={{
    borderTop: '1px solid var(--border, #1E2D45)',
    marginTop: '5rem',
    padding: '3rem 1.5rem',
    background: 'var(--surface, #111B2E)',
  }}>
    <div style={{ maxWidth: '52rem', margin: '0 auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${ACCENT}, #38BDF8)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>C</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary, #F1F5F9)' }}>Campus Explorer</span>
          </div>
          <p style={{ color: 'var(--text-tertiary, #64748B)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
            Modern 3D campus mapping platform for universities worldwide.
          </p>
        </div>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary, #F1F5F9)', marginBottom: '0.75rem' }}>Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {[['/', 'Home'], ['/privacy', 'Privacy Policy'], ['/terms', 'Terms of Service']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'var(--text-tertiary, #64748B)', textDecoration: 'none', fontSize: '0.8125rem' }}
                onMouseEnter={e => e.target.style.color = ACCENT}
                onMouseLeave={e => e.target.style.color = 'var(--text-tertiary, #64748B)'}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary, #F1F5F9)', marginBottom: '0.75rem' }}>Contact</h3>
          <a href={`mailto:${contactEmail}`} style={{ color: ACCENT, textDecoration: 'none', fontSize: '0.8125rem' }}>{contactEmail}</a>
          <p style={{ color: 'var(--text-tertiary, #64748B)', fontSize: '0.75rem', marginTop: '0.4rem' }}>Responds within 48 hours</p>
        </div>
      </div>
      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border, #1E2D45)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary, #64748B)', fontSize: '0.8125rem' }}>
          © {new Date().getFullYear()} Campus Explorer. All rights reserved. &nbsp;·&nbsp; GDPR Compliant
        </p>
      </div>
    </div>
  </footer>
);

/* ── Terms Page ──────────────────────────────────────── */

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div style={baseStyle}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(11,17,32,0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border, #1E2D45)',
      }}>
        <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-tertiary, #64748B)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', padding: '6px 10px', borderRadius: 8, transition: 'color 0.15s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary, #F1F5F9)'; e.currentTarget.style.background = 'var(--surface, #111B2E)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary, #64748B)'; e.currentTarget.style.background = 'transparent'; }}
          >
            ← Back to Home
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: ACCENT }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Terms of Service
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '52rem', margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>

        {/* Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800, marginBottom: '0.75rem', fontFamily: 'var(--font-display, Outfit), system-ui, sans-serif', color: 'var(--text-primary, #F1F5F9)' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-tertiary, #64748B)', fontSize: '0.9375rem' }}>
            Last updated: <span style={{ color: ACCENT }}>{lastUpdated}</span>
          </p>
          <div style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', background: `rgba(14,165,233,0.07)`, border: `1px solid rgba(14,165,233,0.2)`, borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>TL;DR:</strong> Use our platform respectfully, don't break things, we're not liable for everything, and you retain ownership of your content. Standard legal stuff.
          </div>
        </div>

        {/* Sections */}
        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Campus Explorer ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.</p>
          <InfoBox type="warning">These Terms constitute a legally binding agreement between you and Campus Explorer ("Company," "we," "us," or "our").</InfoBox>
        </Section>

        <Section title="2. Description of Service">
          <p>Campus Explorer provides a 3D campus mapping platform designed for educational institutions. The Service includes:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Interactive 3D campus maps</li>
            <li>Building and room management tools</li>
            <li>Navigation and wayfinding features</li>
            <li>Administrative dashboard and analytics</li>
            <li>API access (for applicable subscription tiers)</li>
          </ul>
          <p>We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time with or without notice.</p>
        </Section>

        <Section title="3. Account Registration and Security">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #F1F5F9)', marginBottom: '0.5rem' }}>3.1 Account Creation</h3>
          <p>To use certain features of the Service, you must register for an account. You agree to:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #F1F5F9)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>3.2 Account Eligibility</h3>
          <p>You must be at least 18 years old or have reached the age of majority in your jurisdiction to create an account. Accounts are intended for authorized university administrators only.</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #F1F5F9)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>3.3 Account Termination</h3>
          <p>We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.</p>
        </Section>

        <Section title="4. Acceptable Use Policy">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#6EE7B7', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>✓</span> You May:
              </h3>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>Use the Service for legitimate educational and administrative purposes</li>
                <li>Create and manage campus maps for your institution</li>
                <li>Integrate the Service with other authorized tools</li>
                <li>Export your own data as permitted by your subscription</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FCA5A5', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>✗</span> You May Not:
              </h3>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
          <InfoBox type="warning">Violation of this Acceptable Use Policy may result in immediate account suspension or termination without refund.</InfoBox>
        </Section>

        <Section title="5. Intellectual Property Rights">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #F1F5F9)', marginBottom: '0.5rem' }}>5.1 Our Intellectual Property</h3>
          <p>The Service, including all software, designs, text, graphics, logos, and other content, is owned by Campus Explorer and protected by copyright, trademark, and other intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service solely as permitted by these Terms.</p>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #F1F5F9)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>5.2 Your Content</h3>
          <p>You retain ownership of all content you upload to the Service ("User Content"). By uploading User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, display, and process your User Content solely to provide the Service.</p>
          <InfoBox type="info">We will never sell your User Content or use it for purposes other than providing and improving the Service.</InfoBox>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #F1F5F9)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>5.3 User Content Responsibility</h3>
          <p>You are solely responsible for your User Content and warrant that:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>You own or have rights to all User Content you upload</li>
            <li>User Content does not violate any third-party rights</li>
            <li>User Content complies with all applicable laws</li>
            <li>User Content does not contain malicious code or harmful materials</li>
          </ul>
        </Section>

        <Section title="6. Payment and Subscription">
          <p>Certain features of the Service require a paid subscription. By subscribing, you agree to:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Pay all applicable fees as described in the pricing plan you select</li>
            <li>Provide accurate billing information</li>
            <li>Authorize us to charge your payment method on a recurring basis</li>
          </ul>
          <p>Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date. Refunds are evaluated on a case-by-case basis.</p>
        </Section>

        <Section title="7. Warranties and Disclaimers">
          <LegalBox color="234,179,8">
            <p style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#FCD34D' }}>Important Legal Notice</p>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
            <p style={{ marginTop: '0.5rem' }}>WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS.</p>
          </LegalBox>
          <p>We make reasonable efforts to ensure the accuracy and reliability of the Service, but we cannot guarantee perfect operation at all times. Use of the Service is at your own risk.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <LegalBox color="239,68,68">
            <p style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', color: '#FCA5A5' }}>Liability Cap</p>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, CAMPUS EXPLORER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.</p>
            <p style={{ marginTop: '0.5rem' }}>OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE CLAIM.</p>
          </LegalBox>
          <InfoBox type="info">Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.</InfoBox>
        </Section>

        <Section title="9. Indemnification">
          <p>You agree to indemnify, defend, and hold harmless Campus Explorer and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of or in connection with your use of the Service or violation of these Terms.</p>
        </Section>

        <Section title="10. Privacy">
          <p>Your use of the Service is also governed by our <a href="/privacy" style={{ color: ACCENT }}>Privacy Policy</a>, which is incorporated into these Terms by reference. By using the Service, you agree to our data practices as described in the Privacy Policy.</p>
        </Section>

        <Section title="11. Third-Party Services">
          <p>The Service may contain links to or integrate with third-party websites or services. We are not responsible for the content, privacy policies, or practices of any third-party services. Your interactions with third-party services are governed by their own terms and policies.</p>
        </Section>

        <Section title="12. Modifications to Terms">
          <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Posting updated Terms on this page with a new "Last updated" date</li>
            <li>Sending a notification email to registered users</li>
            <li>Displaying a prominent notice in the Service</li>
          </ul>
          <p>Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
        </Section>

        <Section title="13. Termination">
          <p>Either party may terminate the agreement at any time. Upon termination:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Your access to the Service will cease immediately</li>
            <li>We will retain your data as required by law, then delete it per our data retention policy</li>
            <li>Any outstanding fees remain payable</li>
            <li>Provisions that by their nature should survive termination will remain in effect</li>
          </ul>
        </Section>

        <Section title="14. Governing Law and Dispute Resolution">
          <p>These Terms are governed by applicable law. Any disputes will first be attempted to be resolved through good-faith negotiation. If unresolved, disputes will be subject to binding arbitration in accordance with applicable rules, except that either party may seek injunctive relief in court for intellectual property violations.</p>
        </Section>

        <Section title="15. General Provisions">
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Campus Explorer</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Waiver:</strong> Failure to enforce any provision does not constitute a waiver of future enforcement</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Assignment:</strong> You may not assign your rights under these Terms without our prior written consent</li>
          </ul>
        </Section>

        <Section title="16. Contact Information">
          <p>If you have questions about these Terms, please contact us:</p>
          <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--surface, #111B2E)', border: '1px solid var(--border, #1E2D45)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
              <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Email:</strong>{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: ACCENT, textDecoration: 'none' }}>{contactEmail}</a>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
              <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Support:</strong>{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: ACCENT, textDecoration: 'none' }}>{contactEmail}</a>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
              <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Response time:</strong> Within 48 hours
            </div>
          </div>
        </Section>

        {/* Acknowledgment */}
        <div style={{
          marginTop: '1rem',
          padding: '1.75rem',
          background: `linear-gradient(135deg, rgba(14,165,233,0.1), rgba(56,189,248,0.05))`,
          border: `1px solid rgba(14,165,233,0.2)`,
          borderRadius: '1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary, #F1F5F9)', fontFamily: 'var(--font-display, Outfit), system-ui, sans-serif' }}>Acknowledgment</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94A3B8)', lineHeight: 1.7 }}>
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE SERVICE.
            </p>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
};

export default Terms;
