import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Terms = () => {
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
            <FileText className="w-5 h-5 text-[#667eea]" />
            <span className="font-semibold">Terms of Service</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-400 text-lg">
            Last updated: <span className="text-[#667eea]">{lastUpdated}</span>
          </p>
          <div className="mt-6 p-4 bg-[#667eea]/10 border border-[#667eea]/20 rounded-lg">
            <p className="text-sm text-gray-300">
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
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Interactive 3D campus maps</li>
            <li>Building and room management tools</li>
            <li>Navigation and wayfinding features</li>
            <li>Administrative dashboard and analytics</li>
            <li>API access (for applicable subscription tiers)</li>
          </ul>
          <p className="mt-4">
            We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time 
            with or without notice.
          </p>
        </Section>

        {/* Account Registration */}
        <Section title="3. Account Registration and Security">
          <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
          <p>
            To use certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account Eligibility</h3>
          <p>
            You must be at least 18 years old or have reached the age of majority in your jurisdiction 
            to create an account. Accounts are intended for authorized university administrators only.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Account Termination</h3>
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms or engage in 
            fraudulent, abusive, or illegal activity.
          </p>
        </Section>

        {/* Acceptable Use */}
        <Section title="4. Acceptable Use Policy">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                You May:
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Use the Service for legitimate educational and administrative purposes</li>
                <li>Create and manage campus maps for your institution</li>
                <li>Integrate the Service with other authorized tools</li>
                <li>Export your own data as permitted by your subscription</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                You May Not:
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
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

          <InfoBox type="warning" className="mt-6">
            Violation of this Acceptable Use Policy may result in immediate account suspension or 
            termination without refund.
          </InfoBox>
        </Section>

        {/* Intellectual Property */}
        <Section title="5. Intellectual Property Rights">
          <h3 className="text-xl font-semibold mb-3">5.1 Our Intellectual Property</h3>
          <p>
            The Service, including all software, designs, text, graphics, logos, and other content, is 
            owned by Campus Explorer and protected by copyright, trademark, and other intellectual property 
            laws. You are granted a limited, non-exclusive, non-transferable license to use the Service 
            solely as permitted by these Terms.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Your Content</h3>
          <p>
            You retain ownership of all content you upload to the Service ("User Content"). By uploading 
            User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, 
            display, and process your User Content solely to provide the Service.
          </p>
          <InfoBox type="info" className="mt-4">
            We will never sell your User Content or use it for purposes other than providing and improving 
            the Service.
          </InfoBox>

          <h3 className="text-xl font-semibold mb-3 mt-6">5.3 User Content Responsibility</h3>
          <p>You are solely responsible for your User Content and warrant that:</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>You own or have rights to all User Content you upload</li>
            <li>User Content does not violate any third-party rights</li>
            <li>User Content complies with all applicable laws</li>
            <li>User Content does not contain malicious code or harmful materials</li>
          </ul>
        </Section>

        {/* Payment Terms */}
        <Section title="6. Payment and Subscription">
          <h3 className="text-xl font-semibold mb-3">6.1 Fees</h3>
          <p>
            Certain features of the Service require payment of fees. All fees are stated in USD and are 
            non-refundable except as required by law or as expressly stated in these Terms.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Billing</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Subscriptions are billed on a recurring basis (monthly or annually)</li>
            <li>You authorize us to charge your payment method automatically</li>
            <li>Prices may change with 30 days' notice to existing customers</li>
            <li>Failed payments may result in service suspension</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-6">6.3 Cancellation and Refunds</h3>
          <p>
            You may cancel your subscription at any time. Cancellations take effect at the end of the 
            current billing period. We offer a 14-day money-back guarantee for annual plans only.
          </p>
        </Section>

        {/* Warranties and Disclaimers */}
        <Section title="7. Warranties and Disclaimers">
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="font-semibold mb-3 uppercase">Important Legal Notice:</p>
            <p className="text-sm">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS 
              OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
              PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-sm mt-3">
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE FROM 
              VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </div>

          <p className="mt-4">
            We make reasonable efforts to ensure the accuracy and reliability of the Service, but we 
            cannot guarantee perfect operation at all times. Use of the Service is at your own risk.
          </p>
        </Section>

        {/* Limitation of Liability */}
        <Section title="8. Limitation of Liability">
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="font-semibold mb-3 uppercase">Liability Cap:</p>
            <p className="text-sm">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CAMPUS EXPLORER SHALL NOT BE LIABLE FOR ANY 
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS 
              OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, 
              OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-sm mt-3">
              OUR TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT 
              EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO 
              THE CLAIM.
            </p>
          </div>

          <InfoBox type="info" className="mt-4">
            Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of 
            the above limitations may not apply to you.
          </InfoBox>
        </Section>

        {/* Indemnification */}
        <Section title="9. Indemnification">
          <p>
            You agree to indemnify, defend, and hold harmless Campus Explorer, its officers, directors, 
            employees, and agents from any claims, damages, losses, liabilities, and expenses (including 
            reasonable attorneys' fees) arising out of or related to:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Your use or misuse of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your User Content</li>
            <li>Your violation of any rights of another party</li>
            <li>Your violation of any applicable laws</li>
          </ul>
        </Section>

        {/* Privacy */}
        <Section title="10. Privacy">
          <p>
            Your use of the Service is also governed by our Privacy Policy, which is incorporated into 
            these Terms by reference. Please review our{' '}
            <a href="/privacy" className="text-[#667eea] hover:underline">Privacy Policy</a> to 
            understand our data practices.
          </p>
        </Section>

        {/* Third-Party Services */}
        <Section title="11. Third-Party Services">
          <p>
            The Service may integrate with or contain links to third-party services, websites, or 
            applications. We are not responsible for the content, functionality, privacy practices, or 
            terms of any third-party services. Your use of third-party services is at your own risk 
            and subject to their respective terms.
          </p>
          <p className="mt-4">Third-party services we use include:</p>
          <ul className="list-disc list-inside space-y-2 mt-2 text-gray-300">
            <li>Supabase (database and authentication)</li>
            <li>Mapbox (mapping services)</li>
            <li>Resend (email delivery)</li>
          </ul>
        </Section>

        {/* Termination */}
        <Section title="12. Termination">
          <p>
            Either party may terminate these Terms at any time. You may terminate by canceling your 
            subscription and ceasing use of the Service. We may terminate or suspend your access 
            immediately, without prior notice, for any reason, including:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Violation of these Terms</li>
            <li>Fraudulent or illegal activity</li>
            <li>Non-payment of fees</li>
            <li>Request by law enforcement</li>
            <li>Extended inactivity</li>
          </ul>
          <p className="mt-4">
            Upon termination, your right to use the Service ceases immediately. Provisions that by their 
            nature should survive termination shall survive, including ownership provisions, warranty 
            disclaimers, and limitations of liability.
          </p>
        </Section>

        {/* Changes to Terms */}
        <Section title="13. Changes to Terms">
          <p>
            We may modify these Terms at any time. We will provide notice of material changes by:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Posting the updated Terms with a new "Last Updated" date</li>
            <li>Sending email notification to registered users</li>
            <li>Displaying a notice on the Service</li>
          </ul>
          <p className="mt-4">
            Your continued use of the Service after changes become effective constitutes acceptance of 
            the revised Terms. If you do not agree to the changes, you must stop using the Service.
          </p>
        </Section>

        {/* Dispute Resolution */}
        <Section title="14. Dispute Resolution and Governing Law">
          <h3 className="text-xl font-semibold mb-3">14.1 Governing Law</h3>
          <p>
            These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of 
            law principles.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">14.2 Dispute Resolution</h3>
          <p>
            For EU customers: You have the right to bring disputes before the courts of your country of 
            residence. Alternatively, disputes may be resolved through arbitration or mediation.
          </p>
          <p className="mt-4">
            For non-EU customers: Any disputes shall be resolved through binding arbitration in accordance 
            with commercial arbitration rules, except that either party may seek injunctive relief in court.
          </p>
        </Section>

        {/* General Provisions */}
        <Section title="15. General Provisions">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">15.1 Entire Agreement</h4>
              <p className="text-sm text-gray-300">
                These Terms, along with the Privacy Policy, constitute the entire agreement between you 
                and Campus Explorer regarding the Service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">15.2 Severability</h4>
              <p className="text-sm text-gray-300">
                If any provision of these Terms is found to be invalid, the remaining provisions remain 
                in full effect.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">15.3 Waiver</h4>
              <p className="text-sm text-gray-300">
                Failure to enforce any provision does not constitute a waiver of that provision.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">15.4 Assignment</h4>
              <p className="text-sm text-gray-300">
                You may not assign these Terms without our consent. We may assign these Terms without 
                restriction.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">15.5 Force Majeure</h4>
              <p className="text-sm text-gray-300">
                We are not liable for delays or failures caused by circumstances beyond our reasonable 
                control.
              </p>
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section title="16. Contact Information">
          <p>
            If you have questions about these Terms, please contact us:
          </p>
          <div className="mt-6 p-6 bg-white/5 rounded-lg space-y-3">
            <div>
              <strong>Email:</strong>{' '}
              <a href="mailto:legal@campusexplorer.com" className="text-[#667eea] hover:underline">
                legal@campusexplorer.com
              </a>
            </div>
            <div>
              <strong>Support:</strong>{' '}
              <a href="mailto:support@campusexplorer.com" className="text-[#667eea] hover:underline">
                support@campusexplorer.com
              </a>
            </div>
          </div>
        </Section>

        {/* Acknowledgment */}
        <div className="mt-16 p-8 bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 rounded-2xl border border-[#667eea]/20">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-[#667eea] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">Acknowledgment</h3>
              <p className="text-gray-300">
                BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, 
                UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, 
                YOU MUST NOT USE THE SERVICE.
              </p>
            </div>
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
const Section = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-2xl md:text-3xl font-bold mb-6">{title}</h2>
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
    <div className={`p-4 rounded-lg border ${styles[type]} ${className} mt-4`}>
      {children}
    </div>
  );
};

export default Terms;
