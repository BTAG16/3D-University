import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Download, Trash2, FileText, Lock, Globe, Users, Clock, AlertCircle } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();
  const lastUpdated = "December 1, 2024";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#667eea]" />
            <span className="font-semibold">Privacy Policy</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg">
            Last updated: <span className="text-[#667eea]">{lastUpdated}</span>
          </p>
          <div className="mt-6 p-4 bg-[#667eea]/10 border border-[#667eea]/20 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong>TL;DR:</strong> We respect your privacy. We collect minimal data necessary to 
              provide our services, never sell your information, and you have full control over your data.
            </p>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 p-6 bg-white/5 rounded-lg border border-white/10">
          <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            {[
              "Introduction",
              "Information We Collect",
              "How We Use Your Information",
              "Legal Basis for Processing",
              "Data Sharing and Third Parties",
              "Your Rights Under GDPR",
              "Data Retention",
              "International Data Transfers",
              "Security Measures",
              "Cookies and Tracking",
              "Children's Privacy",
              "Changes to This Policy",
              "Contact Us"
            ].map((item, index) => (
              <a
                key={index}
                href={`#section-${index + 1}`}
                className="block text-gray-400 hover:text-[#667eea] transition-colors"
              >
                {index + 1}. {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* Section 1: Introduction */}
          <Section
            id="section-1"
            icon={<FileText className="w-6 h-6" />}
            title="1. Introduction"
          >
            <p>
              Welcome to Campus Explorer ("we," "our," or "us"). This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you use our 3D campus mapping 
              platform and related services (the "Service").
            </p>
            <p>
              Campus Explorer is committed to protecting your privacy and ensuring transparency in our 
              data practices. This policy complies with the EU General Data Protection Regulation (GDPR) 
              and other applicable data protection laws.
            </p>
            <InfoBox type="info">
              By using our Service, you agree to the collection and use of information in accordance 
              with this policy. If you do not agree with this policy, please do not use our Service.
            </InfoBox>
          </Section>

          {/* Section 2: Information We Collect */}
          <Section
            id="section-2"
            icon={<Users className="w-6 h-6" />}
            title="2. Information We Collect"
          >
            <h3 className="text-xl font-semibold mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Account Information:</strong> Email address, university name, and password (encrypted)</li>
              <li><strong>Profile Data:</strong> Optional profile information you choose to provide</li>
              <li><strong>Content:</strong> Building data, room information, and map configurations you create</li>
              <li><strong>Communications:</strong> Messages you send to our support team</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Location Data:</strong> General location information (city/country level only)</li>
              <li><strong>Cookies:</strong> See Section 10 for detailed cookie information</li>
            </ul>

            <InfoBox type="warning">
              We do NOT collect: Social Security numbers, financial information, precise geolocation data, 
              or any sensitive personal data unless explicitly required and consented to.
            </InfoBox>
          </Section>

          {/* Section 3: How We Use Your Information */}
          <Section
            id="section-3"
            icon={<Lock className="w-6 h-6" />}
            title="3. How We Use Your Information"
          >
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong>Service Delivery:</strong> Provide, maintain, and improve our campus mapping platform</li>
              <li><strong>Account Management:</strong> Create and manage your account, authenticate users</li>
              <li><strong>Communication:</strong> Send service-related emails, respond to inquiries</li>
              <li><strong>Analytics:</strong> Understand usage patterns and improve user experience</li>
              <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Legal Compliance:</strong> Comply with legal obligations and enforce our terms</li>
            </ul>
          </Section>

          {/* Section 4: Legal Basis */}
          <Section
            id="section-4"
            icon={<Shield className="w-6 h-6" />}
            title="4. Legal Basis for Processing (GDPR)"
          >
            <p>Under GDPR, we process your personal data based on the following legal grounds:</p>
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-white/5 rounded-lg">
                <strong>Contract Performance:</strong> Processing necessary to provide our Service to you
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <strong>Consent:</strong> Where you have given explicit consent (e.g., marketing emails)
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <strong>Legitimate Interests:</strong> For analytics, security, and service improvement
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <strong>Legal Obligation:</strong> To comply with applicable laws and regulations
              </div>
            </div>
          </Section>

          {/* Section 5: Data Sharing */}
          <Section
            id="section-5"
            icon={<Globe className="w-6 h-6" />}
            title="5. Data Sharing and Third Parties"
          >
            <p>We do NOT sell your personal data. We may share your information with:</p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Service Providers</h3>
            <div className="space-y-3">
              <ThirdPartyCard
                name="Supabase"
                purpose="Database hosting and authentication"
                dataShared="Account information, user content"
                gdprCompliant={true}
              />
              <ThirdPartyCard
                name="Mapbox"
                purpose="Map rendering and geospatial services"
                dataShared="Usage data, map interactions"
                gdprCompliant={true}
              />
              <ThirdPartyCard
                name="Resend"
                purpose="Transactional email delivery"
                dataShared="Email addresses, notification content"
                gdprCompliant={true}
              />
            </div>

            <InfoBox type="info" className="mt-6">
              All our service providers are GDPR-compliant and have signed Data Processing Agreements 
              (DPAs) ensuring your data is handled securely and in compliance with regulations.
            </InfoBox>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Legal Requirements</h3>
            <p>
              We may disclose your information if required by law, court order, or government request, 
              or to protect our rights, property, or safety.
            </p>
          </Section>

          {/* Section 6: Your Rights */}
          <Section
            id="section-6"
            icon={<Download className="w-6 h-6" />}
            title="6. Your Rights Under GDPR"
          >
            <p>You have the following rights regarding your personal data:</p>
            
            <div className="mt-6 space-y-4">
              <RightCard
                title="Right to Access"
                description="Request a copy of all personal data we hold about you"
                action="Contact us to request your data"
              />
              <RightCard
                title="Right to Rectification"
                description="Correct inaccurate or incomplete personal data"
                action="Update your profile in account settings"
              />
              <RightCard
                title="Right to Erasure ('Right to be Forgotten')"
                description="Request deletion of your personal data"
                action="Use 'Delete Account' in settings or contact us"
              />
              <RightCard
                title="Right to Data Portability"
                description="Receive your data in a machine-readable format"
                action="Export your data from account settings"
              />
              <RightCard
                title="Right to Object"
                description="Object to processing based on legitimate interests"
                action="Contact us with your objection"
              />
              <RightCard
                title="Right to Restrict Processing"
                description="Request limitation of how we process your data"
                action="Contact us to request restrictions"
              />
              <RightCard
                title="Right to Withdraw Consent"
                description="Withdraw consent for processing at any time"
                action="Adjust settings or contact us"
              />
            </div>

            <InfoBox type="info" className="mt-6">
              To exercise any of these rights, please contact us at <a href="mailto:privacy@campusexplorer.com" className="text-[#667eea] hover:underline">privacy@campusexplorer.com</a>. 
              We will respond within 30 days as required by GDPR.
            </InfoBox>
          </Section>

          {/* Section 7: Data Retention */}
          <Section
            id="section-7"
            icon={<Clock className="w-6 h-6" />}
            title="7. Data Retention"
          >
            <p>We retain your personal data only as long as necessary for the purposes outlined in this policy:</p>
            
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-white/5 rounded-lg flex justify-between items-center">
                <span><strong>Active Accounts:</strong> Duration of account + 2 years of inactivity</span>
                <span className="text-[#667eea]">2+ years</span>
              </div>
              <div className="p-4 bg-white/5 rounded-lg flex justify-between items-center">
                <span><strong>Deleted Accounts:</strong> 30-day grace period, then permanently deleted</span>
                <span className="text-[#667eea]">30 days</span>
              </div>
              <div className="p-4 bg-white/5 rounded-lg flex justify-between items-center">
                <span><strong>Analytics Data:</strong> Aggregated and anonymized</span>
                <span className="text-[#667eea]">26 months</span>
              </div>
              <div className="p-4 bg-white/5 rounded-lg flex justify-between items-center">
                <span><strong>System Logs:</strong> Security and debugging purposes</span>
                <span className="text-[#667eea]">90 days</span>
              </div>
            </div>

            <p className="mt-4">
              After these periods, data is either permanently deleted or anonymized so it can no longer 
              identify you personally.
            </p>
          </Section>

          {/* Section 8: International Transfers */}
          <Section
            id="section-8"
            icon={<Globe className="w-6 h-6" />}
            title="8. International Data Transfers"
          >
            <p>
              Your data may be transferred to and processed in countries outside the European Economic Area (EEA). 
              When this occurs, we ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>EU-U.S. Data Privacy Framework compliance</li>
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              <li>Adequacy decisions for countries with equivalent data protection laws</li>
            </ul>
            <InfoBox type="info" className="mt-4">
              Our primary data storage is located in the EU region to minimize international transfers 
              for EU users.
            </InfoBox>
          </Section>

          {/* Section 9: Security */}
          <Section
            id="section-9"
            icon={<Lock className="w-6 h-6" />}
            title="9. Security Measures"
          >
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
              <li><strong>Access Controls:</strong> Strict role-based access with multi-factor authentication</li>
              <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
              <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
              <li><strong>Backup:</strong> Regular encrypted backups with disaster recovery plans</li>
            </ul>
            <InfoBox type="warning" className="mt-4">
              While we implement strong security measures, no system is 100% secure. Please use a strong, 
              unique password and enable two-factor authentication if available.
            </InfoBox>
          </Section>

          {/* Section 10: Cookies */}
          <Section
            id="section-10"
            icon={<AlertCircle className="w-6 h-6" />}
            title="10. Cookies and Tracking Technologies"
          >
            <p>We use cookies and similar technologies to enhance your experience:</p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Cookie Types:</h3>
            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <strong>Essential Cookies</strong>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Required</span>
                </div>
                <p className="text-sm text-gray-400">
                  Necessary for the website to function (authentication, security, preferences)
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <strong>Analytics Cookies</strong>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Optional</span>
                </div>
                <p className="text-sm text-gray-400">
                  Help us understand how you use our site (anonymous usage statistics)
                </p>
              </div>
            </div>

            <p className="mt-4">
              You can manage cookie preferences at any time through our cookie consent banner or your 
              browser settings. Disabling certain cookies may limit functionality.
            </p>
          </Section>

          {/* Section 11: Children's Privacy */}
          <Section
            id="section-11"
            icon={<Shield className="w-6 h-6" />}
            title="11. Children's Privacy"
          >
            <p>
              Our Service is intended for university administrators and staff. We do not knowingly collect 
              personal information from individuals under 16 years of age without parental consent. If you 
              believe we have collected information from a child, please contact us immediately.
            </p>
          </Section>

          {/* Section 12: Changes to Policy */}
          <Section
            id="section-12"
            icon={<FileText className="w-6 h-6" />}
            title="12. Changes to This Privacy Policy"
          >
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Posting the new policy on this page with an updated "Last Updated" date</li>
              <li>Sending an email notification to registered users</li>
              <li>Displaying a prominent notice on our platform</li>
            </ul>
            <p className="mt-4">
              We encourage you to review this policy periodically. Your continued use of the Service after 
              changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          {/* Section 13: Contact Us */}
          <Section
            id="section-13"
            icon={<Users className="w-6 h-6" />}
            title="13. Contact Us"
          >
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="mt-6 p-6 bg-white/5 rounded-lg space-y-3">
              <div>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@campusexplorer.com" className="text-[#667eea] hover:underline">
                  privacy@campusexplorer.com
                </a>
              </div>
              <div>
                <strong>Data Protection Officer:</strong>{' '}
                <a href="mailto:dpo@campusexplorer.com" className="text-[#667eea] hover:underline">
                  dpo@campusexplorer.com
                </a>
              </div>
              <div>
                <strong>Response Time:</strong> We aim to respond within 48 hours
              </div>
              <div>
                <strong>GDPR Requests:</strong> Processed within 30 days as required by law
              </div>
            </div>

            <InfoBox type="info" className="mt-6">
              <strong>EU Representative:</strong> If you are in the EU and have a complaint about our data practices, 
              you have the right to lodge a complaint with your local supervisory authority.
            </InfoBox>
          </Section>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 p-8 bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 rounded-2xl border border-[#667eea]/20 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Privacy Matters</h2>
          <p className="text-gray-300 mb-6">
            We're committed to protecting your personal data and being transparent about our practices.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => window.location.href = 'mailto:privacy@campusexplorer.com'}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
            >
              Contact Privacy Team
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Campus Explorer. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Helper Components
const Section = ({ id, icon, title, children }) => (
  <section id={id} className="scroll-mt-20">
    <div className="flex items-center gap-3 mb-6">
      <div className="text-[#667eea]">{icon}</div>
      <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
    </div>
    <div className="space-y-4 text-gray-300 leading-relaxed">
      {children}
    </div>
  </section>
);

const InfoBox = ({ type = 'info', children, className = '' }) => {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} ${className}`}>
      {children}
    </div>
  );
};

const ThirdPartyCard = ({ name, purpose, dataShared, gdprCompliant }) => (
  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
    <div className="flex justify-between items-start mb-2">
      <strong className="text-lg">{name}</strong>
      {gdprCompliant && (
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
          GDPR Compliant
        </span>
      )}
    </div>
    <p className="text-sm text-gray-400 mb-1">
      <strong>Purpose:</strong> {purpose}
    </p>
    <p className="text-sm text-gray-400">
      <strong>Data Shared:</strong> {dataShared}
    </p>
  </div>
);

const RightCard = ({ title, description, action }) => (
  <div className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#667eea]/30 transition-colors">
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-sm text-gray-400 mb-3">{description}</p>
    <p className="text-sm text-[#667eea]">→ {action}</p>
  </div>
);

export default Privacy;
