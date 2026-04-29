import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, []);

  // Go back function
  const goBack = () => {
    navigate(-1); 
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] py-16 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-[var(--color-text-default)] hover:text-[var(--color-primary)] transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-[var(--color-primary)]" />
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-primary)]">
            <span className="text-[var(--color-primary)]">Privacy</span>
            <span className="text-[var(--color-text-strong)]"> Policy</span>
          </h1>
        </div>

        <div className="prose prose-lg max-w-none bg-[var(--color-bg-surface)] p-8 rounded-2xl border-2 border-[var(--color-border-default)]">
          <p className="text-[var(--color-text-default)] mb-6">
            Thank you for taking the time to visit the TrackIntake website. Our policy is straightforward: we gather no personal details about you unless you voluntarily disclose it to us. Private details is never given, shared, sold, or transferred to a third party. This privacy policy explains how we use personal data collected on this website.
          </p>

          <p className="text-[var(--color-text-default)] mb-6">
            Before using the website or providing any personal details, please read our privacy policy. You accept the practices outlined in this privacy policy by using the website. These policies may change and the same will be publicized. The changes will only come in effect to activities and information in the future dates. When you visit the site, we suggest you should read the privacy policy to ensure that you understand how any personal information you supply will be used.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">Third Party Links</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            Links to additional websites can be found on the TrackIntake website. However, once you leave the TrackIntake website, this privacy policy no longer applies to any other websites. These other websites may transmit their own cookies, collect data, or ask for personal information from users.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">Information Collection</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            Personal identifying information, such as names, e-mail addresses, phone numbers, and other information, is captured and saved on the website only when the visitor voluntarily submits it. TrackIntake will use this information to help you with your unique request.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">Use of Cookies</h2>
          <p className="text-[var(--color-text-default)] mb-4">
            Our website employs cookie and tracking technology which are useful for collecting data such type of browser and operating system, as well as tracking the number of visitors to the Website and analyzing how they use it.
          </p>
          <p className="text-[var(--color-text-default)] mb-4">
            A cookie is a file that a website saves on your computer's hard drive in order to keep track of you while you're online on the website.
          </p>
          <p className="text-[var(--color-text-default)] mb-4">
            Cookies on TrackIntake website collect just information about your browser's "session activity," not personal information. We do not provide third parties with cumulative cookie and monitoring data.
          </p>
          <p className="text-[var(--color-text-default)] mb-6">
            You can set your browser to prompt you before accepting a cookie if you are worried about the potential use of information obtained from your computer by cookies. Most web browsers provide options for identifying and rejecting cookies.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">Sharing of Information</h2>
          <p className="text-[var(--color-text-default)] mb-4">
            We may share information with governmental agencies or other businesses that help us prevent or investigate fraud. We may do so if the following conditions are met:
          </p>
          <ul className="list-disc pl-6 mb-4 text-[var(--color-text-default)]">
            <li>Lawfully permitted or required; or</li>
            <li>Attempting to defend against or prevent fraud or unlawful transactions, whether actual or potential</li>
            <li>Investigating a scam that has already occurred. These businesses do not receive the information for marketing purposes.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">Information from your e-mails to us</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            If you send us an email, your return e-mail address will normally be included in the message. We may utilize personal information in response to your request if you offer it in your e-mail because you want us to address concerns relevant to your circumstance. In addition, e-mail is not always secure against interception. Please just send us the information we need to process your request.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">Data Security</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            Your personal data is kept safe and secure. This information is only accessible to approved personnel (employees who have committed to keep it secure and signed a confidentiality agreement).
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">Amendments to this Policy</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            We retain the right to amend this policy at any time. Any modifications to this policy will be announced on this page.
          </p>

          <p className="text-[var(--color-text-muted)] text-sm mt-8 pt-4 border-t border-[var(--color-border-default)]">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;










