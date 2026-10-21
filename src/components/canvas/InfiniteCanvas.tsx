import React, { useRef, useState, useEffect } from 'react';
import type { CanvasNode, Connection, HighlightColor } from '../../types';
import { ConnectionLine } from './ConnectionLine';
import { ScriptureNode } from '../nodes/ScriptureNode';
import { StickyNoteNode } from '../nodes/StickyNoteNode';
import { LexiconNode } from '../nodes/LexiconNode';
import { PromptNode } from '../nodes/PromptNode';

interface InfiniteCanvasProps {
  nodes: Record<string, CanvasNode>;
  connections: Connection[];
  zoom: number;
  pan: { x: number; y: number };
  activeTool: 'select' | 'pan' | 'connect' | 'highlighter';
  activeColor: HighlightColor;
  selectedNodeId: string | null;
  onPanChange: (pan: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onSelectNode: (nodeId: string | null) => void;
  onDragStartNode?: (nodeId: string) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  onUpdateConnection?: (connectionId: string, updates: Partial<Connection>) => void;
  onUpdateHighlights: (nodeId: string, verseNum: number, color: HighlightColor, tag?: string) => void;
  onUpdateStickyContent: (nodeId: string, content: string) => void;
  onUpdateStickyCategory: (nodeId: string, category: any) => void;
  onUpdateStickyColor?: (nodeId: string, color: any) => void;
  onAddPromptAnswer: (nodeId: string, text: string) => void;
  onOpenCrossRefs: (verseRef: string, verseNum: number, nodeId?: string) => void;
  onOpenLexicon: (strongs: string) => void;
  onAddStickyForVerse: (verseRef: string) => void;
  onOpenCommentary?: (book: string, chapter: number, verse: number, verseText?: string) => void;
  onConnectNodes: (sourceId: string, targetId: string) => void;
  onCursorMove?: (x: number, y: number) => void;
  onCursorLeave?: () => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  nodes,
  connections,
  zoom,
  pan,
  activeTool,
  activeColor,
  selectedNodeId,
  onPanChange,
  onZoomChange,
  onSelectNode,
  onDragStartNode,
  onUpdateNodePosition,
  onDeleteNode,
  onDeleteConnection,
  onUpdateConnection,
  onUpdateHighlights,
  onUpdateStickyContent,
  onUpdateStickyCategory,
  onUpdateStickyColor,
  onAddPromptAnswer,
  onOpenCrossRefs,
  onOpenLexicon,
  onAddStickyForVerse,
  onOpenCommentary,
  onConnectNodes,
  onCursorMove,
  onCursorLeave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Node Dragging State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Active Connection Creation State
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Selected Connection
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);

  // Global Keyboard Shortcuts (Space to Pan, Backspace/Delete to remove, Esc to cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInput) return;

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedConnectionId) {
          e.preventDefault();
          onDeleteConnection(selectedConnectionId);
          setSelectedConnectionId(null);
        } else if (selectedNodeId) {
          e.preventDefault();
          onDeleteNode(selectedNodeId);
        }
      } else if (e.key === 'Escape') {
        setSelectedConnectionId(null);
        setConnectingSourceId(null);
        onSelectNode(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedConnectionId, selectedNodeId, onDeleteConnection, onDeleteNode, onSelectNode]);

  // Multi-Touch & Pinch-to-Zoom Gesture State for Mobile / Tablet
  const touchState = useRef<{
    initialDist: number | null;
    initialZoom: number;
    initialMidpoint: { x: number; y: number } | null;
    initialPan: { x: number; y: number } | null;
    isSingleTouchPanning: boolean;
    touchPanStart: { x: number; y: number };
  }>({
    initialDist: null,
    initialZoom: 1,
    initialMidpoint: null,
    initialPan: null,
    isSingleTouchPanning: false,
    touchPanStart: { x: 0, y: 0 },
  });

  // Zoom Handler with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.min(Math.max(newZoom, 0.35), 2.2);

    // Zoom centered around mouse
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleRatio = clampedZoom / zoom;
    const newPanX = mouseX - (mouseX - pan.x) * scaleRatio;
    const newPanY = mouseY - (mouseY - pan.y) * scaleRatio;

    onZoomChange(clampedZoom);
    onPanChange({ x: newPanX, y: newPanY });
  };

  // Canvas Mouse Down (Panning or Deselect)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.button === 1 || 
      activeTool === 'pan' || 
      isSpacePressed || 
      (e.button === 0 && e.target === containerRef.current)
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
      setSelectedConnectionId(null);
    }
  };

  const rafId = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Send world coordinates so peer cursors anchor precisely to cards across different viewport sizes
    const worldX = Math.round((clientX - pan.x) / zoom);
    const worldY = Math.round((clientY - pan.y) / zoom);
    onCursorMove?.(worldX, worldY);

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (isPanning) {
        onPanChange({
          x: clientX - panStart.x,
          y: clientY - panStart.y,
        });
      } else if (draggingNodeId) {
        const dragWorldX = (clientX - pan.x) / zoom - dragOffset.x;
        const dragWorldY = (clientY - pan.y) / zoom - dragOffset.y;
        onUpdateNodePosition(draggingNodeId, Math.round(dragWorldX), Math.round(dragWorldY));
      }
    });
  };

  const handleMouseUp = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Mobile / Tablet Multi-Touch & Pinch-to-Zoom Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if (e.target === containerRef.current || activeTool === 'pan') {
        const touch = e.touches[0];
        touchState.current.isSingleTouchPanning = true;
        touchState.current.touchPanStart = {
          x: touch.clientX - pan.x,
          y: touch.clientY - pan.y,
        };
        onSelectNode(null);
        setSelectedConnectionId(null);
      }
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      touchState.current.initialDist = dist;
      touchState.current.initialZoom = zoom;
      touchState.current.initialMidpoint = { x: midX, y: midY };
      touchState.current.initialPan = { ...pan };
      touchState.current.isSingleTouchPanning = false;
      setDraggingNodeId(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      e.touches.length === 2 &&
      touchState.current.initialDist &&
      touchState.current.initialMidpoint &&
      touchState.current.initialPan
    ) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = currentDist / touchState.current.initialDist;
      const newZoom = Math.min(Math.max(touchState.current.initialZoom * scale, 0.35), 2.2);

      const currentMidX = (t1.clientX + t2.clientX) / 2;
      const currentMidY = (t1.clientY + t2.clientY) / 2;
      const initMid = touchState.current.initialMidpoint;
      const initPan = touchState.current.initialPan;
      const scaleRatio = newZoom / touchState.current.initialZoom;

      const newPanX = currentMidX - (initMid.x - initPan.x) * scaleRatio;
      const newPanY = currentMidY - (initMid.y - initPan.y) * scaleRatio;

      onZoomChange(newZoom);
      onPanChange({ x: newPanX, y: newPanY });
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touchState.current.isSingleTouchPanning) {
        onPanChange({
          x: touch.clientX - touchState.current.touchPanStart.x,
          y: touch.clientY - touchState.current.touchPanStart.y,
        });
      } else if (draggingNodeId) {
        const worldX = (touch.clientX - pan.x) / zoom - dragOffset.x;
        const worldY = (touch.clientY - pan.y) / zoom - dragOffset.y;
        onUpdateNodePosition(draggingNodeId, Math.round(worldX), Math.round(worldY));
      }
    }
  };

  const handleTouchEnd = () => {
    touchState.current.initialDist = null;
    touchState.current.isSingleTouchPanning = false;
    setDraggingNodeId(null);
  };

  const handleNodeTouchStart = (e: React.TouchEvent, node: CanvasNode) => {
    if (e.touches.length === 1 && activeTool !== 'pan') {
      const touch = e.touches[0];
      const worldX = (touch.clientX - pan.x) / zoom;
      const worldY = (touch.clientY - pan.y) / zoom;
      onDragStartNode?.(node.id);
      setDraggingNodeId(node.id);
      setDragOffset({
        x: worldX - node.x,
        y: worldY - node.y,
      });
      onSelectNode(node.id);
    }
  };

  // Node Drag Start
  const handleNodeMouseDown = (e: React.MouseEvent, node: CanvasNode) => {
    if (activeTool === 'pan' || isSpacePressed) return;

    if (connectingSourceId) {
      // Connect completed
      if (connectingSourceId !== node.id) {
        onConnectNodes(connectingSourceId, node.id);
      }
      setConnectingSourceId(null);
      return;
    }

    e.stopPropagation();
    onSelectNode(node.id);
    onDragStartNode?.(node.id);

    // Calculate drag offset inside the node
    const clickWorldX = (e.clientX - pan.x) / zoom;
    const clickWorldY = (e.clientY - pan.y) / zoom;

    setDraggingNodeId(node.id);
    setDragOffset({
      x: clickWorldX - node.x,
      y: clickWorldY - node.y,
    });
  };

  const handleStartConnect = (nodeId: string) => {
    setConnectingSourceId(nodeId);
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={() => onCursorLeave?.()}
      className={`w-full h-full relative overflow-hidden touch-none select-none ${
        isPanning || activeTool === 'pan' || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.14) 1.5px, transparent 1.5px)',
        backgroundSize: `${28 * zoom}px ${28 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Canvas World Container - Rendered with native vector sharpness at all zoom levels */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
        }}
      >
        {/* SVG Connection Lines Layer */}
        <svg
          className="absolute inset-0 pointer-events-none overflow-visible"
          style={{ width: 1, height: 1 }}
        >
          {connections.map((conn) => (
            <ConnectionLine
              key={conn.id}
              connection={conn}
              nodes={nodes}
              isSelected={selectedConnectionId === conn.id}
              onSelect={() => setSelectedConnectionId(conn.id)}
              onDelete={() => onDeleteConnection(conn.id)}
              onUpdate={(updates) => onUpdateConnection?.(conn.id, updates)}
            />
          ))}
        </svg>

        {/* Canvas Nodes Layer */}
        {Object.values(nodes).map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isConnectingSource = connectingSourceId === node.id;

          return (
            <div
              key={node.id}
              id={`node-${node.id}`}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onTouchStart={(e) => handleNodeTouchStart(e, node)}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                zIndex: node.zIndex || (isSelected ? 20 : 10),
              }}
              className={`transition-shadow ${
                isConnectingSource ? 'ring-4 ring-sky-400 ring-offset-4 ring-offset-slate-950 rounded-2xl' : ''
              }`}
            >
              {node.type === 'scripture' && (
                <ScriptureNode
                  node={node}
                  isSelected={isSelected}
                  activeColor={activeColor}
                  activeTool={activeTool}
                  onSelect={() => onSelectNode(node.id)}
                  onDelete={() => onDeleteNode(node.id)}
                  onUpdateHighlights={(vNum, col, tag) => onUpdateHighlights(node.id, vNum, col, tag)}
                  onOpenCrossRefs={onOpenCrossRefs}
                  onOpenLexicon={onOpenLexicon}
                  onStartConnect={handleStartConnect}
                  onAddStickyForVerse={onAddStickyForVerse}
                  onOpenCommentary={onOpenCommentary}
                />
              )}

              {node.type === 'sticky' && (
                <StickyNoteNode
                  node={node}
                  isSelected={isSelected}
                  onSelect={() => onSelectNode(node.id)}
                  onDelete={() => onDeleteNode(node.id)}
                  onUpdateContent={(content) => onUpdateStickyContent(node.id, content)}
                  onUpdateCategory={(cat) => onUpdateStickyCategory(node.id, cat)}
                  onUpdateColor={(col) => onUpdateStickyColor?.(node.id, col)}
                  onStartConnect={handleStartConnect}
                />
              )}

              {node.type === 'lexicon' && (
                <LexiconNode
                  node={node}
                  isSelected={isSelected}
                  onSelect={() => onSelectNode(node.id)}
                  onDelete={() => onDeleteNode(node.id)}
                  onStartConnect={handleStartConnect}
                />
              )}

              {node.type === 'prompt' && (
                <PromptNode
                  node={node}
                  isSelected={isSelected}
                  onSelect={() => onSelectNode(node.id)}
                  onDelete={() => onDeleteNode(node.id)}
                  onAddAnswer={(text) => onAddPromptAnswer(node.id, text)}
                  onStartConnect={handleStartConnect}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Connecting Mode Banner */}
      {connectingSourceId && (
        <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none z-30">
          <div className="px-4 py-2 rounded-full bg-sky-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 pointer-events-auto">
            <span>Click any target card to connect them with a Scripture link</span>
            <button
              onClick={() => setConnectingSourceId(null)}
              className="ml-2 px-1.5 py-0.5 rounded bg-sky-800 hover:bg-sky-900 text-xs text-sky-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
