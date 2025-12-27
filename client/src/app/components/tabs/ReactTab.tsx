import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../../contexts/SocketContext';
import MessageComposer from '../MessageComposer';
import UserProfile from '../UserProfile';
import EmojiPicker from '../EmojiPicker';
import { getEmojiUrl } from '../../data/emoji-data';

interface ReactTabProps {
  username: string;
}

export default function ReactTab({ username }: ReactTabProps) {
  const { questions, sendReaction, sendQuestion, upvoteQuestion } = useSocket();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questions]);

  // Reverse questions so oldest first, newest last (like normal texting)
  const sortedQuestions = [...questions].reverse();

  if (selectedUser) {
    return (
      <UserProfile
        username={selectedUser}
        onBack={() => setSelectedUser(null)}
        onDM={() => {
          // TODO: Navigate to DMs tab with this user
          setSelectedUser(null);
        }}
      />
    );
  }

  const handleEmojiSelect = (emoji: string, isCustom: boolean) => {
    // For custom emojis, send the URL; for unicode, send the emoji directly
    const emojiToSend = isCustom ? getEmojiUrl(emoji) : emoji;
    sendReaction(emojiToSend);
  };

  const handleSend = (data: { drawing?: string; text?: string }) => {
    if (data.drawing) {
      sendQuestion(data.text || '', 'drawing', data.drawing);
    } else if (data.text) {
      sendQuestion(data.text, 'text');
    }
  };

  const handleUpvote = (id: string) => {
    upvoteQuestion(id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Emoji Reactions - Fixed at top */}
      <div className="p-3" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
      }}>
        <EmojiPicker onSelect={handleEmojiSelect} />
      </div>

      {/* Questions Feed - Scrollable middle */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        <h3 className="px-2 mb-2" style={{
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Questions & Reactions
        </h3>

        {sortedQuestions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl" style={{
            background: 'white',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)'
          }}>
            <div className="text-4xl mb-3">💬</div>
            <p style={{
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '16px',
              color: 'var(--text)',
              fontWeight: '600'
            }}>
              No questions yet!
            </p>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginTop: '4px'
            }}>
              Be the first to ask something
            </p>
          </div>
        ) : (
          sortedQuestions.map((item) => (
            <div
              key={item.odId}
              className="p-4 rounded-2xl"
              style={{
                background: 'white',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
                border: '2px solid #3b82f6'
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  color: 'white',
                  fontFamily: 'Fredoka, sans-serif',
                  fontWeight: '700'
                }}>
                  {item.odUsername[0]}
                </div>
                <button
                  onClick={() => setSelectedUser(item.odUsername)}
                  style={{
                    fontFamily: 'Fredoka, sans-serif',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--text)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textDecorationColor: 'transparent',
                    transition: 'text-decoration-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecorationColor = 'var(--text)'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecorationColor = 'transparent'}
                >
                  {item.odUsername}
                </button>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{
                  background: item.odType === 'drawing'
                    ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  color: 'white',
                  fontFamily: 'Fredoka, sans-serif',
                  fontSize: '10px',
                  fontWeight: '700'
                }}>
                  {item.odType === 'drawing' ? '🎨 Drawing' : '❓ Question'}
                </span>
                <span className="ml-auto text-xs" style={{
                  color: 'var(--text-muted)',
                  fontSize: '11px'
                }}>
                  {new Date(item.odCreatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>

              {/* Content */}
              {item.odImageData && (
                <img
                  src={item.odImageData}
                  alt="Drawing"
                  className="mb-2 rounded-xl w-full"
                  style={{
                    maxHeight: '150px',
                    objectFit: 'contain',
                    background: '#ffffeb'
                  }}
                />
              )}
              {item.odContent && (
                <p style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  color: 'var(--text)',
                  lineHeight: '1.5'
                }}>
                  {item.odContent}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleUpvote(item.odId)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all transform hover:scale-105"
                  style={{
                    background: item.odHasUpvoted
                      ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
                      : 'var(--bg-secondary)',
                    border: 'none',
                    fontFamily: 'Fredoka, sans-serif',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: item.odHasUpvoted ? 'white' : 'var(--text)'
                  }}
                >
                  👍 {item.odUpvotes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer - Fixed at bottom, above nav */}
      <div className="p-3" style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)'
      }}>
        <MessageComposer 
          onSend={handleSend} 
          placeholder="React or ask a question..."
          compact={true}
        />
      </div>
    </div>
  );
}