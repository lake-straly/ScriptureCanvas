import type { Collaborator } from '../../types';

interface PresenceCursorsProps {
  collaborators: Collaborator[];
}

export const PresenceCursors: React.FC<PresenceCursorsProps> = ({ collaborators }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-40">
      {collaborators.map((collab) => (
        <div
          key={collab.id}
          className="absolute transition-all duration-300 ease-out"
          style={{
            transform: `translate(${collab.cursor.x}px, ${collab.cursor.y}px)`,
          }}
        >
          {/* SVG Cursor Pointer */}
          <svg
            className="w-5 h-5 drop-shadow-md"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill={collab.color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Collaborator Name Tag */}
          <div
            className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white shadow-lg whitespace-nowrap ml-3 -mt-1 flex items-center gap-1.5"
            style={{ backgroundColor: collab.color }}
          >
            <span>{collab.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
