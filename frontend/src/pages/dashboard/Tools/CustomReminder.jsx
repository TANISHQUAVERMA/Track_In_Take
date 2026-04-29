// src/pages/dashboard/tools/CustomReminder.jsx

import React, { useState, useEffect } from 'react';
import { Plus, X, Bell, Clock, ClipboardCheck, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reminderCreate, getAllReminder, deleteReminder } from '../../../api/CustomReminderApi';
import useWebSockets from '../../../api/useWebSockets';
import { toast } from "react-toastify";

// --- Themed Helper Components ---
const SkeletonCard = () => (
  <div className="flex items-center space-x-4 p-4 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl animate-pulse">
    <div className="w-10 h-10 bg-[var(--color-bg-interactive-subtle)] rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-[var(--color-bg-interactive-subtle)] rounded w-3/4"></div>
      <div className="h-3 bg-[var(--color-bg-interactive-subtle)] rounded w-1/2"></div>
    </div>
  </div>
);

const EmptyState = ({ onAddClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center p-8 border-2 border-dashed border-[var(--color-border-default)] rounded-2xl flex flex-col items-center bg-[var(--color-bg-surface)]"
  >
    <ClipboardCheck className="w-16 h-16 text-[var(--color-text-muted)] mb-4" strokeWidth={1} />
    <h3 className="text-xl font-[var(--font-primary)] font-semibold text-[var(--color-text-strong)] mb-2">No Reminders Yet</h3>
    <p className="text-[var(--color-text-default)] mb-6">Ready to get organized? Add your first reminder.</p>
    <button
      onClick={onAddClick}
      className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
    >
      <Plus size={20} />
      Create a Reminder
    </button>
  </motion.div>
);

const ReminderCard = ({ reminder, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    className="group flex items-center p-4 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-2xl hover:border-[var(--color-primary)] hover:shadow-xl transition-all duration-300 shadow-lg"
  >
    <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-primary-bg-subtle)] rounded-full flex items-center justify-center mr-4 transition-transform duration-300 group-hover:scale-110">
      <Bell className="text-[var(--color-primary)]" />
    </div>
    <div className="flex-grow">
      <h3 className="font-bold text-lg text-[var(--color-text-strong)]">{reminder.title}</h3>
      <div className="flex items-center text-sm text-[var(--color-text-default)] mt-1 space-x-4">
        <span className="flex items-center gap-1.5"><Clock size={14} /> {reminder.reminder_time}</span>
        <span className="capitalize">{reminder.frequency}</span>
      </div>
      {reminder.description && (
        <p className="text-xs text-[var(--color-text-muted)] mt-2">{reminder.description}</p>
      )}
    </div>
    <motion.button
      whileHover={{ scale: 1.2, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onDelete(reminder.id)}
      className="ml-4 p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg-subtle)] transition-colors"
    >
      <X size={20} />
    </motion.button>
  </motion.div>
);

const CustomReminder = () => {
  const [reminders, setReminders] = useState([]); // State to store the list of reminders
  const [showForm, setShowForm] = useState(false); // State to determine if the form should be shown
  const [loading, setLoading] = useState(true); // State to determine if the data is being loaded
  const [saving, setSaving] = useState(false); // State to determine if the data is being saved
  const [formData, setFormData] = useState({ title: '', time: '', frequency: 'Daily', message: '' }); // State to store the form data

  useWebSockets({
    onReminder: (newReminderData) => {
      // Create a new reminder object that matches the structure of your existing reminders
      const formattedReminder = {
        id: newReminderData.id || Date.now(), // Use a fallback ID if not provided
        title: newReminderData.title || "New Reminder",
        description: newReminderData.description || "",
        reminder_time: newReminderData.reminder_time || "Now",
        frequency: newReminderData.frequency || "Once",
      };

      // Add the new reminder to the top of the list
      setReminders(prev => [formattedReminder, ...prev]);
    }
  });

  const fetchReminders = async () => {
    setLoading(true); // Set loading state to true
    try {
      const data = await getAllReminder(); // Fetch the list of reminders from the API
      setReminders(Array.isArray(data.results) ? data.results : []); // Set the list of reminders
    } catch (error) {
      if (error.response?.status === 403) {
      // 🔒 SUBSCRIPTION BLOCK
      toast.error("Upgrade your plan to use reminders 🔒");
      setReminders([]);
      return;
    }

      console.error("Error fetching reminders:", error);
      setReminders([]); // Set the list of reminders to an empty array if an error occurs
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  useEffect(() => { fetchReminders(); }, []); // Fetch the list of reminders when the component mounts

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value })); // Handle input changes in the form

  const handleSaveReminder = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!formData.title || !formData.time) return; // If the title or time fields are empty, return
    if (formData.title.length > 151) { alert("Reminder title should not exceed 150 characters."); return; } // If the title is too long, alert the user
    setSaving(true); // Set saving state to true
    try {
      await reminderCreate({ title: formData.title, description: formData.message, reminder_time: formData.time, frequency: formData.frequency.toLowerCase() }); // Create a new reminder in the API
      await fetchReminders(); // Fetch the list of reminders again
      setShowForm(false); // Hide the form
      setFormData({ title: '', time: '', frequency: 'Daily', message: '' }); // Reset the form data
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Upgrade your plan to add reminders 🔒");
        return;
      }
      console.error("Error saving reminder:", error);
    } finally { setSaving(false); } // Set saving state to false
  };

  const handleDeleteReminder = async (id) => {
    try {
      await deleteReminder(id); // Delete a reminder from the API
      setReminders(prev => prev.filter(r => r.id !== id)); // Filter out the deleted reminder from the list
    } catch (error) { 
      if (error.response?.status === 403) {
        toast.error("Upgrade your plan to manage reminders 🔒");
        return;
      }
      console.error("Failed to delete reminder:", error); }
  };

  const formVariants = {
    hidden: { opacity: 0, y: -50, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto', transition: { type: 'spring', duration: 0.8, bounce: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] text-[var(--color-text-default)] font-[var(--font-secondary)] p-4 sm:p-6 lg:p-10">
      <main className="max-w-4xl mx-auto">
        <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-3">
            Your Reminders
          </h1>
          <p className="text-lg text-[var(--color-text-default)]">Stay present, stay organized.</p>
        </motion.header>
        
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-3xl p-8 mb-12 shadow-2xl overflow-hidden"
            >
              <h2 className="text-3xl font-[var(--font-primary)] font-bold text-[var(--color-text-strong)] mb-6">Create New Reminder</h2>
              <form onSubmit={handleSaveReminder} className="space-y-6">
                <div className="relative">
                  <input
                    type="text" id="title" required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="peer w-full px-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition placeholder-transparent text-[var(--color-text-default)]"
                    placeholder="e.g., Afternoon stretch break"
                  />
                   <label htmlFor="title" className="absolute left-4 -top-3 text-[var(--color-text-muted)] text-sm transition-all bg-[var(--color-bg-surface)] px-1 peer-placeholder-shown:text-base peer-placeholder-shown:text-[var(--color-text-muted)] peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-[var(--color-primary)] peer-focus:text-sm peer-focus:bg-[var(--color-bg-surface)] pointer-events-none">Title</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="time" value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)} required className="w-full px-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition text-[var(--color-text-default)]" />
                    <select value={formData.frequency} onChange={(e) => handleInputChange('frequency', e.target.value)} className="w-full px-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition text-[var(--color-text-default)]">
                        <option>Daily</option> <option>Weekly</option> <option>Custom</option>
                    </select>
                </div>
                 <textarea value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Add an optional message..." rows={3} className="w-full px-4 py-3 bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] rounded-xl focus:border-[var(--color-primary)] focus:outline-none transition placeholder:text-[var(--color-text-muted)] text-[var(--color-text-default)]" />
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] py-3 rounded-xl font-semibold shadow-lg transition transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:scale-100 disabled:shadow-md">
                    {saving ? <Loader size={20} className="animate-spin" /> : 'Save Reminder'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 bg-[var(--color-bg-interactive-subtle)] hover:opacity-80 border-2 border-[var(--color-border-default)] text-[var(--color-text-default)] rounded-xl font-semibold transition active:scale-95">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
            {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) // Display skeleton cards while loading
            ) : reminders.length === 0 && !showForm ? (
                <EmptyState onAddClick={() => setShowForm(true)} /> // Display an empty state if no reminders exist and the form is not shown
            ) : (
                <AnimatePresence>
                    {reminders.map((reminder) => (
                        <ReminderCard key={reminder.id} reminder={reminder} onDelete={handleDeleteReminder} /> // Display each reminder card
                    ))}
                </AnimatePresence>
            )}
        </div>
        
        {!showForm && reminders.length > 0 && (
             <div className="mt-12 text-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(true)} // Show the form when the button is clicked
                    className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                >
                    <Plus size={20} />
                    Add Another Reminder
                </motion.button>
             </div>
        )}
      </main>
    </div>
  );
};

export default CustomReminder;