import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RefundPolicy = () => {
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
          <RefreshCw className="w-8 h-8 text-[var(--color-primary)]" />
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-primary)]">
            <span className="text-[var(--color-primary)]">Refund & Return</span>
            <span className="text-[var(--color-text-strong)]"> Policy</span>
          </h1>
        </div>

        <div className="prose prose-lg max-w-none bg-[var(--color-bg-surface)] p-8 rounded-2xl border-2 border-[var(--color-border-default)]">
          <p className="text-[var(--color-text-default)] mb-6">
            We try diligently to give our clients the greatest nutrition advice as well as products. Before making a purchase, please carefully read our no refund and return policy.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">1. Products</h2>
          <p className="text-[var(--color-text-default)] mb-4">
            1.1 All purchases of goods are considered final. With the exception of the following situations, we do not give refunds, returns, or exchanges.
          </p>
          <ul className="list-disc pl-6 mb-4 text-[var(--color-text-default)]">
            <li>Products that were received faulty or damaged.</li>
            <li>Products that differ drastically from the website's description have been delivered.</li>
          </ul>
          <p className="text-[var(--color-text-default)] mb-6">
            1.2. You must tell us within 48 hours of receiving the goods if it is damaged or faulty in order to be eligible for a return or refund.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">2. Shipping</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            After receiving the order, we typically send the item within 24 to 48 hours of business hours. Although delivery timeframes vary depending on your location, on average it takes 7 to 10 working days to get the items delivered at your door. However, during natural disasters, celebrations, or unanticipated events that might complicate logistical preparation, delivery may vary.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">3. Nutrition Counseling Services</h2>
          <p className="text-[var(--color-text-default)] mb-4">
            3.1. All payments made for nutrition counseling services are final and non-refundable.
          </p>
          <p className="text-[var(--color-text-default)] mb-6">
            3.2. In the event that you are unhappy with our counseling services, we invite you to contact our customer care staff so they can help you with any problems or concerns.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">4. Exceptions</h2>
          <p className="text-[var(--color-text-default)] mb-4">
            4.1. TrackIntake management shall have the final authority in determining whether a refund, return, or exception is applicable in special circumstances
          </p>
          <p className="text-[var(--color-text-default)] mb-6">
            4.2. Refunds, if any, will be handled using the original payment method within a fair amount of time.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">5. Return/Refund Procedure</h2>
          <p className="text-[var(--color-text-default)] mb-4">
            5.1. To begin a return for damaged or faulty goods, please get in touch with our customer care staff within the allotted time limit.
          </p>
          <p className="text-[var(--color-text-default)] mb-4">
            5.2. You can be asked to show photographic proof or other forms of paperwork to back up your claim.
          </p>
          <p className="text-[var(--color-text-default)] mb-6">
            5.3. "For international payments, we will take 7-10 working days to refund for any issue."
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">6. Shipping Cost</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            6.1. Customers are liable for the expenses of returning items, unless there is an error on our end that necessitates the return.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">7. Amendments to this Policy</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            This policy on returns and no-refunds is subject to change at any period, and we retain the right to do so. After the revised policy is posted on our website, any modifications become effective immediately.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">8. Terms Agreement</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            By using our website to make a purchase, you confirm that you have read and comprehended our return and no-refund policy.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--color-text-strong)] mt-8 mb-4">9. Contact Us</h2>
          <p className="text-[var(--color-text-default)] mb-6">
            Please get in touch with our customer support staff if you have any queries or complaints regarding our no refund and return policy.
          </p>

          <p className="text-[var(--color-text-muted)] text-sm mt-8 pt-4 border-t border-[var(--color-border-default)]">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RefundPolicy;












