import { useState } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import DMConversation from '../DMConversation';

interface DMsTabProps {
  username: string;
}

interface SelectedContact {
  id: string;
  name: string;
  online: boolean;
  unread: number;
}

export default function DMsTab({ username }: DMsTabProps) {
  const { onlineUsers, dms } = useSocket();
  const [selectedContact, setSelectedContact] = useState<SelectedContact | null>(null);

  // Filter out self and create contact list from online users
  const contacts = onlineUsers
    .filter(u => u.odName !== username)
    .map(u => ({
      id: u.odName,
      name: u.odName,
      online: true,
      profilePic: u.odProfilePic,
      title: u.odTitle,
      unread: dms.filter(dm => dm.odFromName === u.odName && !dm.odRead).length
    }));

  if (selectedContact) {
    return (
      <DMConversation
        contact={selectedContact}
        username={username}
        onBack={() => setSelectedContact(null)}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="p-4 rounded-3xl" style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        boxShadow: '0 8px 24px rgba(236, 72, 153, 0.3)'
      }}>
        <h2 style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '18px',
          color: 'white',
          fontWeight: '700'
        }}>
          💬 Direct Messages
        </h2>
        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.8)',
          marginTop: '4px'
        }}>
          {contacts.length} {contacts.length === 1 ? 'person' : 'people'} online
        </p>
      </div>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl" style={{
            background: 'white',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="text-4xl mb-3">👋</div>
            <p style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              color: 'var(--text)',
              fontWeight: '600'
            }}>
              No one else online yet
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '4px'
            }}>
              Invite some friends to the party!
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className="w-full p-5 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-105"
              style={{
                background: 'white',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                border: 'none',
                textAlign: 'left'
              }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}>
                {contact.profilePic || '👤'}
              </div>
              <div className="flex-1">
                <div style={{
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--text)'
                }}>
                  {contact.name}
                </div>
                {contact.title && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>
                    {contact.title}
                  </div>
                )}
              </div>
              {contact.unread > 0 && (
                <span className="px-3 py-1 rounded-full" style={{
                  background: 'var(--danger)',
                  color: 'white',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '12px',
                  fontWeight: '700',
                  minWidth: '24px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                }}>
                  {contact.unread}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
