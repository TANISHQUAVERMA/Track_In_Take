import React, { useState } from 'react';

const dummyContacts = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

const dummyMessages = {
  1: [
    { fromMe: false, text: 'Hey there!' },
    { fromMe: true, text: 'Hi Alice, how are you?' },
  ],
  2: [
    { fromMe: false, text: 'Hello!' },
    { fromMe: true, text: 'Hey Bob!' },
  ],
  3: [
    { fromMe: false, text: 'What’s up?' },
    { fromMe: true, text: 'Nothing much, Charlie!' },
  ],
};

const ChatModal = () => {
  const [selectedContact, setSelectedContact] = useState(dummyContacts[0]);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(dummyMessages);

  const handleSend = () => {
    if (!messageInput.trim()) return;

    const newMessage = { fromMe: true, text: messageInput };
    const updatedMessages = {
      ...messages,
      [selectedContact.id]: [...(messages[selectedContact.id] || []), newMessage],
    };

    setMessages(updatedMessages);
    setMessageInput('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-3/4 h-4/5 rounded-lg shadow-lg flex">
        
        {/* Contact List */}
        <div className="w-1/3 border-r p-4 bg-white overflow-y-auto">
          <h2 className="text-xl font-bold text-orange-500 mb-4">Contacts</h2>
          {dummyContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-2 mb-2 rounded cursor-pointer ${
                selectedContact.id === contact.id ? 'bg-orange-100' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              {contact.name}
            </div>
          ))}
        </div>

        {/* Chat Window */}
        <div className="w-2/3 flex flex-col p-4 bg-white">
          <div className="border-b pb-2 mb-4 text-orange-500 font-semibold text-lg">
            Chat with {selectedContact.name}
          </div>
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {(messages[selectedContact.id] || []).map((msg, index) => (
              <div
                key={index}
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  msg.fromMe
                    ? 'bg-orange-500 text-white self-end ml-auto'
                    : 'bg-gray-200 text-black self-start'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button
              onClick={handleSend}
              className="bg-orange-500 text-white px-4 py-2 rounded-r"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
