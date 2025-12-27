import { CSSProperties } from 'react';

interface AnimatedBackgroundProps {
  pattern: 'waves' | 'zigzag' | 'dots' | 'bubbles' | 'gradient';
}

export default function AnimatedBackground({ pattern }: AnimatedBackgroundProps) {
  if (pattern === 'waves') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.1 }} />
              <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.1 }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.1 }} />
            </linearGradient>
            <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 0.08 }} />
              <stop offset="50%" style={{ stopColor: '#10b981', stopOpacity: 0.08 }} />
              <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 0.08 }} />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q250,50 500,100 T1000,100 L1000,0 L0,0 Z"
            fill="url(#waveGradient1)"
            style={{
              animation: 'wave 8s ease-in-out infinite'
            }}
          />
          <path
            d="M0,80 Q200,120 400,80 T800,80 L1000,80 L1000,0 L0,0 Z"
            fill="url(#waveGradient2)"
            style={{
              animation: 'wave 10s ease-in-out infinite reverse'
            }}
          />
          <path
            d="M0,900 Q250,850 500,900 T1000,900 L1000,1200 L0,1200 Z"
            fill="url(#waveGradient1)"
            style={{
              animation: 'wave 12s ease-in-out infinite'
            }}
          />
        </svg>
        <style>{`
          @keyframes wave {
            0%, 100% { d: path("M0,100 Q250,50 500,100 T1000,100 L1000,0 L0,0 Z"); }
            50% { d: path("M0,80 Q250,120 500,80 T1000,80 L1000,0 L0,0 Z"); }
          }
        `}</style>
      </div>
    );
  }

  if (pattern === 'zigzag') {
    const zigzags = Array.from({ length: 20 }, (_, i) => i);
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {zigzags.map((i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 5)}%`,
              top: 0,
              bottom: 0,
              width: '40px',
              opacity: 0.05,
              background: `linear-gradient(135deg, 
                transparent 25%, 
                ${i % 3 === 0 ? '#ec4899' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4'} 25%, 
                ${i % 3 === 0 ? '#ec4899' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4'} 50%, 
                transparent 50%, 
                transparent 75%, 
                ${i % 3 === 0 ? '#ec4899' : i % 3 === 1 ? '#8b5cf6' : '#06b6d4'} 75%)`,
              backgroundSize: '40px 40px',
              animation: `slideDown ${8 + (i % 3) * 2}s linear infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
        <style>{`
          @keyframes slideDown {
            0% { transform: translateY(-40px); }
            100% { transform: translateY(40px); }
          }
        `}</style>
      </div>
    );
  }

  if (pattern === 'dots') {
    const dots = Array.from({ length: 30 }, (_, i) => i);
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {dots.map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              background: `radial-gradient(circle, ${
                i % 4 === 0 ? 'rgba(236, 72, 153, 0.1)' :
                i % 4 === 1 ? 'rgba(139, 92, 246, 0.1)' :
                i % 4 === 2 ? 'rgba(6, 182, 212, 0.1)' :
                'rgba(16, 185, 129, 0.1)'
              }, transparent)`,
              animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.1); }
          }
        `}</style>
      </div>
    );
  }

  if (pattern === 'bubbles') {
    const bubbles = Array.from({ length: 15 }, (_, i) => i);
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {bubbles.map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-10%',
              width: `${40 + Math.random() * 80}px`,
              height: `${40 + Math.random() * 80}px`,
              background: `radial-gradient(circle at 30% 30%, 
                ${i % 4 === 0 ? 'rgba(236, 72, 153, 0.15)' :
                  i % 4 === 1 ? 'rgba(139, 92, 246, 0.15)' :
                  i % 4 === 2 ? 'rgba(6, 182, 212, 0.15)' :
                  'rgba(251, 191, 36, 0.15)'
                }, 
                transparent)`,
              boxShadow: `inset -5px -5px 20px ${
                i % 4 === 0 ? 'rgba(236, 72, 153, 0.2)' :
                i % 4 === 1 ? 'rgba(139, 92, 246, 0.2)' :
                i % 4 === 2 ? 'rgba(6, 182, 212, 0.2)' :
                'rgba(251, 191, 36, 0.2)'
              }`,
              animation: `rise ${10 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
        <style>{`
          @keyframes rise {
            0% { 
              transform: translateY(0) translateX(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% { 
              transform: translateY(-110vh) translateX(${Math.random() * 200 - 100}px);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  // gradient - default
  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        zIndex: 0,
        background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)'
      }} 
    />
  );
}
