import { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  onDrawingChange: (dataUrl: string | null) => void;
  width?: number;
  height?: number;
}

const COLORS = [
  { name: 'Black', value: '#1f2937' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#fbbf24' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Eraser', value: '#ffffff' }
];

const BRUSH_SIZES = [
  { label: 'S', size: 2 },
  { label: 'M', size: 4 },
  { label: 'L', size: 8 }
];

export default function DrawingCanvas({ onDrawingChange, width = 300, height = 200 }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0].value);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].size);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with cream background
    ctx.fillStyle = '#ffffeb';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (hasDrawn && canvasRef.current) {
      onDrawingChange(canvasRef.current.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * width;
    const y = ((clientY - rect.top) / rect.height) * height;

    ctx.fillStyle = currentColor;
    ctx.fillRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffeb';
    ctx.fillRect(0, 0, width, height);
    setHasDrawn(false);
    onDrawingChange(null);
  };

  return (
    <div className="space-y-3">
      {/* Canvas */}
      <div className="overflow-hidden" style={{
        borderRadius: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair w-full"
          style={{
            touchAction: 'none',
            background: '#ffffeb'
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Colors */}
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setCurrentColor(color.value)}
              className="w-10 h-10 transition-all transform hover:scale-110 active:scale-95"
              style={{
                background: color.value,
                borderRadius: '12px',
                cursor: 'pointer',
                border: currentColor === color.value ? '3px solid #ec4899' : '3px solid #e5e7eb',
                boxShadow: currentColor === color.value ? '0 4px 12px rgba(236, 72, 153, 0.4)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              title={color.name}
            />
          ))}
        </div>

        {/* Brush Sizes */}
        <div className="flex gap-2 ml-auto">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size.label}
              onClick={() => setBrushSize(size.size)}
              className="px-4 py-2 transition-all transform hover:scale-105"
              style={{
                background: brushSize === size.size 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' 
                  : 'var(--bg-secondary)',
                borderRadius: '12px',
                color: brushSize === size.size ? 'white' : 'var(--text)',
                fontFamily: 'Fredoka, sans-serif',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                boxShadow: brushSize === size.size ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              {size.label}
            </button>
          ))}
          
          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="px-4 py-2 transition-all transform hover:scale-105"
            style={{
              background: 'var(--danger)',
              borderRadius: '12px',
              color: 'white',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '12px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}