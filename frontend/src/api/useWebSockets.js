// FILE: src/api/useWebSockets.js (REPLACE ENTIRE FILE)

import { useEffect, useCallback } from 'react';

// --- Global WebSocket manager ---
let messageSocket = null;
let reminderSocket = null;
let messageReconnectTimer = null;
let reminderReconnectTimer = null;
let messageHeartbeatTimer = null;
let reminderHeartbeatTimer = null;

let onMessageHandler    = () => {};
let onReminderHandler   = () => {};
let onSuggestionHandler = () => {};
let onMeetingEndedHandler = () => {};

// +++ KILL SWITCH +++
const WEBSOCKETS_DISABLED = false;

const WEBSOCKET_URL      = import.meta.env.VITE_WS_URL;
const RECONNECT_DELAY    = 5000;
const HEARTBEAT_INTERVAL = 30000;

// ─────────────────────────────────────────────
// Message socket
// ─────────────────────────────────────────────
const connectMessages = () => {
  if (WEBSOCKETS_DISABLED) return;
  const token = localStorage.getItem("token");
  if (!token) return;
  if (messageSocket && messageSocket.readyState !== WebSocket.CLOSED) return;

  messageSocket = new WebSocket(`${WEBSOCKET_URL}/ws/messages/?token=${token}`);
  console.log("Attempting to connect Message WebSocket...");

  messageSocket.onopen = () => {
    console.log("✅ Message WebSocket connected.");
    clearTimeout(messageReconnectTimer);
    startHeartbeat('message');
  };

  messageSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'pong') return;
    onMessageHandler(data);
  };

  messageSocket.onerror  = (error) => console.error("❌ Message WebSocket error:", error);

  messageSocket.onclose = (event) => {
    console.log(`🔌 Message WebSocket closed: ${event.code}`);
    stopHeartbeat('message');
    if (event.code !== 1000) {
      clearTimeout(messageReconnectTimer);
      messageReconnectTimer = setTimeout(connectMessages, RECONNECT_DELAY);
    }
  };
};

// ─────────────────────────────────────────────
// Reminder socket  (also handles food_suggestion)
// ─────────────────────────────────────────────
const connectReminders = () => {
  if (WEBSOCKETS_DISABLED) return;
  const token = localStorage.getItem("token");
  if (!token) return;
  if (reminderSocket && reminderSocket.readyState !== WebSocket.CLOSED) return;

  reminderSocket = new WebSocket(`${WEBSOCKET_URL}/ws/reminders/?token=${token}`);
  console.log("Attempting to connect Reminder WebSocket...");

  reminderSocket.onopen = () => {
    console.log("✅ Reminder WebSocket connected.");
    clearTimeout(reminderReconnectTimer);
    startHeartbeat('reminder');
  };

  // AFTER
reminderSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'pong') return;
  if (data.type === 'food_suggestion') {
    onSuggestionHandler(data);
  } else if (data.type === 'meeting_ended') {
    onMeetingEndedHandler(data);
  } else {
    onReminderHandler(data);
  }
};

  reminderSocket.onerror = (error) => console.error("❌ Reminder WebSocket error:", error);

  reminderSocket.onclose = (event) => {
    console.log(`🔌 Reminder WebSocket closed: ${event.code}`);
    stopHeartbeat('reminder');
    if (event.code !== 1000) {
      clearTimeout(reminderReconnectTimer);
      reminderReconnectTimer = setTimeout(connectReminders, RECONNECT_DELAY);
    }
  };
};

// ─────────────────────────────────────────────
// Heartbeat helpers
// ─────────────────────────────────────────────
const startHeartbeat = (type) => {
  const socket   = type === 'message' ? messageSocket : reminderSocket;
  let   timerRef = type === 'message' ? messageHeartbeatTimer : reminderHeartbeatTimer;

  clearInterval(timerRef);
  const newTimer = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "ping" }));
    }
  }, HEARTBEAT_INTERVAL);

  if (type === 'message') messageHeartbeatTimer = newTimer;
  else                    reminderHeartbeatTimer = newTimer;
};

const stopHeartbeat = (type) => {
  const timerRef = type === 'message' ? messageHeartbeatTimer : reminderHeartbeatTimer;
  clearInterval(timerRef);
};

const disconnectAll = () => {
  clearTimeout(messageReconnectTimer);
  clearTimeout(reminderReconnectTimer);
  stopHeartbeat('message');
  stopHeartbeat('reminder');
  if (messageSocket) messageSocket.close(1000, "User left page");
  if (reminderSocket) reminderSocket.close(1000, "User left page");
  console.log("WebSockets cleanly disconnected.");
};

window.addEventListener("beforeunload", disconnectAll);

// ─────────────────────────────────────────────
// The React hook
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// The React hook
// ─────────────────────────────────────────────
const useWebSockets = ({ onReminder, onMessage, onSuggestion, onMeetingEnded }) => {

  useEffect(() => {
    if (WEBSOCKETS_DISABLED) {
      console.warn("WebSockets are currently disabled via the kill switch in useWebSockets.js");
      return;
    }

    if (onMessage)      onMessageHandler      = onMessage;
    if (onReminder)     onReminderHandler     = onReminder;
    if (onSuggestion)   onSuggestionHandler   = onSuggestion;
    if (onMeetingEnded) onMeetingEndedHandler = onMeetingEnded;

    connectMessages();
    connectReminders();

    return () => {
      onMessageHandler      = () => {};
      onReminderHandler     = () => {};
      onSuggestionHandler   = () => {};
      onMeetingEndedHandler = () => {};
    };
  }, []);
};

export default useWebSockets;