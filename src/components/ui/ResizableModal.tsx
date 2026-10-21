import React, { useState, useRef, useEffect } from 'react';

interface ResizableModalProps {
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  className?: string;
  backdropClassName?: string;
  onBackdropClick?: () => void;
}

export const ResizableModal: React.FC<ResizableModalProps> = ({
  children,
  defaultWidth = 560,
  defaultHeight,
  minWidth = 340,
  minHeight = 260,
  className = '',
  backdropClassName = 'bg-black/75 backdrop-blur-md',
  onBackdropClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width?: number; height?: number }>({
    width: defaultWidth,
    height: defaultHeight,
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (
    e: React.PointerEvent,
    direction: 'right' | 'left' | 'bottom' | 'top' | 'corner-br' | 'corner-bl'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = rect.width;
    const startH = rect.height;
    const hadExplicitHeight = size.height !== undefined;

    setIsResizing(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const maxW = window.innerWidth - 16;
      const maxH = window.innerHeight - 16;

      let nextW = startW;
      let nextH: number | undefined = hadExplicitHeight ? startH : undefined;

      // Because modal is flex-centered, multiply delta by 2 so the dragged edge follows the cursor 1:1
      if (direction === 'right' || direction === 'corner-br') {
        nextW = Math.min(maxW, Math.max(minWidth, startW + dx * 2));
      } else if (direction === 'left' || direction === 'corner-bl') {
        nextW = Math.min(maxW, Math.max(minWidth, startW - dx * 2));
      }

      if (direction === 'bottom' || direction === 'corner-br' || direction === 'corner-bl') {
        nextH = Math.min(maxH, Math.max(minHeight, startH + dy * 2));
      } else if (direction === 'top') {
        nextH = Math.min(maxH, Math.max(minHeight, startH - dy * 2));
      }

      setSize({
        width: Math.round(nextW),
        height: nextH !== undefined ? Math.round(nextH) : undefined,
      });
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  useEffect(() => {
    if (!isResizing) return;
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div
      onClick={onBackdropClick}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 ${backdropClassName} animate-in fade-in duration-150`}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: size.width ? `${size.width}px` : undefined,
          height: size.height ? `${size.height}px` : undefined,
          maxWidth: '96vw',
          maxHeight: '94vh',
        }}
        className={`relative flex flex-col min-w-0 min-h-0 ${className}`}
      >
        {children}

        {/* Left Edge Resize Handle */}
        <div
          onPointerDown={(e) => startResize(e, 'left')}
          className="absolute top-3 bottom-8 -left-2 w-4 cursor-ew-resize z-40 group touch-none flex items-center justify-center"
          title="Drag edge to resize width"
        >
          <div className="h-12 w-1 rounded-full bg-transparent group-hover:bg-sky-400/80 transition-colors" />
        </div>

        {/* Right Edge Resize Handle */}
        <div
          onPointerDown={(e) => startResize(e, 'right')}
          className="absolute top-3 bottom-8 -right-2 w-4 cursor-ew-resize z-40 group touch-none flex items-center justify-center"
          title="Drag edge to resize width"
        >
          <div className="h-12 w-1 rounded-full bg-transparent group-hover:bg-sky-400/80 transition-colors" />
        </div>

        {/* Bottom Edge Resize Handle */}
        <div
          onPointerDown={(e) => startResize(e, 'bottom')}
          className="absolute left-6 right-10 -bottom-2 h-4 cursor-ns-resize z-40 group touch-none flex items-center justify-center"
          title="Drag bottom edge to resize height"
        >
          <div className="w-12 h-1 rounded-full bg-transparent group-hover:bg-sky-400/80 transition-colors" />
        </div>

        {/* Bottom-Right Corner Grip (Visible Tactile Resize Handle) */}
        <div
          onPointerDown={(e) => startResize(e, 'corner-br')}
          onDoubleClick={() => setSize({ width: defaultWidth, height: defaultHeight })}
          className="absolute bottom-1 right-1 w-7 h-7 cursor-nwse-resize z-50 touch-none flex items-end justify-end p-1.5 rounded-br-2xl text-slate-400 hover:text-sky-300 transition-colors"
          title="Drag corner to resize (Double-click to reset size)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M11 1L1 11M11 5.5L5.5 11M11 10L10 11"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface ResizableDrawerProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  className?: string;
}

export const ResizableDrawer: React.FC<ResizableDrawerProps> = ({
  children,
  defaultWidth = 520,
  minWidth = 320,
  className = '',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = drawerRef.current?.getBoundingClientRect().width || width;
    setIsResizing(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = startX - moveEvent.clientX;
      const maxW = window.innerWidth - 16;
      setWidth(Math.round(Math.min(maxW, Math.max(minWidth, startW + dx))));
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  useEffect(() => {
    if (!isResizing) return;
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div
      ref={drawerRef}
      style={{
        width: `${width}px`,
        maxWidth: '96vw',
      }}
      className={`fixed inset-y-0 right-0 z-50 ${className}`}
    >
      {/* Left Edge Drag Handle */}
      <div
        onPointerDown={startResize}
        onDoubleClick={() => setWidth(defaultWidth)}
        className="absolute inset-y-0 -left-2 w-4 cursor-ew-resize z-50 touch-none flex items-center justify-center group"
        title="Drag edge to resize drawer width (Double-click to reset)"
      >
        <div className="h-full w-0.5 bg-transparent group-hover:bg-sky-500/60 transition-colors" />
        <div className="absolute w-1.5 h-12 rounded-full bg-slate-700/90 group-hover:bg-sky-400 border border-slate-500 transition-colors shadow" />
      </div>

      {children}
    </div>
  );
};
