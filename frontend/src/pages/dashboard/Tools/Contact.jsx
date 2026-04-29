import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Send,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
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

  // Contact details
  const contactInfo = [
    {
      icon: <User className="w-6 h-6" />,
      label: "Name",
      value: "Yeshwant Maheshram",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: "Phone",
      value: "+91 78986 22813",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      label: "Email",
      value: "it.trackintake@gmail.com",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Address",
      value: "1-Snehalata ganj Indore,Madhya Pradesh",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: "Working Hours",
      value: "Mon - Sat, 10:00 AM - 7:00 PM",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400"
    }
  ]; 

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] py-8 md:py-16 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-[var(--color-text-default)] hover:text-[var(--color-primary)] transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 md:mb-12"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-[var(--font-primary)] mb-4">
          <span className="text-[var(--color-primary)]">Contact</span>
          <span className="text-[var(--color-text-strong)]"> Us</span>
        </h1>
        <p className="text-[var(--color-text-default)] max-w-2xl mx-auto px-4">
          Get in touch with us for any queries or support. We're here to help you!
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[var(--color-bg-surface)] p-4 md:p-6 rounded-2xl border-2 border-[var(--color-border-default)] hover:border-[var(--color-primary)] transition-all duration-300 group"
            >
              <div className={`w-12 h-12 ${info.bgColor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${info.textColor}`}>
                {info.icon}
              </div>
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-1">
                {info.label}
              </h3>
              <p className="text-base md:text-lg font-semibold text-[var(--color-text-strong)] break-words">
                {info.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--color-bg-surface)] p-6 md:p-8 rounded-2xl border-2 border-[var(--color-border-default)]"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-strong)] mb-6">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-default)] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-[var(--color-bg-page)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text-default)]"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-default)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-[var(--color-bg-page)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text-default)]"
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-default)] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                //   defaultValue="+91 78986 22813"
                  className="w-full px-4 py-3 bg-[var(--color-bg-page)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text-default)]"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-default)] mb-2">
                  Your Message
                </label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 bg-[var(--color-bg-page)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-colors text-[var(--color-text-default)] resize-none"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[var(--color-primary)] text-[var(--color-text-on-primary)] py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Send className="w-5 h-5" />
                Send Message
              </motion.button>
            </form>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--color-bg-surface)] p-6 md:p-8 rounded-2xl border-2 border-[var(--color-border-default)]"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-strong)] mb-6">
              Our Location
            </h2>
            
            {/* Indore  */}
            <div className="w-full h-[300px] md:h-[400px] rounded-xl overflow-hidden border-2 border-[var(--color-border-default)] mb-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.21689532266!2d75.816664!3d22.719568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad1b410ddb%3A0x96ec4da356240f4!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title=" Location"
              ></iframe>
            </div>

            {/* Address Card */}
            <div className="bg-[var(--color-bg-page)] p-4 rounded-xl border-2 border-[var(--color-border-default)]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[var(--color-text-strong)] mb-1">
                    Indore Office
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Indore, Madhya Pradesh India,
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    We typically respond within 24 hours on business days.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Business Hours Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 md:mt-8 bg-[var(--color-bg-surface)] p-4 md:p-6 rounded-2xl border-2 border-[var(--color-border-default)]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text-strong)]">
                  Business Hours
                </h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Monday - Saturday: 10:00 AM - 7:00 PM
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] bg-[var(--color-bg-page)] px-4 py-2 rounded-lg">
              Sunday: Closed
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;














































































