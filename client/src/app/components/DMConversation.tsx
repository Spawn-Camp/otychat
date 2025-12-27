import { useState } from 'react';
import MessageComposer from './MessageComposer';

interface Contact {
  id: string;
  name: string;
  online: boolean;
}

interface DMConversationProps {
  contact: Contact;
  username: string;
  onBack: () => void;
}

interface Message {
  id: string;
  from: string;
  text?: string;
  drawing?: string;
  timestamp: Date;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    from: 'Jake',
    text: 'dude this slide is so wrong lmao',
    timestamp: new Date('2024-12-23T21:34:00')
  },
  {
    id: '2',
    from: 'You',
    text: 'i know right 💀',
    timestamp: new Date('2024-12-23T21:35:00')
  }
];

export default function DMConversation({ contact, username, onBack }: DMConversationProps) {
  const [messages] = useState<Message[]>(MOCK_MESSAGES);

  const handleSend = (data: { drawing?: string; text?: string }) => {
    console.log('Sending DM:', { to: contact.id, ...data });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)'
      }}>
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all transform hover:scale-110"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none'
          }}
        >
          ←
        </button>
        <div className="flex-1">
          <div style={{
            fontFamily: 'Fredoka, sans-serif',
            fontSize: '16px',
            color: 'white',
            fontWeight: '700'
          }}>
            {contact.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            {contact.online ? '🟢 Online' : '⚫ Offline'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === 'You' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${msg.from === 'You' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              {/* Message Bubble */}
              <div className="p-4 rounded-3xl" style={{
                background: msg.from === 'You' 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' 
                  : 'white',
                color: msg.from === 'You' ? 'white' : 'var(--text)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderRadius: msg.from === 'You' ? '24px 24px 4px 24px' : '24px 24px 24px 4px'
              }}>
                {msg.drawing && (
                  <img src={msg.drawing} alt="Drawing" className="mb-2 rounded-2xl" style={{
                    maxWidth: '200px'
                  }} />
                )}
                {msg.text && (
                  <p style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '14px'
                  }}>
                    {msg.text}
                  </p>
                )}
              </div>
              
              {/* Meta */}
              <div className="flex items-center gap-2 px-2">
                <span style={{
                  color: 'var(--text-muted)',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {msg.from === 'You' ? 'You' : msg.from}
                </span>
                <span style={{
                  color: 'var(--text-muted)',
                  fontSize: '11px'
                }}>
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <MessageComposer onSend={handleSend} placeholder="Message to Jake..." />
      </div>
    </div>
  );
}
