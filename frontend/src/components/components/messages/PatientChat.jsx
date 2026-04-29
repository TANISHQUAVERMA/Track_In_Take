import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, AlertCircle, Clock, MessageSquare, Mail, Phone, UserCheck } from 'lucide-react';
import { getMessages, sendMessage, markMessageAsRead, getMyNutritionist } from '../../../api/messagePatientApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import useWebSockets from '../../../api/useWebSockets';

// --- CHANGE: IMPORT THE NEW FUNCTION FROM THE NOTIFICATION COMPONENT ---
import { clearMessageNotifications } from '../NotificationDropdown';


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

const PulsingDotsLoader = ({ text }) => (
  <div className="flex flex-col items-center justify-center gap-6">
    <div className="flex items-center justify-center gap-3">
      <motion.div className="w-4 h-4 bg-[var(--color-primary)] rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="w-4 h-4 bg-[var(--color-accent-2-text)] rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
      <motion.div className="w-4 h-4 bg-[var(--color-text-muted)] rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
    </div>
    <p className="text-lg text-[var(--color-text-default)] font-[var(--font-secondary)] tracking-wide">{text}</p>
  </div>
);

const getInitials = (name = '') => { const words = name.trim().split(' ').filter(Boolean); if (words.length === 0) return '?'; if (words.length === 1) return words[0][0].toUpperCase(); return (words[0][0] + words[words.length - 1][0]).toUpperCase(); };
const getColorForName = (name = '') => {
  const COLORS = [
    '#F9A825', // golden yellow
    '#EF6C00', // deep orange
    '#AB47BC', // purple
    '#26A69A', // teal
    '#8E24AA', // vibrant purple
    '#FF7043', // coral
    '#D81B60', // pink-red
    '#43A047'  // leaf green
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash % COLORS.length)];
};


const InitialsAvatar = ({ name, size = "w-11 h-11", className = "" }) => {
    const initials = getInitials(name);
    const backgroundColor = getColorForName(name);
    return (
        <div className={`text-lg rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white shadow-lg ${size} ${className}`} style={{ backgroundColor }} aria-label={name}>
            {initials}
        </div>
    );
};
const formatTime = (timestamp) => { if (!timestamp) return ''; return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };

const ChatMessage = ({ message, senderType, nutritionist }) => {
  const isPatient = senderType === 'patient';
  const messageStatus = message.status;
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }} layout className={`flex my-2 items-end gap-3 ${isPatient ? 'justify-end' : 'justify-start'}`}>
      {!isPatient && <InitialsAvatar name={nutritionist.full_name} size="w-10 h-10"/>}
      <div className={`px-4 py-3 rounded-2xl max-w-md md:max-w-xl shadow-md font-[var(--font-secondary)] ${isPatient ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] rounded-br-lg rounded-tl-2xl' : 'bg-[var(--color-bg-surface-alt)] text-[var(--color-text-default)] rounded-bl-lg rounded-tr-2xl'}`}>
        <p className="break-words leading-relaxed">{message.text}</p>
        <div className="flex items-center justify-end gap-1.5 mt-1.5">
          <AnimatePresence>
            {isPatient && ( <> {messageStatus === 'sending' && (<motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} title="Sending..."><Clock size={12} className="opacity-70" /></motion.div>)} {messageStatus === 'failed' && (<motion.div initial={{scale:0}} animate={{scale:1}} exit={{scale:0}} className="text-red-200" title="Failed to send"><AlertCircle size={14} /></motion.div>)}</>)}
          </AnimatePresence>
          <span className={`text-xs ${isPatient ? 'text-white/70' : 'text-[var(--color-text-subtle)]'}`}>{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
};

const AwaitingNutritionistUI = () => {
    return (
        <div className="flex items-center justify-center h-full bg-[var(--color-bg-app)] p-4">
             <motion.div className="flex flex-col items-center max-w-2xl p-8 text-center bg-[var(--color-bg-surface)] rounded-2xl shadow-xl" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <MessageSquare size={56} className="text-[var(--color-primary)] mb-6" />
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-strong)] mb-4">Assigning Your Nutritionist</h1>
                <p className="text-base md:text-lg text-[var(--color-text-default)] max-w-lg mb-8">You'll be able to chat with them right here very soon.</p>
            </motion.div>
        </div>
    );
};


const PatientChatPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [nutritionist, setNutritionist] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [awaitingAssignment, setAwaitingAssignment] = useState(false);
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setError("You must be logged in to chat."); setIsPageLoading(false); return; }
    const fetchInitialData = async () => {
      try {
        const nutritionistResponse = await getMyNutritionist();
        const fetchedNutritionist = nutritionistResponse.data;
        setNutritionist(fetchedNutritionist);
        const messagesResponse = await getMessages();
        const serverMessages = messagesResponse?.data?.results || [];
        setMessages(serverMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
        const hasUnread = serverMessages.some(msg => msg.sender_id === fetchedNutritionist.id && !msg.is_read);
        if (hasUnread) { 
          await markMessageAsRead({ sender_id: fetchedNutritionist.id }); 
          // --- CHANGE: CALL THE FUNCTION AFTER MARKING MESSAGES AS READ ---
          clearMessageNotifications();
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        if (err.response && err.response.status === 404) { setAwaitingAssignment(true); } else { setError("Could not load your chat. Please try again later."); }
      } finally { setIsPageLoading(false); setIsLoading(false); }
    };
    fetchInitialData();
  }, [user, authLoading]);

  const onMessage = useCallback((data) => {
    if (nutritionist && (data.sender_id === nutritionist.id || data.receiver_id === nutritionist.id)) {
       setMessages(prev => {
         if (prev.some(msg => msg.id === data.id)) return prev;
         return [...prev, data];
       });
       if (data.sender_id === nutritionist.id) { 
          markMessageAsRead({ sender_id: nutritionist.id }); 
          // --- CHANGE: CALL THE FUNCTION WHEN A NEW MESSAGE IS SEEN IN REAL-TIME ---
          clearMessageNotifications();
        }
    }
  }, [nutritionist]);
  
  useWebSockets({ onMessage, onReminder: () => {} });

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !nutritionist || !user?.id) return;
    const text = newMessage;
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = { id: tempId, sender_id: user.id, receiver_id: nutritionist.id, text, timestamp: new Date().toISOString(), status: 'sending', is_read: false };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setShowEmojiPicker(false);
    try {
      const response = await sendMessage(nutritionist.id, text);
      const sentMessageObject = response.data;
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...sentMessageObject, status: 'sent' } : msg));
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message.");
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...optimisticMessage, status: 'failed' } : msg));
    }
  };

  const handleEmojiClick = (emojiObject) => { setNewMessage(prev => prev + emojiObject.emoji); };
  
 

  if (isPageLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-app)]"><PulsingDotsLoader text="Loading Your Chat..." /></div>;
  }
  if (awaitingAssignment) { return <AwaitingNutritionistUI />; }
  if (error) {
    return <div className="flex flex-col items-center justify-center h-full p-4 text-center"><AlertCircle size={48} className="mb-4 text-[var(--color-danger-text)]" /><h2 className="text-xl font-semibold text-[var(--color-text-strong)]">{error}</h2></div>;
  }
  if (!nutritionist) {
    return <div className="flex items-center justify-center h-full"><PulsingDotsLoader text="Finalizing details..." /></div>;
  }

  return (
   <div className="h-screen w-full overflow-hidden bg-[var(--color-bg-app)] p- sm:p-6 lg:p-8 font-[var(--font-primary)]">
        <div className="flex h-full max-w-[1600px] mx-auto overflow-hidden rounded-2xl shadow-[0_12px_60px_-10px_rgba(0,0,0,0.35)]
 border border-black/5">

        <aside className="hidden md:flex flex-col w-[320px] lg:w-[360px] border-r border-black/5 bg-[var(--color-bg-surface-alt)]/80 backdrop-blur-xl p-6">
            <header className="pb-4">
                <h1 className="text-2xl font-bold text-[var(--color-text-strong)]">
                Your Health Coach
                </h1>
            </header>
            
            <div className="flex flex-col items-center text-center p-4 mt-4">
                <InitialsAvatar name={nutritionist.full_name} size="w-24 h-24" className="ring-4 ring-[var(--color-primary)]/20" />
                <h2 className="text-xl font-bold text-[var(--color-text-strong)] mt-5">
                    {nutritionist.full_name}
                </h2>
                <p className="text-sm font-medium text-white bg-[var(--color-primary)] px-3 py-1 rounded-full mt-2">
                    Verified Nutritionist
                </p>
            </div>
          
            <div className="border-t border-[var(--color-primary)]/10 my-8"></div>

            <div className="px-2 space-y-4">
              <div className="flex items-start gap-4">
                <UserCheck size={20} className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm text-[var(--color-text-strong)]">Specialization</h4>
                  <p className="text-sm text-[var(--color-text-default)]">{nutritionist.specialization || 'General Nutrition'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail size={20} className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-sm text-[var(--color-text-strong)]">Contact Email</h4>
                  <p className="text-sm text-[var(--color-text-default)] truncate">{nutritionist.email || 'Not available'}</p>
                </div>
              </div>
            </div>

           
            
        </aside>

        <main className="flex flex-col flex-1 w-full overflow-hidden bg-[var(--color-bg-surface)]">
          
          <header className="flex items-center p-4 md:p-5 bg-[var(--color-bg-surface-alt)]/70
 backdrop-blur-lg border-b border-[var(--color-border-default)] flex-shrink-0 z-10">
            <InitialsAvatar name={nutritionist.full_name} size="w-12 h-12" className="ring-2 ring-white" />
            <div className="ml-4">
              <h2 className="text-lg font-bold font-[var(--font-primary)] text-[var(--color-text-strong)]">
                {nutritionist.full_name}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[var(--color-success-text)] rounded-full animate-pulse"></div>
                <p className="text-sm text-[var(--color-text-muted)]">Available to chat</p>
              </div>
            </div>
          </header>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-[var(--color-bg-app)] bg-[url('/assets/chat-bg-pattern.png')] bg-cover bg-center bg-fixed">
            {isLoading ? (
               <div className="flex items-center justify-center h-full"><PulsingDotsLoader text="Loading Messages..." /></div>
            ) : messages.length > 0 ? (
              messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} senderType={msg.sender_id === user.id ? 'patient' : 'nutritionist'} nutritionist={nutritionist} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-muted)]">
                <MessageSquare size={56} className="mb-4 opacity-50" />
                <h4 className="text-lg font-semibold font-[var(--font-primary)] text-[var(--color-text-strong)]">Start the Conversation</h4>
                <p className="font-[var(--font-secondary)]">Send the first message to your nutritionist.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <footer className="p-4 bg-[var(--color-bg-surface-glass)] backdrop-blur-lg border-t border-[var(--color-border-default)] flex-shrink-0 z-10">
            <div className="relative">
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div ref={emojiPickerRef} initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="absolute bottom-full right-0 mb-2">
                    <EmojiPicker onEmojiClick={handleEmojiClick} height={400} width={350} lazyLoadEmojis={true} />
                  </motion.div>
                )}
              </AnimatePresence>
              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input type="text" placeholder="Type a message..." className="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-interactive-subtle)] border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-default)] placeholder:text-[var(--color-text-muted)] transition-all" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <button type="button" onClick={() => setShowEmojiPicker(prev => !prev)} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-full">
                    <Smile size={24}/>
                  </button>
                </div>
                <motion.button whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} type="submit" className="p-3.5 text-[var(--color-text-on-primary)] bg-[var(--color-primary)] rounded-full shadow-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-lg" style={{boxShadow: '0 4px 14px 0 rgba(255, 112, 67, 0.39)'}} disabled={!newMessage.trim()}>
                  <Send size={22}/>
                </motion.button>
              </form>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PatientChatPage;