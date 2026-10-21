import React, { useState } from 'react';
import type { Connection, CanvasNode } from '../../types';

interface ConnectionLineProps {
  connection: Connection;
  nodes: Record<string, CanvasNode>;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onUpdate?: (updates: Partial<Connection>) => void;
}

const LINK_COLORS = [
  { hex: '#38bdf8', name: 'Sky' },
  { hex: '#f59e0b', name: 'Amber' },
  { hex: '#10b981', name: 'Emerald' },
  { hex: '#ec4899', name: 'Rose' },
  { hex: '#a855f7', name: 'Purple' },
  { hex: '#f97316', name: 'Orange' },
];

const LINK_PRESETS = [
  { label: 'Cross-Ref / Quote', type: 'direct_quote' as const, color: '#38bdf8' },
  { label: 'Fulfilled In', type: 'prophecy_fulfillment' as const, color: '#f59e0b' },
  { label: 'Parallel', type: 'parallel_passage' as const, color: '#10b981' },
  { label: 'Theme / Motif', type: 'thematic_motif' as const, color: '#a855f7' },
  { label: 'Contrast', type: 'inductive_link' as const, color: '#ec4899' },
];

type Direction = 'left' | 'right' | 'top' | 'bottom';

interface AnchorPoint {
  x: number;
  y: number;
  dir: Direction;
}

interface NodeBounds {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

function getNodeBounds(node: CanvasNode): NodeBounds {
  let w = 300;
  let h = 220;

  // 1. Dynamic DOM inspection (Exact untransformed canvas coordinate dimensions)
  if (typeof document !== 'undefined') {
    const el = document.getElementById(`node-${node.id}`);
    if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
      w = el.offsetWidth;
      h = el.offsetHeight;
      return {
        x: node.x,
        y: node.y,
        w,
        h,
        cx: node.x + w / 2,
        cy: node.y + h / 2,
      };
    }
  }

  // 2. Accurate default canvas-space dimensions
  if (node.type === 'scripture') {
    w = 500;
    const count = node.passage?.verses?.length || 4;
    h = Math.min(Math.max(160 + count * 45, 260), 540);
  } else if (node.type === 'sticky') {
    w = 256;
    h = 190;
  } else if (node.type === 'prompt') {
    w = 400;
    const answers = node.answers?.length || 0;
    h = Math.min(220 + answers * 55, 450);
  } else if (node.type === 'lexicon') {
    w = 300;
    h = 260;
  } else if (node.type === 'motif') {
    w = 320;
    h = 240;
  }

  return {
    x: node.x,
    y: node.y,
    w,
    h,
    cx: node.x + w / 2,
    cy: node.y + h / 2,
  };
}

// Calculate the vertical offset of a verse inside a scripture card
function getVerseOffsetY(node: CanvasNode, verseNum?: number): number | null {
  if (node.type !== 'scripture' || !verseNum || !node.passage?.verses) {
    return null;
  }

  // 1. Dynamic DOM position of exact verse row
  if (typeof document !== 'undefined') {
    const verseEl = document.getElementById(`verse-${node.id}-${verseNum}`);
    const nodeEl = document.getElementById(`node-${node.id}`);
    if (verseEl && nodeEl) {
      const vRect = verseEl.getBoundingClientRect();
      const nRect = nodeEl.getBoundingClientRect();
      if (nRect.height > 0 && nodeEl.offsetHeight > 0) {
        const scale = nRect.width / nodeEl.offsetWidth;
        const relativeY = (vRect.top - nRect.top + vRect.height / 2) / (scale || 1);
        if (!isNaN(relativeY) && relativeY > 0 && relativeY < nodeEl.offsetHeight) {
          return relativeY;
        }
      }
    }
  }

  // 2. Mathematical row fallback
  const verses = node.passage.verses;
  const vIndex = verses.findIndex((v) => v.verseNum === verseNum);
  if (vIndex === -1) return null;

  // Header is 52px. The verses list padding is 16px.
  // Average verse item height is ~54px
  const headerHeight = 52;
  const padding = 16;
  const estimatedRowHeight = 54;
  return headerHeight + padding + (vIndex * estimatedRowHeight) + 20;
}

function getBestAnchors(
  source: NodeBounds, 
  target: NodeBounds, 
  sourceVerseY: number | null, 
  targetVerseY: number | null
): { start: AnchorPoint; end: AnchorPoint } {
  // If verse-specific Y is available, connect directly to that verse row!
  const effectiveSourceCy = sourceVerseY !== null ? source.y + sourceVerseY : source.cy;
  const effectiveTargetCy = targetVerseY !== null ? target.y + targetVerseY : target.cy;

  const dx = target.cx - source.cx;
  const dy = effectiveTargetCy - effectiveSourceCy;

  // If a verse is targeted or if horizontally oriented, dock to side of verse row
  if (sourceVerseY !== null || targetVerseY !== null || Math.abs(dx) >= Math.abs(dy) * 0.7) {
    if (dx >= 0) {
      return {
        start: { x: source.x + source.w, y: effectiveSourceCy, dir: 'right' },
        end: { x: target.x, y: effectiveTargetCy, dir: 'left' },
      };
    } else {
      return {
        start: { x: source.x, y: effectiveSourceCy, dir: 'left' },
        end: { x: target.x + target.w, y: effectiveTargetCy, dir: 'right' },
      };
    }
  } else {
    // Predominantly vertical without verse anchor
    if (dy >= 0) {
      return {
        start: { x: source.cx, y: source.y + source.h, dir: 'bottom' },
        end: { x: target.cx, y: target.y, dir: 'top' },
      };
    } else {
      return {
        start: { x: source.cx, y: source.y, dir: 'top' },
        end: { x: target.cx, y: target.y + target.h, dir: 'bottom' },
      };
    }
  }
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  nodes,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [draftLabel, setDraftLabel] = useState(connection.label || '');

  const sourceNode = nodes[connection.sourceNodeId];
  const targetNode = nodes[connection.targetNodeId];

  if (!sourceNode || !targetNode) return null;

  const sBounds = getNodeBounds(sourceNode);
  const tBounds = getNodeBounds(targetNode);

  const sVerseY = getVerseOffsetY(sourceNode, connection.sourceVerse);
  const tVerseY = getVerseOffsetY(targetNode, connection.targetVerse);

  const { start, end } = getBestAnchors(sBounds, tBounds, sVerseY, tVerseY);

  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const offset = Math.min(Math.max(distance * 0.4, 40), 180);

  // Calculate tangents based on dock direction
  let cp1x = start.x;
  let cp1y = start.y;
  if (start.dir === 'right') cp1x += offset;
  else if (start.dir === 'left') cp1x -= offset;
  else if (start.dir === 'bottom') cp1y += offset;
  else if (start.dir === 'top') cp1y -= offset;

  let cp2x = end.x;
  let cp2y = end.y;
  if (end.dir === 'right') cp2x += offset;
  else if (end.dir === 'left') cp2x -= offset;
  else if (end.dir === 'bottom') cp2y += offset;
  else if (end.dir === 'top') cp2y -= offset;

  const pathData = `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;

  // Midpoint calculation for label
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  const strokeColor = connection.color || '#38bdf8';

  const handleSaveLabel = () => {
    setIsEditingLabel(false);
    if (draftLabel.trim() !== (connection.label || '')) {
      onUpdate?.({ label: draftLabel.trim() || 'Scripture Link' });
    }
  };

  return (
    <g className="cursor-pointer group" onClick={onSelect}>
      {/* Invisible wider hit area for easy clicking */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={26}
        className="pointer-events-auto"
      />

      {/* Outer glow on hover or selected - ONLY transition opacity, NO coordinate sliding */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? 6 : 4}
        strokeOpacity={isSelected ? 0.8 : 0.25}
        className="transition-opacity duration-150 group-hover:stroke-opacity-60"
      />

      {/* Main connection line */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? 2.5 : 2}
        strokeDasharray={connection.type === 'thematic_motif' ? '6 4' : undefined}
        markerEnd={`url(#arrow-${connection.id})`}
        className="transition-[stroke-width] duration-150 group-hover:stroke-width-3"
      />

      {/* Start anchor dot at the exact verse row */}
      <circle
        cx={start.x}
        cy={start.y}
        r={3.5}
        fill={strokeColor}
      />

      {/* Target anchor dot at the exact target verse row */}
      <circle
        cx={end.x}
        cy={end.y}
        r={2.5}
        fill={strokeColor}
        opacity={0.7}
      />

      {/* Arrow Marker Definition */}
      <defs>
        <marker
          id={`arrow-${connection.id}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={strokeColor} />
        </marker>
      </defs>

      {/* Midpoint Label Pill & Interactive Editor */}
      {(connection.label || isSelected) && (
        <foreignObject
          x={midX - 130}
          y={midY - 16}
          width={260}
          height={isSelected ? 110 : 36}
          className="overflow-visible pointer-events-auto"
        >
          <div className="flex flex-col items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Primary Pill */}
            <div
              onClick={() => {
                onSelect?.();
                if (isSelected && !isEditingLabel) {
                  setDraftLabel(connection.label || '');
                  setIsEditingLabel(true);
                }
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-slate-900 border-sky-400 text-sky-200 ring-2 ring-sky-500/30'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-slate-500'
              }`}
              title={isSelected ? 'Click label to rename connection' : 'Click to select or edit link'}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: strokeColor }} />
              {isSelected && isEditingLabel ? (
                <input
                  autoFocus
                  type="text"
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value)}
                  onBlur={handleSaveLabel}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveLabel();
                    if (e.key === 'Escape') setIsEditingLabel(false);
                  }}
                  placeholder="Link label..."
                  className="bg-slate-950 border border-sky-500/60 rounded px-1.5 py-0.5 text-[11px] text-white w-28 focus:outline-none"
                />
              ) : (
                <span className="truncate max-w-[140px]">
                  {connection.label || 'Scripture Link'}
                </span>
              )}
              {isSelected && !isEditingLabel && (
                <span className="text-[10px] text-slate-400 hover:text-sky-300 ml-0.5" title="Edit label">
                  ✎
                </span>
              )}
              {isSelected && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="ml-1 text-slate-400 hover:text-rose-400 p-0.5 rounded hover:bg-slate-800 transition-colors"
                  title="Remove link (Delete/Backspace)"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selected Link Quick Style & Preset Bar */}
            {isSelected && onUpdate && (
              <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/95 border border-slate-700/90 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                {/* Preset Type Pills */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {LINK_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() =>
                        onUpdate({
                          label: preset.label,
                          type: preset.type,
                          color: preset.color,
                        })
                      }
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors ${
                        connection.label === preset.label
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Colors & Line Style Toggle */}
                <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800/80 w-full justify-between px-1">
                  <div className="flex items-center gap-1">
                    {LINK_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => onUpdate({ color: c.hex })}
                        className={`w-3 h-3 rounded-full transition-transform hover:scale-125 ${
                          strokeColor === c.hex ? 'ring-1 ring-white scale-110' : 'opacity-75 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      onUpdate({
                        type: connection.type === 'thematic_motif' ? 'direct_quote' : 'thematic_motif',
                      })
                    }
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[9px] font-mono text-slate-300"
                    title="Toggle Solid vs Dashed Line"
                  >
                    {connection.type === 'thematic_motif' ? '--- Dashed' : '─── Solid'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </foreignObject>
      )}
    </g>
  );
};
