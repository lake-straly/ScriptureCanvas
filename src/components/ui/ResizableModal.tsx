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
  minWidth = 360,
  minHeight = 280,
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
    e: React.MouseEvent,
    direction: 'right' | 'left' | 'bottom' | 'corner-br' | 'corner-bl'
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

    setIsResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const maxW = window.innerWidth - 24;
      const maxH = window.innerHeight - 24;

      let nextW = startW;
      let nextH = size.height ?? startH;

      // Because modal is flex-centered, multiply horizontal delta by 2 so cursor tracks the edge
      if (direction === 'right' || direction === 'corner-br') {
        nextW = Math.min(maxW, Math.max(minWidth, startW + dx * 2));
      } else if (direction === 'left' || direction === 'corner-bl') {
        nextW = Math.min(maxW, Math.max(minWidth, startW - dx * 2));
      }

      if (direction === 'bottom' || direction === 'corner-br' || direction === 'corner-bl') {
        nextH = Math.min(maxH, Math.max(minHeight, startH + dy * 2));
      }

      setSize({
        width: Math.round(nextW),
        height:
          direction === 'bottom' || direction === 'corner-br' || direction === 'corner-bl'
            ? Math.round(nextH)
            : size.height,
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 ${backdropClassName} animate-in fade-in duration-150`}
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: size.width ? `${Math.min(size.width, typeof window !== 'undefined' ? window.innerWidth - 24 : size.width)}px` : undefined,
          height: size.height ? `${Math.min(size.height, typeof window !== 'undefined' ? window.innerHeight - 24 : size.height)}px` : undefined,
          maxWidth: '96vw',
          maxHeight: '94vh',
        }}
        className={`relative flex flex-col ${className}`}
      >
        {children}

        {/* Left Edge Resize Handle */}
        <div
          onMouseDown={(e) => startResize(e, 'left')}
          className="hidden sm:block absolute top-3 bottom-6 -left-1.5 w-3 cursor-ew-resize z-30 group"
          title="Drag to resize width"
        >
          <div className="h-full w-0.5 mx-auto rounded-full bg-transparent group-hover:bg-sky-500/50 transition-colors" />
        </div>

        {/* Right Edge Resize Handle */}
        <div
          onMouseDown={(e) => startResize(e, 'right')}
          className="hidden sm:block absolute top-3 bottom-6 -right-1.5 w-3 cursor-ew-resize z-30 group"
          title="Drag to resize width"
        >
          <div className="h-full w-0.5 mx-auto rounded-full bg-transparent group-hover:bg-sky-500/50 transition-colors" />
        </div>

        {/* Bottom Edge Resize Handle */}
        <div
          onMouseDown={(e) => startResize(e, 'bottom')}
          className="hidden sm:block absolute left-4 right-8 -bottom-1.5 h-3 cursor-ns-resize z-30 group"
          title="Drag to resize height"
        >
          <div className="w-full h-0.5 my-auto rounded-full bg-transparent group-hover:bg-sky-500/50 transition-colors" />
        </div>

        {/* Bottom-Right Corner Grip (Tactile Resize Handle) */}
        <div
          onMouseDown={(e) => startResize(e, 'corner-br')}
          onDoubleClick={() => setSize({ width: defaultWidth, height: defaultHeight })}
          className="hidden sm:flex absolute bottom-1 right-1 w-6 h-6 cursor-nwse-resize z-40 items-end justify-end p-1 text-slate-500 hover:text-sky-400 transition-colors"
          title="Drag corner to resize modal (Double-click to reset size)"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="opacity-70 hover:opacity-100">
            <path
              d="M11 1L1 11M11 6L6 11M11 10.5L10.5 11"
              stroke="currentColor"
              strokeWidth="1.6"
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
  minWidth = 340,
  className = '',
}) => {
  const [width, setWidth] = useState<number>(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = width;
    setIsResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = startX - moveEvent.clientX;
      const maxW = window.innerWidth - 32;
      setWidth(Math.round(Math.min(maxW, Math.max(minWidth, startW + dx))));
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
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
      style={{
        width:
          typeof window !== 'undefined' && window.innerWidth >= 640
            ? `${Math.min(width, window.innerWidth - 24)}px`
            : undefined,
        maxWidth: '96vw',
      }}
      className={`fixed inset-y-0 right-0 z-50 w-full ${className}`}
    >
      {/* Left Edge Drag Handle */}
      <div
        onMouseDown={startResize}
        onDoubleClick={() => setWidth(defaultWidth)}
        className="hidden sm:flex absolute inset-y-0 -left-1.5 w-3 cursor-ew-resize z-40 items-center justify-center group"
        title="Drag edge to resize drawer width (Double-click to reset)"
      >
        <div className="h-full w-0.5 bg-transparent group-hover:bg-sky-500/60 transition-colors" />
        <div className="absolute w-1.5 h-10 rounded-full bg-slate-700/80 group-hover:bg-sky-400 border border-slate-600 transition-colors" />
      </div>

      {children}
    </div>
  );
};
