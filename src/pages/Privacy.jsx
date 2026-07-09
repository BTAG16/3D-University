import React from 'react';
import { useNavigate } from 'react-router-dom';

const ACCENT = '#0EA5E9';
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'admin@your-domain.com';
const lastUpdated = 'December 7, 2024';

/* ── Shared helpers ──────────────────────────────────── */

const baseStyle = {
  minHeight: '100vh',
  background: 'var(--bg, #0B1120)',
  color: 'var(--text-primary, #F1F5F9)',
  fontFamily: 'var(--font-display, Outfit), var(--font-body, Inter), system-ui, sans-serif',
};

const Section = ({ id, title, children }) => (
  <section id={id} style={{ scrollMarginTop: '5rem', marginBottom: '3rem' }}>
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
    success: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  color: '#6EE7B7' },
  };
  const s = map[type];
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
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: 32, height: 32,
              background: `linear-gradient(135deg, ${ACCENT}, #38BDF8)`,
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>C</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary, #F1F5F9)' }}>Campus Explorer</span>
          </div>
          <p style={{ color: 'var(--text-tertiary, #64748B)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
            Modern 3D campus mapping platform for universities worldwide.
          </p>
        </div>

        {/* Links */}
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

        {/* Contact */}
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary, #F1F5F9)', marginBottom: '0.75rem' }}>Contact</h3>
          <a href={`mailto:${contactEmail}`} style={{ color: ACCENT, textDecoration: 'none', fontSize: '0.8125rem' }}>
            {contactEmail}
          </a>
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

/* ── Privacy Page ────────────────────────────────────── */

const Privacy = () => {
  const navigate = useNavigate();

  const toc = [
    'Introduction',
    'Information We Collect',
    'How We Use Your Information',
    'Legal Basis for Processing',
    'Data Sharing and Third Parties',
    'Your Rights Under GDPR',
    'Data Retention',
    'International Data Transfers',
    'Security Measures',
    'Cookies and Tracking',
    "Children's Privacy",
    'Changes to This Policy',
    'Contact Us',
  ];

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Privacy Policy
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '52rem', margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>

        {/* Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800, marginBottom: '0.75rem', fontFamily: 'var(--font-display, Outfit), system-ui, sans-serif', color: 'var(--text-primary, #F1F5F9)' }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-tertiary, #64748B)', fontSize: '0.9375rem' }}>
            Last updated: <span style={{ color: ACCENT }}>{lastUpdated}</span>
          </p>
          <div style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', background: `rgba(14,165,233,0.07)`, border: `1px solid rgba(14,165,233,0.2)`, borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>TL;DR:</strong> We respect your privacy. We collect minimal data necessary to provide our services, never sell your information, and you have full control over your data.
          </div>
        </div>

        {/* Table of contents */}
        <div style={{ marginBottom: '3rem', padding: '1.25rem 1.5rem', background: 'var(--surface, #111B2E)', border: '1px solid var(--border, #1E2D45)', borderRadius: '0.75rem' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary, #64748B)', marginBottom: '0.75rem' }}>Table of Contents</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {toc.map((item, i) => (
              <a key={i} href={`#s${i + 1}`} style={{ color: 'var(--text-secondary, #94A3B8)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = ACCENT}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary, #94A3B8)'}>
                {i + 1}. {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <Section id="s1" title="1. Introduction">
          <p>Welcome to Campus Explorer ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 3D campus mapping platform and related services (the "Service").</p>
          <p>Campus Explorer is committed to protecting your privacy and ensuring transparency in our data practices. This policy complies with the EU General Data Protection Regulation (GDPR) and other applicable data protection laws.</p>
          <InfoBox type="info">By using our Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not use our Service.</InfoBox>
        </Section>

        <Section id="s2" title="2. Information We Collect">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #F1F5F9)', marginBottom: '0.5rem' }}>2.1 Information You Provide</h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Account Information:</strong> Email address, university name, and password (encrypted)</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Profile Data:</strong> Optional profile information you choose to provide</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Content:</strong> Building data, room information, and map configurations you create</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Communications:</strong> Messages you send to our support team</li>
          </ul>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary, #F1F5F9)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>2.2 Automatically Collected Information</h3>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Device Information:</strong> Browser type, operating system, IP address</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Location Data:</strong> General location information (city/country level only)</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Cookies:</strong> See Section 10 for detailed cookie information</li>
          </ul>
          <InfoBox type="warning">We do NOT collect: Social Security numbers, financial information, precise geolocation data, or any sensitive personal data unless explicitly required and consented to.</InfoBox>
        </Section>

        <Section id="s3" title="3. How We Use Your Information">
          <p>We use your information for the following purposes:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Service Delivery:</strong> Provide, maintain, and improve our campus mapping platform</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Account Management:</strong> Create and manage your account, authenticate users</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Communication:</strong> Send service-related emails, respond to inquiries</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Analytics:</strong> Understand usage patterns and improve user experience</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
          </ul>
        </Section>

        <Section id="s4" title="4. Legal Basis for Processing (GDPR)">
          <p>Under GDPR, we process your personal data based on the following legal grounds:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[
              ['Contract Performance', 'Processing necessary to provide our Service to you'],
              ['Consent', 'Where you have given explicit consent (e.g., marketing emails)'],
              ['Legitimate Interests', 'For analytics, security, and service improvement'],
              ['Legal Obligation', 'To comply with applicable laws and regulations'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '0.875rem 1rem', background: 'var(--surface, #111B2E)', border: '1px solid var(--border, #1E2D45)', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
                <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>{title}:</strong> {desc}
              </div>
            ))}
          </div>
        </Section>

        <Section id="s5" title="5. Data Sharing and Third Parties">
          <p>We do not sell, rent, or trade your personal information. We may share data with:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Service Providers:</strong> Hosting, analytics, and infrastructure partners bound by confidentiality</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Legal Requirements:</strong> When required by law, court order, or governmental authority</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
          <InfoBox type="info">All third-party processors are contractually required to protect your data in accordance with GDPR and our privacy standards.</InfoBox>
        </Section>

        <Section id="s6" title="6. Your Rights Under GDPR">
          <p>As a data subject, you have the following rights:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[
              ['Right to Access', 'Request a copy of the personal data we hold about you'],
              ['Right to Rectification', 'Request correction of inaccurate or incomplete data'],
              ['Right to Erasure', 'Request deletion of your personal data ("right to be forgotten")'],
              ['Right to Portability', 'Receive your data in a structured, machine-readable format'],
              ['Right to Object', 'Object to processing based on legitimate interests or for direct marketing'],
              ['Right to Restrict', 'Request restriction of processing in certain circumstances'],
            ].map(([right, desc]) => (
              <div key={right} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--surface, #111B2E)', border: '1px solid var(--border, #1E2D45)', borderRadius: '0.5rem' }}>
                <span style={{ color: ACCENT, fontWeight: 700, flexShrink: 0, fontSize: '0.875rem' }}>→</span>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
                  <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>{right}:</strong> {desc}
                </div>
              </div>
            ))}
          </div>
          <InfoBox type="info">To exercise any of these rights, contact us at <a href={`mailto:${contactEmail}`} style={{ color: ACCENT }}>{contactEmail}</a>. We will respond within 30 days.</InfoBox>
        </Section>

        <Section id="s7" title="7. Data Retention">
          <p>We retain your personal data only as long as necessary for the purposes outlined in this policy:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Account Data:</strong> Retained for the duration of your account plus 90 days after deletion</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Usage Logs:</strong> Retained for up to 12 months for security and analytics purposes</li>
            <li><strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Legal Records:</strong> Retained as required by applicable law (typically 7 years)</li>
          </ul>
        </Section>

        <Section id="s8" title="8. International Data Transfers">
          <p>Your data may be processed in countries outside your home country. When transferring data outside the EEA, we ensure adequate protection through:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
            <li>Adequacy decisions for countries with equivalent protection</li>
            <li>Binding Corporate Rules where applicable</li>
          </ul>
        </Section>

        <Section id="s9" title="9. Security Measures">
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>TLS/SSL encryption for all data in transit</li>
            <li>AES-256 encryption for data at rest</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and multi-factor authentication for staff</li>
            <li>Incident response plan for data breaches</li>
          </ul>
          <InfoBox type="warning">While we use best practices, no system is 100% secure. In the event of a data breach affecting your rights, we will notify you within 72 hours as required by GDPR.</InfoBox>
        </Section>

        <Section id="s10" title="10. Cookies and Tracking">
          <p>We use the following types of cookies:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[
              ['Essential', 'Required for the Service to function — cannot be disabled'],
              ['Analytics', 'Help us understand how you use the platform (opt-out available)'],
              ['Preferences', 'Remember your settings like dark mode and language (opt-out available)'],
            ].map(([name, desc]) => (
              <div key={name} style={{ padding: '0.75rem 1rem', background: 'var(--surface, #111B2E)', border: '1px solid var(--border, #1E2D45)', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
                <strong style={{ color: ACCENT }}>{name}:</strong> {desc}
              </div>
            ))}
          </div>
          <p style={{ marginTop: '0.5rem' }}>You can manage cookie preferences through the cookie consent banner or your browser settings.</p>
        </Section>

        <Section id="s11" title="11. Children's Privacy">
          <p>Our Service is not directed to children under 16 years of age. We do not knowingly collect personal data from children. If you become aware that a child has provided us with personal information, please contact us immediately.</p>
        </Section>

        <Section id="s12" title="12. Changes to This Policy">
          <p>We may update this Privacy Policy periodically. We will notify you of material changes by:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Posting the new policy on this page with an updated "Last updated" date</li>
            <li>Sending an email notification to registered users</li>
            <li>Displaying a banner in the Service for 30 days</li>
          </ul>
        </Section>

        <Section id="s13" title="13. Contact Us">
          <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
          <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'var(--surface, #111B2E)', border: '1px solid var(--border, #1E2D45)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
              <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Email:</strong>{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: ACCENT, textDecoration: 'none' }}>{contactEmail}</a>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
              <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Data Protection Officer:</strong>{' '}
              <a href={`mailto:${contactEmail}`} style={{ color: ACCENT, textDecoration: 'none' }}>{contactEmail}</a>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
              <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>Response Time:</strong> We aim to respond within 48 hours
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)' }}>
              <strong style={{ color: 'var(--text-primary, #F1F5F9)' }}>GDPR Requests:</strong> Processed within 30 days as required by law
            </div>
          </div>
          <InfoBox type="info">
            <strong>EU Representative:</strong> If you are in the EU and have a complaint about our data practices, you have the right to lodge a complaint with your local supervisory authority.
          </InfoBox>
        </Section>

        {/* CTA */}
        <div style={{
          marginTop: '1rem',
          padding: '2rem',
          background: `linear-gradient(135deg, rgba(14,165,233,0.1), rgba(56,189,248,0.06))`,
          border: `1px solid rgba(14,165,233,0.2)`,
          borderRadius: '1rem',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary, #F1F5F9)', fontFamily: 'var(--font-display, Outfit), system-ui, sans-serif' }}>Your Privacy Matters</h2>
          <p style={{ color: 'var(--text-secondary, #94A3B8)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            We're committed to protecting your personal data and being transparent about our practices.
          </p>
          <a
            href={`mailto:${contactEmail}`}
            style={{
              display: 'inline-block',
              padding: '0.625rem 1.5rem',
              background: ACCENT,
              color: '#fff',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Contact Privacy Team
          </a>
        </div>
      </main>

      <PageFooter />
    </div>
  );
};

export default Privacy;
