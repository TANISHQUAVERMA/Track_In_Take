// src/hooks/useWaterTracker.js

import { useState, useEffect, useCallback } from 'react';
import { getWater, postWater } from '../../../api/WaterTracker';
import { toast } from 'react-hot-toast';
import { GlassWater, AlertTriangle } from 'lucide-react';
import React from 'react';
import { pushWaterNotification } from '../NotificationDropdown';

/**
 * Gets the user's local date as a 'YYYY-MM-DD' string, guaranteed to be correct for any timezone.
 * @param {Date} date The local date object to format.
 * @returns {string} The formatted date string (e.g., "2024-07-19").
 */
const getLocalDateString = (date) => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const useWaterTracker = () => {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  
  // UPDATED: State now stores total milliliters for each date, not glasses.
  const [waterIntake, setWaterIntake] = useState({});
  // UPDATED: The primary value we work with is the total intake in ml.
  const totalIntakeMl = waterIntake[selectedDate] || 0;

  // This effect correctly updates the date at midnight. It remains unchanged.
  useEffect(() => {
    const updateDateAtMidnight = () => {
      const currentDateString = getLocalDateString(new Date());
      setSelectedDate(currentDateString);
    };

    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(updateDateAtMidnight, msUntilMidnight + 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  // UPDATED: The fetch function now calculates and stores the total ml directly.
  const fetchWaterIntake = useCallback(async (date) => {
    try {
      const response = await getWater(date);
      const results = Array.isArray(response.results) ? response.results : [];
      // Calculate the total ml from all entries for the day.
      const totalMl = results.reduce((sum, entry) => sum + (entry.amount_ml || 0), 0);
      
      // Store the calculated total ml in the state.
      setWaterIntake((prev) => ({ ...prev, [date]: totalMl }));
    } catch (err) {
      console.error("❌ Failed to fetch water data for date:", date, err);
      setWaterIntake((prev) => ({ ...prev, [date]: 0 }));
    }
  }, []);

  // UPDATED: Replaced `addGlass` with `logWater` which accepts a variable `amount`.
  const logWater = async (amount) => {
    if (!amount || amount <= 0) {
      toast.error("Invalid amount provided.");
      return false;
    }

    try {
      // The API call now uses the dynamic `amount`.
      const response = await postWater({ amount_ml: amount, date: selectedDate });
      
      // Re-fetch the total for the day to ensure UI is in sync with the backend.
      await fetchWaterIntake(selectedDate);

      toast.success(`${amount}ml of water logged!`, {
        icon: <GlassWater size={20} className="text-[var(--color-primary)]" />,
        style: {
          borderRadius: '12px',
          background: 'var(--color-bg-surface)',
          color: 'var(--color-text-strong)',
          border: '2px solid var(--color-border-default)',
        },
      });

      if (response.notifications && response.notifications.length > 0) {
        response.notifications.forEach((note) => {
          pushWaterNotification(note);
          toast.custom((t) => (
            <div className="bg-white px-4 py-2 rounded shadow-md text-sm border border-green-400 text-green-700">
              💧 {note}
            </div>
          ));
        });
      }

      return true;
    } catch (error) {
      console.error("❌ Error logging water:", error);
      toast.error("Could not log water. Please try again.", {
        icon: <AlertTriangle size={20} className="text-[var(--color-danger-text)]" />,
      });
      return false;
    }
  };
  
  // UPDATED: Renamed for clarity.
  const resetWater = () => {
    setWaterIntake((prev) => ({ ...prev, [selectedDate]: 0 }));
    toast.error("Water for this day has been reset locally.");
  };

  useEffect(() => {
    // UPDATED: Calls the renamed fetch function.
    fetchWaterIntake(selectedDate);
  }, [selectedDate, fetchWaterIntake]);

  // UPDATED: The hook now exports values that the new WaterTracker component expects.
  return {
    selectedDate,
    setSelectedDate,
    totalIntakeMl, // Export total ml instead of glasses
    logWater,      // Export the new flexible log function
    resetWater,    // Export the renamed reset function
    waterIntake,   // Export the full log object for potential other uses
  };
};

export default useWaterTracker;