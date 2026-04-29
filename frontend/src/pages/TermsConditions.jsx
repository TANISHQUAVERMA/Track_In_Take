import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsConditions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, []);

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
          <FileText className="w-8 h-8 text-[var(--color-primary)]" />
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-primary)]">
            <span className="text-[var(--color-primary)]">Terms &</span>
            <span className="text-[var(--color-text-strong)]"> Conditions</span>
          </h1>
        </div>

        <div className="prose prose-lg max-w-none bg-[var(--color-bg-surface)] p-8 rounded-2xl border-2 border-[var(--color-border-default)]">
          <p className="text-[var(--color-text-default)] mb-4 font-semibold">
            TERMS & CONDITIONS – TRACKINTAKE
          </p>
          
          <p className="text-[var(--color-text-default)] mb-6">
            Participation in TrackIntake services is voluntary and constitutes informed consent.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">1. Nature of Services</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            TrackIntake provides personalised nutrition and wellness support. While guidance is evidence-based, specific health or medical outcomes cannot be guaranteed. You acknowledge that individual results may vary and agree to participate at your own discretion.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">2. Responsibility & Safety</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            You are responsible for sharing accurate health information and for following guidance appropriately. TrackIntake is not liable for outcomes arising from undisclosed conditions, allergies, non-adherence, or individual physiological responses.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">3. Payments & Pricing</h2>
          <ul className="list-disc pl-6 mb-6 text-[var(--color-text-default)]">
            <li>All plans must be paid in full at the time of purchase.</li>
            <li>Fees are non-transferable and non-refundable, except as stated in Clause 8.</li>
            <li>Pricing may be revised from time to time. Any changes will not affect plans already paid for, unless legally required.</li>
            <li>International clients will be billed as per the applicable USD rate card.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">4. Conduct & Communication</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            Clients are expected to interact respectfully. Any inappropriate conduct may result in suspension or termination of services without refund. TrackIntake may review communications for service quality and compliance.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">5. Consultations & Follow-ups</h2>
          <ul className="list-disc pl-6 mb-6 text-[var(--color-text-default)]">
            <li>Consultations are scheduled based on availability.</li>
            <li>Follow-ups are conducted by Co-Dieticians, with Senior / Chief / HOD reviews every two weeks.</li>
            <li>Missed sessions due to client unavailability are not rescheduled.</li>
            <li>If a session is missed due to TrackIntake, suitable adjustments or extensions may be provided.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">6. Service Availability</h2>
          <ul className="list-disc pl-6 mb-6 text-[var(--color-text-default)]">
            <li>Operating hours: Monday–Saturday, 10am–7pm IST (excluding holidays).</li>
            <li>International appointments are pre-planned within reasonable time flexibility.</li>
            <li>Temporary interruptions or staff unavailability may occur; alternate support may be arranged where feasible.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">7. Plan Hold / Freeze</h2>
          <p className="text-[var(--color-text-default)] mb-4">
            Plans may be paused for genuine, documented reasons, subject to approval.
          </p>
          <p className="text-[var(--color-text-default)] mb-2 font-medium">Maximum hold duration:</p>
          <ul className="list-disc pl-6 mb-4 text-[var(--color-text-default)]">
            <li>1 month: 1 week</li>
            <li>3 months: 2 weeks</li>
            <li>6 months: 3 weeks</li>
            <li>12 months: 5 weeks</li>
          </ul>
          <p className="text-[var(--color-text-default)] mb-6">
            Plans resume automatically after the approved hold period.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">8. Plan Duration & Usage</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            Plans are time-bound. Unused consultations expire at the end of the plan period and cannot be carried forward, credited, or extended unless a hold is approved. Prolonged non-engagement may lead to closure of the plan.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">9. Refund Policy</h2>
          <p className="text-[var(--color-text-default)] mb-4">
            Refunds are considered only if:
          </p>
          <ul className="list-disc pl-6 mb-4 text-[var(--color-text-default)]">
            <li>Requested within 7 days (1-month plans) or 14 days (multi-month plans)</li>
            <li>No services have been utilised</li>
            <li>A 15% administrative deduction applies</li>
          </ul>
          <p className="text-[var(--color-text-default)] mb-6">
            Refunds due to verified medical emergencies may be considered within 30 days. Approved refunds are processed within 10–15 working days.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">10. Termination</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            TrackIntake reserves the right to discontinue services in case of policy breaches or misconduct. Client-initiated discontinuation does not qualify for refunds unless covered under Clause 9.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">11. Intellectual Property</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            All content, plans, and materials remain the intellectual property of TrackIntake and are for personal use only. Unauthorised sharing or reproduction is prohibited.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">12. Limitation of Liability</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            Services are provided on an "as-is" basis. TrackIntake is not liable for indirect or consequential losses. Any liability, if established, shall not exceed the fees paid.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">13. Amendments</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            Terms may be updated from time to time. Continued use of services indicates acceptance of the revised terms.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">14. Governing Law</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of Bangalore courts, or arbitration as mutually agreed.
          </p>

          <p className="text-[var(--color-text-muted)] text-sm mt-8 pt-4 border-t border-[var(--color-border-default)]">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsConditions;





