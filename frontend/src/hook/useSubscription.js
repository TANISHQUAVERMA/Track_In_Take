// ✅ Samruddhi ✨ Hook for fetching subscription + calculating remaining days

import { useEffect, useState } from "react";
import { getMySubscription } from "../api/subscriptionService";

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState(0); // ✅ Samruddhi ✨ added

  // ✅ Samruddhi ✨ Safe calculation (no timezone issues)
  const calculateRemainingDays = (endDate) => {
    if (!endDate) return 0;

    // 🔥 Manual parsing to avoid timezone bugs
    const [year, month, day] = endDate.split("-").map(Number);

    const end = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getMySubscription(token)
      .then((data) => {
        setSubscription(data);

        // ✅ Samruddhi ✨ using expires_at from backend
        if (data?.expires_at) {
          const days = calculateRemainingDays(data.expires_at);
          setRemainingDays(days);
        } else {
          setRemainingDays(0);
        }
      })
      .catch(() => {
        setSubscription(null);
        setRemainingDays(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ✅ Samruddhi ✨ return everything needed
  return { subscription, loading, remainingDays };
}
