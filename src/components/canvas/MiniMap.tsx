import type { CanvasNode } from '../../types';

interface MiniMapProps {
  nodes: Record<string, CanvasNode>;
  pan: { x: number; y: number };
  zoom: number;
  onPanTo: (x: number, y: number) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  nodes,
  pan,
  zoom,
  onPanTo,
}) => {
  const nodeList = Object.values(nodes);
  if (nodeList.length === 0) return null;

  // Mini-map dimensions
  const MAP_WIDTH = 180;
  const MAP_HEIGHT = 120;
  const SCALE = 0.05;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click in minimap to canvas world coordinates
    const targetWorldX = (clickX - MAP_WIDTH / 2) / SCALE;
    const targetWorldY = (clickY - MAP_HEIGHT / 2) / SCALE;

    onPanTo(-targetWorldX * zoom + window.innerWidth / 2, -targetWorldY * zoom + window.innerHeight / 2);
  };

  return (
    <div
      onClick={handleMapClick}
      className="w-[180px] h-[120px] rounded-xl bg-slate-950/85 border border-slate-800/80 shadow-2xl backdrop-blur-md overflow-hidden relative cursor-crosshair select-none group hover:border-slate-700 transition-colors"
      title="Click to navigate canvas"
    >
      <div className="absolute top-1.5 left-2 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
        Map
      </div>

      {/* Render miniature nodes */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `translate(${MAP_WIDTH / 2}px, ${MAP_HEIGHT / 2}px)`,
        }}
      >
        {nodeList.map((node) => {
          const w = node.type === 'scripture' ? 24 : node.type === 'prompt' ? 20 : 14;
          const h = node.type === 'scripture' ? 20 : node.type === 'prompt' ? 14 : 10;
          const colorClass =
            node.type === 'scripture'
              ? 'bg-sky-500'
              : node.type === 'lexicon'
              ? 'bg-amber-400'
              : node.type === 'prompt'
              ? 'bg-indigo-400'
              : 'bg-emerald-400';

          return (
            <div
              key={node.id}
              className={`absolute rounded-sm opacity-80 ${colorClass}`}
              style={{
                left: node.x * SCALE,
                top: node.y * SCALE,
                width: w,
                height: h,
              }}
            />
          );
        })}

        {/* Viewport frame indicator */}
        <div
          className="absolute border border-white/50 bg-white/5 pointer-events-none rounded-sm"
          style={{
            left: (-pan.x / zoom) * SCALE,
            top: (-pan.y / zoom) * SCALE,
            width: (window.innerWidth / zoom) * SCALE,
            height: (window.innerHeight / zoom) * SCALE,
          }}
        />
      </div>
    </div>
  );
};
