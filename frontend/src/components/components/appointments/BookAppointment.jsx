import React, { useEffect, useState } from "react";
import { getAvailableSlots, bookAppointment, getMyInHouseNutritionist, getExpertNutritionists } from "../../../api/appointmentApi";
import SlotPicker from "./SlotPicker";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, ChevronRight, CalendarDays, Video, Users, Building2, Heart, X } from "lucide-react";
import { payConsultationFee, verifyPayment } from "../../../api/subscriptionService";
import { toast } from "react-toastify";
// Import advertisement image
import bpMonitorAd from "../../../assets/download.jpg";

const BookAppointment = ({ onBooked }) => {
  const { user } = useAuth();

  const [appointmentCategory, setAppointmentCategory] = useState("IN_HOUSE");
  const [appointmentType, setAppointmentType] = useState("IN_PERSON");

  const [experts, setExperts] = useState([]);
  const [expertId, setExpertId] = useState("");

  const [nutritionistId, setNutritionistId] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showAd, setShowAd] = useState(true);
  const [showConsultPayment, setShowConsultPayment] = useState(false);
  const [consultType, setConsultType] = useState(null);
  const [pendingSlotId, setPendingSlotId] = useState(null);
  // -------------------------------
  // IN-HOUSE: fetch assigned nutritionist
  // -------------------------------
  useEffect(() => {
    if (!user) return;

    if (appointmentCategory === "IN_HOUSE") {
      setExperts([]);
      setExpertId("");
      setSlots([]);
      setNutritionistId(null);

      getMyInHouseNutritionist()
        .then((res) => {
          setNutritionistId(res.data.nutritionist_id);
        })
        .catch(() => {
          setNutritionistId(null);
        });
    }
  }, [appointmentCategory, user]);

  // -------------------------------
  // EXPERT: fetch expert list
  // -------------------------------
  useEffect(() => {
    if (appointmentCategory === "EXPERT") {
      setNutritionistId(null);
      setExpertId("");
      setSlots([]);

      getExpertNutritionists()
        .then((res) => {
          setExperts(res.data);
        })
        .catch(() => {
          setExperts([]);
        });
    }
  }, [appointmentCategory]);

  // -------------------------------
  // Fetch slots
  // -------------------------------
  const fetchSlots = async () => {
    if (!nutritionistId || !date) return;

    try {
      const res = await getAvailableSlots(nutritionistId, date);
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];

      setSlots(data);
    } catch {
      setSlots([]);
    }
  };

  // -------------------------------
  // Book appointment
  // -------------------------------
  const handleBook = async (slotId) => {
    try {
      setLoading(true);
      setPendingSlotId(slotId); // ✅ retry ke liye save karo

      await bookAppointment({
        slot_id: slotId,
        appointment_category: appointmentCategory,
        appointment_type: appointmentType,
        expert_id: appointmentCategory === "EXPERT" ? expertId : null,
      });

      toast.success("Appointment booked successfully!");
      await fetchSlots();
      onBooked?.();

    } catch (error) {
      const errData = error.response?.data;

      // ✅ Consultation khatam — payment popup dikhao
      if (errData?.consultation_required) {
        setConsultType(errData.consult_type);
        setShowConsultPayment(true);
      } else {
        toast.error(
          errData?.message || errData?.detail || "Booking failed. Try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleConsultPayment = async () => {
  try {
    const orderData = await payConsultationFee(consultType);

    const rzp = new window.Razorpay({
      key: orderData.key,
      amount: orderData.amount,
      order_id: orderData.order_id,
      name: "TrackIntake",
      description: "Consultation Fee",
      handler: async (response) => {
        try {
          await verifyPayment(response);

          // ✅ Payment ke baad dobara booking karo
          await bookAppointment({
            slot_id: pendingSlotId,
            appointment_category: appointmentCategory,
            appointment_type: appointmentType,
            expert_id: appointmentCategory === "EXPERT" ? expertId : null,
          });

          toast.success("Appointment booked successfully!");
          setShowConsultPayment(false);
          await fetchSlots();
          onBooked?.();
        } catch (err) {
          toast.error("Payment done but booking failed. Contact support.");
        }
      },
      theme: { color: "#ff7a18" }
    });
    rzp.open();

  } catch (err) {
    toast.error("Payment failed. Try again.");
  }
};

  // ===============================
  // Ad Component - Simple with content only
  // ===============================
  const AdvertisementCard = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative rounded-2xl overflow-hidden shadow-xl sticky top-24 bg-white"
    >
      {/* Close button for mobile */}
      <button 
        onClick={() => setShowAd(false)}
        className="lg:hidden absolute top-3 right-3 z-10 p-1.5 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors"
      >
        <X size={16} />
      </button>

      {/* Image - exactly as is */}
      <img 
        src={bpMonitorAd} 
        alt="BP Monitor" 
        className="w-full h-auto"
      />

      {/* Content - only text below image */}
      <div className="p-4">
        {/* Badge */}
        <div className="flex items-center gap-1 mb-2">
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase">Sponsored</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          Smart BP Monitor
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-400 line-through text-sm">₹3,999</span>
          <span className="text-xl font-bold text-gray-900">₹2,799</span>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">30% OFF</span>
        </div>

        {/* Features */}
        <div className="flex gap-2 mb-3">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">±2 mmHg Accuracy</span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Bluetooth</span>
        </div>

        {/* Shop Now Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[var(--color-primary)]  text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2"
          onClick={() => window.open("https://example.com/bp-monitor", "_blank")}
        >
          <span>Shop Now</span>
          <ChevronRight size={18} />
        </motion.button>

        {/* Free shipping */}
        <p className="text-xs text-gray-400 text-center mt-2">
          Free shipping • 1 year warranty
        </p>
      </div>
    </motion.div>
  );

  // ===============================
  // Main UI with Side-by-Side Layout
  // ===============================
  return (
    <div className="w-full max-w-7xl mx-auto">
        {/* ✅ Consultation Payment Popup */}
        {showConsultPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl mx-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Consultations Fee
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                To continue, please pay the consultation fee and complete your appointment booking.
              </p>
              <button
                onClick={handleConsultPayment}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
              >
                Pay & Book
              </button>
              <button
                onClick={() => setShowConsultPayment(false)}
                className="w-full mt-2 text-gray-400 text-sm py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      {/* Mobile View - Stacked Layout */}
      <div className="block lg:hidden">
        {showAd && (
          <div className="mb-6">
            <AdvertisementCard />
          </div>
        )}
        
        <BookingForm 
          {...{
            appointmentCategory,
            setAppointmentCategory,
            appointmentType,
            setAppointmentType,
            experts,
            expertId,
            setExpertId,
            date,
            setDate,
            nutritionistId,
            fetchSlots,
            slots,
            handleBook,
            loading,
            setNutritionistId,
            setSlots
          }}
        />
      </div>

      {/* Desktop View - Side by Side */}
      <div className="hidden lg:block">
        <div className="flex gap-6">
          {/* Left Column - Booking Form */}
          <div className="w-[70%]">
            <BookingForm 
              {...{
                appointmentCategory,
                setAppointmentCategory,
                appointmentType,
                setAppointmentType,
                experts,
                expertId,
                setExpertId,
                date,
                setDate,
                nutritionistId,
                fetchSlots,
                slots,
                handleBook,
                loading,
                setNutritionistId,
                setSlots
              }}
            />
          </div>

          {/* Right Column - Advertisement */}
          <div className="w-[30%]">
            <div className="sticky top-24">
              <AdvertisementCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===============================
// Booking Form Component
// ===============================
const BookingForm = ({
  appointmentCategory,
  setAppointmentCategory,
  appointmentType,
  setAppointmentType,
  experts,
  expertId,
  setExpertId,
  date,
  setDate,
  nutritionistId,
  fetchSlots,
  slots,
  handleBook,
  loading,
  setNutritionistId,
  setSlots
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[var(--color-bg-surface)] rounded-2xl border-2 border-[var(--color-border-default)] p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[var(--color-primary-bg-subtle)] rounded-xl">
          <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-strong)]">Book Appointment</h2>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">Schedule your consultation</p>
        </div>
      </div>

      {/* Appointment Category Tabs */}
      <div className="flex gap-2 mb-6 bg-[var(--color-bg-surface-alt)] p-1 rounded-xl">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAppointmentCategory("IN_HOUSE")}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
            appointmentCategory === "IN_HOUSE" 
              ? "bg-[var(--color-primary)] text-white shadow-md" 
              : "text-[var(--color-text-default)] hover:bg-[var(--color-bg-surface)]"
          }`}
        >
          <Building2 size={16} />
          <span>In-House</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAppointmentCategory("EXPERT")}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
            appointmentCategory === "EXPERT" 
              ? "bg-[var(--color-primary)] text-white shadow-md" 
              : "text-[var(--color-text-default)] hover:bg-[var(--color-bg-surface)]"
          }`}
        >
          <Users size={16} />
          <span>Expert</span>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={appointmentCategory}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Expert Dropdown */}
          {appointmentCategory === "EXPERT" && (
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-strong)]">
                Select Expert
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                <select
                  value={expertId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setExpertId(id);
                    setNutritionistId(id);
                    setSlots([]);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[var(--color-bg-surface-alt)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-all duration-300 text-sm sm:text-base text-[var(--color-text-strong)] appearance-none cursor-pointer"
                >
                  <option value="">Choose expert</option>
                  {experts.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-strong)]">
              Select Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              {/* ✅ Samruddhi ✨ disable past dates */}
              <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]} // 🔥 important
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[var(--color-bg-surface-alt)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition-all duration-300 text-sm sm:text-base text-[var(--color-text-strong)]"
              />
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-[var(--color-text-strong)]">
              Appointment Type
            </label>
            <div className="flex gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAppointmentType("IN_PERSON")}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm transition-all duration-300 ${
                  appointmentType === "IN_PERSON"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)]"
                    : "border-[var(--color-border-default)] text-[var(--color-text-default)] hover:border-[var(--color-primary)]"
                }`}
              >
                <Building2 size={16} />
                <span>In Person</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAppointmentType("VIRTUAL")}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 text-xs sm:text-sm transition-all duration-300 ${
                  appointmentType === "VIRTUAL"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-bg-subtle)] text-[var(--color-primary)]"
                    : "border-[var(--color-border-default)] text-[var(--color-text-default)] hover:border-[var(--color-primary)]"
                }`}
              >
                <Video size={16} />
                <span>Virtual</span>
              </motion.button>
            </div>
          </div>

          {/* Check Availability Button */}
          <motion.button
            onClick={fetchSlots}
            disabled={!date || !nutritionistId}
            className="w-full bg-[var(--color-primary)] text-white px-4 sm:px-6 py-3 sm:py-3 rounded-xl text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 hover:brightness-110"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <Clock size={18} />
            <span>Check Availability</span>
            <ChevronRight size={18} className="ml-auto hidden sm:block" />
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Slots Section */}
      <div className="mt-6 pt-6 border-t-2 border-[var(--color-border-default)]">
        <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-strong)] mb-4 flex items-center gap-2">
          <Clock className="text-[var(--color-primary)]" size={18} />
          Available Slots
        </h3>
        <SlotPicker
          slots={slots}
          onBook={handleBook}
          loading={loading}
        />
      </div>
    </motion.div>
  );
};

export default BookAppointment;










