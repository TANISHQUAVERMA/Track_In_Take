import React, { useState, useEffect, useRef ,useCallback} from "react";
import { Bell, CheckCircle, MessageCircle, Droplet, XCircle, AlertCircle } from "lucide-react";
import useWebSockets from "../../api/useWebSockets";// Corrected path
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Corrected path
import { getMessages } from "../../api/nutritionistApi";

export let clearMessageNotifications = () => {};
export let pushWaterNotification = () => {};
export let pushMealNotifications = () => {};

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const processedNotificationIds = useRef(new Set());

  useClickOutside(dropdownRef, () => setIsOpen(false));

   useEffect(() => {
    const fetchInitialMessages = async () => {
      if (!user) return;
      try {
        const response = await getMessages();
        const messages = response.data.results || [];
        const newNotifications = [];
        messages.forEach(msg => {
          if (msg.sender_id !== user.id && !msg.is_read) {
            if (!processedNotificationIds.current.has(msg.id)) {
              newNotifications.push({ ...msg, type: "message", read: false });
              processedNotificationIds.current.add(msg.id);
            }
          }
        });
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev]);
          setHasNew(true);
        }
      } catch (error) {
        console.error("Failed to fetch initial messages:", error);
      }
    };
    fetchInitialMessages();
  }, [user]);

  useEffect(() => {
    const addNotification = (newNotification) => {
      if (!processedNotificationIds.current.has(newNotification.id)) {
        setNotifications((prev) => [{ ...newNotification, read: false }, ...prev]);
        setHasNew(true);
        processedNotificationIds.current.add(newNotification.id);
      }
    };
    
    clearMessageNotifications = () => {
      setNotifications(prev => {
        const remainingNotifications = prev.filter(n => n.type !== 'message');
        const stillHasNewUnread = remainingNotifications.some(n => !n.read);
        setHasNew(stillHasNewUnread);
        return remainingNotifications;
      });
    };

    pushWaterNotification = (text) => {
      addNotification({ id: Date.now(), type: "water", text });
    };

    pushMealNotifications = (mealNotifications) => {
      if (!Array.isArray(mealNotifications) || mealNotifications.length === 0) return;
      const formatted = mealNotifications.map((messageString, index) => ({ id: Date.now() + index, type: "meal_alert", text: messageString }));
      formatted.forEach(addNotification);
    };

    return () => {
      clearMessageNotifications = () => {};
      pushWaterNotification = () => {};
      pushMealNotifications = () => {};
    };
  }, []);

   const onMessage = useCallback((data) => {
    if (!user) return;
    if (data.sender_id !== user.id) {
        const newNotification = { id: data.id || Date.now(), type: "message", text: data.text || "New message!", read: false, ...data };
        if (!processedNotificationIds.current.has(newNotification.id)) {
            setNotifications((prev) => [newNotification, ...prev]);
            setHasNew(true);
            processedNotificationIds.current.add(newNotification.id);
        }
    }
  }, [user]);

  const onReminder = useCallback((data) => {
    const newNotification = { id: data.id || Date.now(), type: "reminder", text: data.title || "New reminder!", ...data };
    if (!processedNotificationIds.current.has(newNotification.id)) {
      setNotifications((prev) => [{ ...newNotification, read: false }, ...prev]);
      setHasNew(true);
      processedNotificationIds.current.add(newNotification.id);
    }
  }, []);

  useWebSockets({ onMessage, onReminder });
  
  const toggleDropdown = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen) {
      setHasNew(false);
      setNotifications(prev => prev.map(n => (n.type === 'water' || n.type === 'meal_alert') ? { ...n, read: true } : n));
    }
  };
  
  const handleClearAll = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };
  
  const handleActionableClick = (note) => {
    setNotifications(prev => prev.filter(n => n.id !== note.id));
    setIsOpen(false);
    if (note.type === 'message') {
      navigate('/dashboard/messages');
    } else if (note.type === 'reminder') {
      navigate('/dashboard/tools/custom-reminder'); 
    }
  };

  const getIcon = (type) => { switch (type) { case "reminder": return <CheckCircle className="h-5 w-5 text-[var(--color-success-text)]" />; case "message": return <MessageCircle className="h-5 w-5 text-[var(--color-primary)]" />; case "water": return <Droplet className="h-5 w-5 text-[var(--color-info-text)]" />; case "meal_alert": return <AlertCircle className="h-5 w-5 text-[var(--color-warning-text)]" />; default: return <Bell className="h-5 w-5" />; } };
  const getIconBg = (type) => { switch (type) { case "reminder": return "bg-[var(--color-success-bg-subtle)]"; case "message": return "bg-[var(--color-primary-bg-subtle)]"; case "water": return "bg-[var(--color-info-bg-subtle)]"; case "meal_alert": return "bg-[var(--color-warning-bg-subtle)]"; default: return "bg-[var(--color-bg-interactive-subtle)]"; } };
  
  const NotificationContent = ({ note }) => (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(note.type)}`}>{getIcon(note.type)}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--color-text-strong)] capitalize">{note.type === 'water' ? "Water Goal" : note.type === 'reminder' ? "Reminder" : note.type === 'meal_alert' ? "Calorie Alert" : note.sender_name || "New Message"}</p>
        <p className="text-sm text-[var(--color-text-default)] break-words">{note.text}</p>
      </div>
       {!note.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center flex-shrink-0"></div>}
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="relative flex items-center justify-center h-10 w-10 rounded-full">
        <Bell className="h-6 w-6 text-[var(--color-text-default)]  relative top-[1px]" />
        {hasNew && (<span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" /></span>)}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="absolute right-0 mt-3 w-80 bg-[var(--color-bg-surface)] border-2 border-[var(--color-border-default)] rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex justify-between items-center p-3 font-semibold border-b-2 border-[var(--color-border-default)] bg-[var(--color-bg-app)]">
              <span className="text-[var(--color-text-strong)]">Notifications</span>
              {notifications.some(n => n.read) && (<button onClick={handleClearAll} className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)] transition-colors flex items-center gap-1"><XCircle size={14} /> Clear Read</button>)}
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-12 w-12 text-green-500 opacity-50 mb-3" />
                <p className="font-semibold text-[var(--color-text-strong)]">You're all caught up!</p>
                <p className="text-sm text-[var(--color-text-muted)]">New notifications will appear here.</p>
              </div>
            ) : (
              <ul className="max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {notifications.map((note, idx) => {
                    const isActionable = note.type === 'message' || note.type === 'reminder';
                    return (
                      <motion.li key={note.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, transition: { duration: 0.15 } }} transition={{ duration: 0.25, delay: idx * 0.05 }} className={`block p-3 border-b-2 border-[var(--color-border-default)] last:border-b-0 transition-colors duration-200 ${!note.read ? 'bg-blue-500/5' : ''} ${isActionable ? 'cursor-pointer hover:bg-[var(--color-bg-interactive-subtle)]' : ''}`} onClick={isActionable ? () => handleActionableClick(note) : undefined}>
                        <NotificationContent note={note} />
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;