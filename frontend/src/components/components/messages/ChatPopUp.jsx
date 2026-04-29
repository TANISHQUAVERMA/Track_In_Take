import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, MessageSquare, X, AlertCircle, Clock } from 'lucide-react';
import { getMessages, sendMessage, getMyNutritionist, markMessageAsRead} from "../../../api/messagePatientApi";
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { useNavigate } from 'react-router-dom';
import useWebSockets from '../../../api/useWebSockets';

// ✅ --- THIS IS THE KEY IMPORT ---
// It imports the "remote control" function from the notification component.
import { clearMessageNotifications } from '../NotificationDropdown';// Adjusted path

// --- [HELPER] Custom hook for handling clicks outside an element ---
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

// --- [UI COMPONENT] A nice loading animation component, themed ---
const PulsingDotsLoader = ({ text }) => (
  <div className="flex flex-col items-center justify-center gap-4 p-8">
    <div className="flex items-center justify-center gap-3">
      <motion.div className="w-3 h-3 bg-[var(--color-primary)] rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="w-3 h-3 bg-[var(--color-accent-2-text)] rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
      <motion.div className="w-3 h-3 bg-[var(--color-text-muted)] rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
    </div>
    {text && <p className="text-sm text-[var(--color-text-muted)] font-[var(--font-secondary)]">{text}</p>}
  </div>
);

// --- [DESIGN & HELPERS] ---
const getInitials = (name = '') => { const words = name.trim().split(' ').filter(Boolean); if (words.length === 0) return '?'; if (words.length === 1) return words[0][0].toUpperCase(); return (words[0][0] + words[words.length - 1][0]).toUpperCase(); };
const formatTime = (timestamp) => { if (!timestamp) return ''; return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

// --- [UI COMPONENT] An individual chat message bubble ---
const ChatMessage = ({ message, isPatient }) => {
  const messageStatus = message.status;
  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }} 
      className={`flex my-2 items-end gap-2 ${isPatient ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`px-3.5 py-2.5 rounded-t-xl max-w-xs shadow-lg font-[var(--font-secondary)] ${isPatient ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] rounded-l-xl shadow-orange-500/20' : 'bg-[var(--color-bg-surface)] text-[var(--color-text-default)] rounded-r-xl shadow-gray-400/10'}`}
      >
        <p className="break-words leading-relaxed">{message.text}</p>
        <div className="flex items-center justify-end gap-1.5 mt-1.5 text-right">
          <AnimatePresence>
            {isPatient && ( <> {messageStatus === 'sending' && (<motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} title="Sending..."><Clock size={12} className="opacity-70" /></motion.div>)} {messageStatus === 'failed' && (<motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="text-red-200" title="Failed to send"><AlertCircle size={14} /></motion.div>)}</>)}
          </AnimatePresence>
          <span className={`text-xs ${isPatient ? 'text-white/70' : 'text-[var(--color-text-subtle)]'}`}>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- [UI COMPONENT] Compact UI for when no nutritionist is assigned (for Popup) ---
const AwaitingAssignmentUI_PopUp = () => {
  const containerVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

  return (
    <motion.div className="flex flex-col items-center justify-center h-full text-center p-4" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="p-4 mb-4 bg-gradient-to-br from-[var(--color-primary-subtle)] to-white rounded-full shadow-inner">
        <motion.div className="p-4 bg-white rounded-full shadow-lg" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
          <MessageSquare size={40} className="text-[var(--color-primary)]" strokeWidth={1.5} />
        </motion.div>
      </motion.div>
      <motion.h3 variants={itemVariants} className="text-xl font-bold font-[var(--font-primary)] text-[var(--color-text-strong)] mb-2">Assigning Your Nutritionist</motion.h3>
      <motion.p variants={itemVariants} className="text-sm font-[var(--font-secondary)] text-[var(--color-text-default)] max-w-xs mb-6">We're setting up your private chat. Nutritionist will be assigned to you shortly!</motion.p>
      <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
        <motion.div className="w-2 h-2 bg-[var(--color-primary)] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="w-2 h-2 bg-[var(--color-primary)] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
        <motion.div className="w-2 h-2 bg-[var(--color-primary)] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
      </motion.div>
    </motion.div>
  );
};

// --- Main Chat Popup Component ---
const ChatPopUp = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [nutritionist, setNutritionist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [awaitingAssignment, setAwaitingAssignment] = useState(false);
  
  const messagesEndRef = useRef(null);
  const popupRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const navigate = useNavigate();
  
  useClickOutside(popupRef, onClose);
  useClickOutside(emojiPickerRef, () => {
    if (showEmojiPicker) setShowEmojiPicker(false);
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !user) {
      setMessages([]); setIsLoading(true); setError(null); setAwaitingAssignment(false); setNutritionist(null);
      return;
    }

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const nutritionistRes = await getMyNutritionist();
        const fetchedNutritionist = nutritionistRes.data;
        setNutritionist(fetchedNutritionist);
        
        const messagesRes = await getMessages();
        const serverMessages = messagesRes?.data?.results || [];
        setMessages(serverMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
        
        const hasUnread = serverMessages.some(m => m.sender_id === fetchedNutritionist.id && !m.is_read);
        if (hasUnread) {
          await markMessageAsRead({ sender_id: fetchedNutritionist.id });
          // ✅ --- FIX 1: Tell the notification dropdown to clear itself ---
          clearMessageNotifications();
        }
        
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setAwaitingAssignment(true);
        } else {
          setError("Could not connect to chat.");
          console.error("Failed to fetch initial chat data:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [isOpen, user]);

   const onMessage = useCallback((data) => {
    if (isOpen && nutritionist && (data.sender_id === nutritionist.id || data.receiver_id === nutritionist.id)) {
      setMessages(prev => {
        if (prev.some(msg => msg.id === data.id)) return prev;
        return [...prev, data];
      });

      if (data.sender_id === nutritionist.id) {
        markMessageAsRead({ sender_id: nutritionist.id });
        // ✅ --- FIX 2: Tell the notification dropdown to clear itself on real-time messages ---
        clearMessageNotifications();
      }
    }
  }, [isOpen, nutritionist]);

  useWebSockets({ onMessage, onReminder: () => {} });
    
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !nutritionist || !user) return;
    const tempId = `temp_${Date.now()}`;
    const text = newMessage;
    setNewMessage('');
    setShowEmojiPicker(false);
    const optimisticMessage = { id: tempId, sender_id: user.id, text, timestamp: new Date().toISOString(), status: 'sending' };
    setMessages(prev => [...prev, optimisticMessage]);
    try {
      const response = await sendMessage(nutritionist.id, text);
      setMessages(prev => prev.map(msg => (msg.id === tempId ? { ...response.data, status: 'sent' } : msg)));
    } catch (err) {
      toast.error("Message failed to send.");
      setMessages(prev => prev.map(msg => (msg.id === tempId ? { ...optimisticMessage, status: 'failed' } : msg)));
    }
  };
  
  const handleEmojiClick = (emojiObject) => { setNewMessage(prev => prev + emojiObject.emoji); };

  const popupVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2, ease: [0.5, 0, 0.75, 0] } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popupRef}
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-10 right-6 w-[370px] h-[500px] bg-[var(--color-bg-surface)] rounded-2xl shadow-2xl flex flex-col font-[var(--font-primary)] border border-[var(--color-border-default)] z-50 overflow-hidden"
        >
          <header className="flex items-center p-4 border-b border-[var(--color-border-default)] flex-shrink-0 bg-[var(--color-bg-surface-glass)] backdrop-blur-md">
            {nutritionist ? (
              <div className="flex items-center gap-3">
               <div className="relative cursor-pointer" onClick={() => { navigate('/dashboard/messages'); onClose(); }} title="Go to Messages">
                  <div className="w-10 h-10 bg-[var(--color-primary)] text-white flex items-center justify-center rounded-full font-bold text-sm">
                    {getInitials(nutritionist.full_name)}
                  </div>
                </div>
                <div><h2 className="font-bold text-[var(--color-text-strong)]">{nutritionist.full_name}</h2></div>
              </div>
            ) : (<div className="h-10"></div>)}
            <button onClick={onClose} className="ml-auto p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] rounded-full hover:bg-[var(--color-bg-interactive-subtle)] transition-colors"><X size={20} /></button>
          </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar" style={{backgroundImage: `radial-gradient(var(--color-border-default) 1px, transparent 1px)`, backgroundSize: '20px 20px', backgroundColor: 'var(--color-bg-app)'}}>
            {isLoading ? <div className="flex items-center justify-center h-full"><PulsingDotsLoader text="Loading..." /></div>
            : awaitingAssignment ? <AwaitingAssignmentUI_PopUp />
            : error ? <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-danger-text)] p-4"><AlertCircle size={40} className="mb-2 opacity-50"/><p className="font-semibold">{error}</p></div>
            : messages.length > 0 ? messages.map((msg) => (<ChatMessage key={msg.id} message={msg} isPatient={msg.sender_id === user.id} />))
            : <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)]"><MessageSquare size={48} className="mb-3 opacity-30" /><h4 className="font-semibold text-[var(--color-text-strong)]">Start Chatting</h4><p className="text-sm">Send a message to your nutritionist.</p></div>}
            <div ref={messagesEndRef} />
          </main>

           <footer className="p-3 border-t border-[var(--color-border-default)] flex-shrink-0 bg-[var(--color-bg-surface-glass)] backdrop-blur-md">
            <div className="relative">
              <AnimatePresence>
                {showEmojiPicker && (<motion.div ref={emojiPickerRef} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute bottom-full mb-2"><EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={320} lazyLoadEmojis={true} /></motion.div>)}
              </AnimatePresence>
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="w-full pl-12 pr-4 py-2.5 bg-[var(--color-bg-interactive-subtle)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-default)] placeholder:text-[var(--color-text-subtle)] font-secondary" disabled={isLoading || !!error || awaitingAssignment}/>
                  <button type="button" onClick={() => setShowEmojiPicker(prev => !prev)} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-full" disabled={isLoading || !!error || awaitingAssignment}><Smile size={22}/></button>
                </div>
                <button type="submit" className="p-3 text-white bg-[var(--color-primary)] rounded-full shadow-lg hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={!newMessage.trim() || isLoading || !!error || awaitingAssignment}><Send size={20} /></button>
              </form>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatPopUp;