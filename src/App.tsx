import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  CanvasNode, 
  Connection, 
  HighlightColor, 
  Collaborator, 
  Translation,
  UserProfile,
  PeerMessage,
  ScriptureNodeData,
  StickyNoteData
} from './types';
import { STUDY_TEMPLATES } from './data/templates';
import type { StudyTemplate } from './data/templates';
import type { CrossReferenceRelation } from './data/bibleData';
import { LEXICON_DATABASE } from './data/lexiconData';
import { fetchPassage } from './services/bibleApi';
import { 
  getLocalUser, 
  updateLocalUser, 
  PeerSyncChannel, 
  isRoomUnlocked,
  getRoomPassword,
  markRoomUnlocked,
  computeAuthProof 
} from './services/multiplayer';

import { Navbar } from './components/ui/Navbar';
import { Toolbar } from './components/ui/Toolbar';
import { InfiniteCanvas } from './components/canvas/InfiniteCanvas';
import { MiniMap } from './components/canvas/MiniMap';
import { PresenceCursors } from './components/canvas/PresenceCursors';

import { AddPassageModal } from './components/modals/AddPassageModal';
import { CrossReferenceDrawer } from './components/modals/CrossReferenceDrawer';
import { WordLexiconDrawer } from './components/modals/WordLexiconDrawer';
import { CommentaryDrawer } from './components/modals/CommentaryDrawer';
import { TemplatePickerModal } from './components/modals/TemplatePickerModal';
import { ShareModal } from './components/modals/ShareModal';
import { ExportStudyModal } from './components/modals/ExportStudyModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { ShortcutsHelpModal } from './components/modals/ShortcutsHelpModal';
import { RoomConnectingScreen } from './components/ui/RoomConnectingScreen';
import { RoomLockScreen } from './components/ui/RoomLockScreen';

export const App: React.FC = () => {
  // Extract roomCode from URL search param e.g. ?room=FELLOWSHIP-777
  const [roomCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('room') || 'SCRIPTURE-ROOM-777';
    }
    return 'SCRIPTURE-ROOM-777';
  });

  const STORAGE_KEY = `scripture_study_room_${roomCode}`;

  // Load saved session from localStorage or fallback to default template (Romans 8)
  const getInitialBoard = () => {
    const defaultTemplate = STUDY_TEMPLATES[0];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && Object.keys(parsed.nodes).length > 0) {
          return {
            nodes: parsed.nodes as Record<string, CanvasNode>,
            connections: (parsed.connections || []) as Connection[],
            roomTitle: parsed.roomTitle || defaultTemplate.title,
            pan: parsed.pan || { x: 180, y: 140 },
            zoom: typeof parsed.zoom === 'number' ? parsed.zoom : 0.85,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load saved board from localStorage:', e);
    }

    return {
      nodes: defaultTemplate.nodes,
      connections: defaultTemplate.connections,
      roomTitle: defaultTemplate.title,
      pan: { x: 180, y: 140 },
      zoom: 0.85,
    };
  };

  const [boardData] = useState(() => getInitialBoard());

  const [nodes, setNodes] = useState<Record<string, CanvasNode>>(boardData.nodes);
  const [connections, setConnections] = useState<Connection[]>(boardData.connections);
  const [roomTitle, setRoomTitle] = useState(boardData.roomTitle);

  // Local user guest profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getLocalUser());

  // Connection & Room Security State ('connecting' | 'locked' | 'ready')
  const [connectionState, setConnectionState] = useState<'connecting' | 'locked' | 'ready'>(() => {
    const localPwd = getRoomPassword(roomCode);
    if (localPwd) {
      return isRoomUnlocked(roomCode) ? 'ready' : 'locked';
    }
    return 'connecting';
  });

  // Initial peer discovery & security challenge timer
  useEffect(() => {
    if (connectionState !== 'connecting') return;

    // After 1.2s, if no host challenged us with a password, assume open/unlocked room
    const timer = setTimeout(() => {
      setConnectionState((curr) => (curr === 'connecting' ? 'ready' : curr));
    }, 1200);

    return () => clearTimeout(timer);
  }, [connectionState]);

  // Canvas Viewport State (persisted across reloads, responsive initial zoom for mobile)
  const [pan, setPan] = useState(boardData.pan);
  const [zoom, setZoom] = useState(() => {
    if (boardData.zoom && boardData.zoom !== 1) return boardData.zoom;
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 0.72;
    return 1;
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Synchronize browser URL bar so ?room= is always present when sharing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('room') !== roomCode) {
        url.searchParams.set('room', roomCode);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [roomCode]);

  // Auto-save board state to localStorage to prevent progress loss on accidental refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const payload = {
          nodes,
          connections,
          roomTitle,
          pan,
          zoom,
          lastSaved: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('Could not auto-save to localStorage:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [nodes, connections, roomTitle, pan, zoom, STORAGE_KEY]);

  // Active Tool & Highlighter State
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'connect' | 'highlighter'>('select');
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow');

  // Modals & Drawers
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [activeCrossRef, setActiveCrossRef] = useState<{
    verseRef: string;
    verseNum: number;
    nodeId: string;
  } | null>(null);
  const [activeStrongsWord, setActiveStrongsWord] = useState<string | null>(null);
  const [activeCommentaryRef, setActiveCommentaryRef] = useState<{
    book: string;
    chapter: number;
    verse: number;
    verseText?: string;
  } | null>(null);

  // Undo / Redo History Stack
  const [historyPast, setHistoryPast] = useState<
    Array<{ nodes: Record<string, CanvasNode>; connections: Connection[] }>
  >([]);
  const [historyFuture, setHistoryFuture] = useState<
    Array<{ nodes: Record<string, CanvasNode>; connections: Connection[] }>
  >([]);

  // Small Group Follow & Spotlight State
  const [followingPeerId, setFollowingPeerId] = useState<string | null>(null);
  const [spotlightBanner, setSpotlightBanner] = useState<{
    senderName: string;
    senderColor: string;
    worldCenter: { x: number; y: number };
    zoom: number;
  } | null>(null);

  // Command palette focus node handler
  const handleFocusNode = useCallback((nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return;
    const targetPanX = window.innerWidth / 2 - (node.x + 240) * zoom;
    const targetPanY = window.innerHeight / 2 - (node.y + 180) * zoom;
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
    setSelectedNodeId(nodeId);
  }, [nodes, zoom]);

  // Global listener to open command palette from anywhere
  useEffect(() => {
    const handler = () => setIsCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, []);

  const handleOpenCommentary = useCallback(
    (book: string, chapter: number, verse: number, verseText?: string) => {
      setActiveCommentaryRef({ book, chapter, verse, verseText });
    },
    []
  );

  const handleOpenCommentaryFromToolbar = useCallback(() => {
    // If a scripture node is already on canvas, use it; otherwise default to Romans 8:28
    const scriptureNode = Object.values(nodes).find((n) => n.type === 'scripture') as ScriptureNodeData | undefined;
    if (scriptureNode) {
      setActiveCommentaryRef({
        book: scriptureNode.passage.book,
        chapter: scriptureNode.passage.chapter,
        verse: scriptureNode.passage.startVerse || 1,
        verseText: scriptureNode.passage.verses[0]?.text,
      });
    } else {
      setActiveCommentaryRef({
        book: 'Romans',
        chapter: 8,
        verse: 28,
        verseText: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
      });
    }
  }, [nodes]);

  const handlePinCommentaryAsSticky = useCallback(
    (content: string, author: string, verseRef: string) => {
      const id = `sticky-comm-${Date.now()}`;
      const x = -pan.x + window.innerWidth / 2 - 140;
      const y = -pan.y + window.innerHeight / 2 - 100;

      const newSticky: StickyNoteData = {
        id,
        type: 'sticky',
        x,
        y,
        content,
        color: 'amber',
        author: `${author}`,
        authorColor: '#f59e0b',
        category: 'Interpretation',
        targetVerseRef: verseRef,
      };

      setNodes((prev) => ({ ...prev, [id]: newSticky }));

      // Automatically connect to matching scripture node if available on canvas
      const matchingScripture = Object.values(nodes).find(
        (n) => n.type === 'scripture' && (n as ScriptureNodeData).passage.reference.toLowerCase().includes(verseRef.toLowerCase().split(':')[0])
      ) as ScriptureNodeData | undefined;

      if (matchingScripture) {
        const verseNum = parseInt(verseRef.split(':')[1], 10);
        const newConn: Connection = {
          id: `conn-comm-${Date.now()}`,
          sourceNodeId: matchingScripture.id,
          sourceVerse: !isNaN(verseNum) ? verseNum : undefined,
          targetNodeId: id,
          type: 'inductive_link',
          label: `${author} Note`,
          color: '#f59e0b',
        };
        setConnections((prev) => [...prev, newConn]);
        peerSyncRef.current?.sendConnectionAdd(newConn);
      }

      peerSyncRef.current?.sendNodeAdd(newSticky);
    },
    [pan, nodes]
  );

  // Multiplayer Collaborators State (Real peers connected via BroadcastChannel + simulated bots if enabled)
  const [realPeers, setRealPeers] = useState<Record<string, Collaborator>>({});
  const [isSimulatingCollab, setIsSimulatingCollab] = useState(false);
  const [simulatedPeers, setSimulatedPeers] = useState<Collaborator[]>([]);

  // Toast notifications for collaboration & undo events
  const [toast, setToast] = useState<{
    message: string;
    type?: 'info' | 'success';
    id: number;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const showToast = useCallback(
    (
      message: string,
      type: 'info' | 'success' = 'info',
      actionLabel?: string,
      onAction?: () => void
    ) => {
      setToast({ message, type, id: Date.now(), actionLabel, onAction });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.actionLabel ? 5000 : 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Cryptographic Authentication & Gatekeeping Refs
  const authorizedPeersRef = useRef<Set<string>>(new Set());
  const pendingChallengeRef = useRef<{ challenge: string; senderId: string } | null>(null);
  const authResolveRef = useRef<((success: boolean) => void) | null>(null);
  const lastAttemptedPasswordRef = useRef<string>('');
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  const peerSyncRef = useRef<PeerSyncChannel | null>(null);
  const lastCursorSend = useRef<number>(0);

  // References for current state inside peer callbacks
  const stateRef = useRef({ nodes, connections, roomTitle, currentUser });
  useEffect(() => {
    stateRef.current = { nodes, connections, roomTitle, currentUser };
  }, [nodes, connections, roomTitle, currentUser]);

  // Record a canvas snapshot before structural mutations for Undo/Redo
  const recordSnapshot = useCallback(() => {
    setHistoryPast((prev) => [
      ...prev.slice(-34),
      {
        nodes: stateRef.current.nodes,
        connections: stateRef.current.connections,
      },
    ]);
    setHistoryFuture([]);
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setHistoryFuture((f) => [
        {
          nodes: stateRef.current.nodes,
          connections: stateRef.current.connections,
        },
        ...f.slice(0, 34),
      ]);
      setNodes(previous.nodes);
      setConnections(previous.connections);
      peerSyncRef.current?.sendSyncResponse(
        '*',
        previous.nodes,
        previous.connections,
        stateRef.current.roomTitle
      );
      return prev.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryFuture((prev) => {
      if (prev.length === 0) return prev;
      const nextState = prev[0];
      setHistoryPast((p) => [
        ...p.slice(-34),
        {
          nodes: stateRef.current.nodes,
          connections: stateRef.current.connections,
        },
      ]);
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      peerSyncRef.current?.sendSyncResponse(
        '*',
        nextState.nodes,
        nextState.connections,
        stateRef.current.roomTitle
      );
      return prev.slice(1);
    });
  }, []);

  // Deduplication cache for cross-channel messages (BroadcastChannel + WebRTC)
  const seenMessagesRef = useRef<Set<string>>(new Set());

  // Handle incoming real-time peer messages
  const handlePeerMessage = useCallback(async (msg: PeerMessage) => {
    if (msg.msgId) {
      if (seenMessagesRef.current.has(msg.msgId)) return;
      seenMessagesRef.current.add(msg.msgId);
      if (seenMessagesRef.current.size > 300) {
        const first = seenMessagesRef.current.values().next().value;
        if (first) seenMessagesRef.current.delete(first);
      }
    }

    switch (msg.type) {
      case 'PEER_JOIN': {
        if (msg.user.id === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd) {
          // Room is locked by host: challenge incoming peer first before revealing canvas data
          const challenge = Math.random().toString(36).substring(2) + Date.now().toString(36);
          peerSyncRef.current?.sendAuthChallenge(msg.user.id, challenge);
          break;
        }

        // Unlocked room: admit immediately
        setRealPeers((prev) => ({
          ...prev,
          [msg.user.id]: {
            id: msg.user.id,
            name: msg.user.name,
            avatar: msg.user.avatar,
            color: msg.user.color,
            cursor: { x: 500, y: 300 },
            isOnline: true,
            lastSeen: Date.now(),
            hidden: false,
          },
        }));
        showToast(`${msg.user.name} joined the room`);
        peerSyncRef.current?.sendSyncResponse(
          msg.user.id,
          stateRef.current.nodes,
          stateRef.current.connections,
          stateRef.current.roomTitle
        );
        break;
      }

      case 'AUTH_CHALLENGE': {
        if (msg.targetId && msg.targetId !== stateRef.current.currentUser.id) return;
        pendingChallengeRef.current = { challenge: msg.challenge, senderId: msg.senderId };

        const localPwd = getRoomPassword(roomCode);
        if (localPwd) {
          // If we already possess the room password, respond with proof automatically
          computeAuthProof(msg.challenge, localPwd).then((proof) => {
            peerSyncRef.current?.sendAuthVerify(msg.challenge, proof, msg.senderId);
          });
        } else {
          // Immediately switch full-page view to lock screen (canvas is NOT rendered)
          setConnectionState('locked');
        }
        break;
      }

      case 'AUTH_VERIFY': {
        if (msg.targetId && msg.targetId !== stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (!localPwd) {
          // Room has no password
          authorizedPeersRef.current.add(msg.senderId);
          peerSyncRef.current?.sendAuthSuccess(msg.senderId);
          if (msg.user) {
            setRealPeers((prev) => ({
              ...prev,
              [msg.user!.id]: {
                id: msg.user!.id,
                name: msg.user!.name,
                avatar: msg.user!.avatar,
                color: msg.user!.color,
                cursor: { x: 500, y: 300 },
                isOnline: true,
                lastSeen: Date.now(),
                hidden: false,
              },
            }));
            showToast(`${msg.user.name} joined the room`);
          }
          peerSyncRef.current?.sendSyncResponse(
            msg.senderId,
            stateRef.current.nodes,
            stateRef.current.connections,
            stateRef.current.roomTitle
          );
          return;
        }

        const expectedProof = await computeAuthProof(msg.challenge, localPwd);
        if (msg.proof === expectedProof) {
          authorizedPeersRef.current.add(msg.senderId);
          peerSyncRef.current?.sendAuthSuccess(msg.senderId);
          if (msg.user) {
            setRealPeers((prev) => ({
              ...prev,
              [msg.user!.id]: {
                id: msg.user!.id,
                name: msg.user!.name,
                avatar: msg.user!.avatar,
                color: msg.user!.color,
                cursor: { x: 500, y: 300 },
                isOnline: true,
                lastSeen: Date.now(),
                hidden: false,
              },
            }));
            showToast(`${msg.user.name} joined the room`);
          }
          // Now safely transmit board state
          peerSyncRef.current?.sendSyncResponse(
            msg.senderId,
            stateRef.current.nodes,
            stateRef.current.connections,
            stateRef.current.roomTitle
          );
        } else {
          peerSyncRef.current?.sendAuthFail(msg.senderId, 'Incorrect room password.');
        }
        break;
      }

      case 'AUTH_SUCCESS': {
        if (msg.targetId && msg.targetId !== stateRef.current.currentUser.id) return;
        setAuthErrorMessage(null);
        if (lastAttemptedPasswordRef.current) {
          markRoomUnlocked(roomCode, lastAttemptedPasswordRef.current);
        }
        if (authResolveRef.current) {
          authResolveRef.current(true);
          authResolveRef.current = null;
        }
        setConnectionState('ready');
        peerSyncRef.current?.requestSync();
        break;
      }

      case 'AUTH_FAIL': {
        if (msg.targetId && msg.targetId !== stateRef.current.currentUser.id) return;
        setAuthErrorMessage(msg.error || 'Incorrect room password. Please try again.');
        if (authResolveRef.current) {
          authResolveRef.current(false);
          authResolveRef.current = null;
        }
        setConnectionState('locked');
        break;
      }

      case 'ROOM_LOCK_STATUS': {
        if (msg.isLocked) {
          const localPwd = getRoomPassword(roomCode);
          if (!localPwd && !sessionStorage.getItem(`room_unlocked_${roomCode}`)) {
            setConnectionState('locked');
          }
        } else {
          setConnectionState('ready');
        }
        break;
      }

      case 'PEER_LEAVE': {
        setRealPeers((prev) => {
          const next = { ...prev };
          const peerName = next[msg.userId]?.name;
          delete next[msg.userId];
          for (const key of Object.keys(next)) {
            if (next[key].id === msg.userId) {
              delete next[key];
            }
          }
          if (peerName) {
            showToast(`${peerName} left the room`);
          }
          return next;
        });
        break;
      }

      case 'PEER_HEARTBEAT': {
        if (msg.user.id === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.user.id)) return;

        setRealPeers((prev) => ({
          ...prev,
          [msg.user.id]: {
            id: msg.user.id,
            name: msg.user.name,
            avatar: msg.user.avatar,
            color: msg.user.color,
            cursor: msg.cursor || prev[msg.user.id]?.cursor || { x: 500, y: 300 },
            isOnline: true,
            lastSeen: Date.now(),
            hidden: prev[msg.user.id]?.hidden ?? false,
          },
        }));
        break;
      }

      case 'CURSOR_MOVE': {
        if (msg.userId === stateRef.current.currentUser.id) return;
        setRealPeers((prev) => {
          const peer = prev[msg.userId];
          if (!peer) return prev;
          return {
            ...prev,
            [msg.userId]: {
              ...peer,
              cursor: msg.cursor,
              hidden: false,
              lastSeen: Date.now(),
            },
          };
        });
        break;
      }

      case 'CURSOR_LEAVE': {
        if (msg.userId === stateRef.current.currentUser.id) return;
        setRealPeers((prev) => {
          const peer = prev[msg.userId];
          if (!peer) return prev;
          return {
            ...prev,
            [msg.userId]: {
              ...peer,
              hidden: true,
            },
          };
        });
        break;
      }

      case 'NODE_MOVE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setNodes((prev) => {
          if (!prev[msg.nodeId]) return prev;
          return {
            ...prev,
            [msg.nodeId]: {
              ...prev[msg.nodeId],
              x: msg.x,
              y: msg.y,
            },
          };
        });
        break;
      }

      case 'NODE_ADD': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setNodes((prev) => ({ ...prev, [msg.node.id]: msg.node }));
        break;
      }

      case 'NODE_DELETE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setNodes((prev) => {
          const next = { ...prev };
          delete next[msg.nodeId];
          return next;
        });
        setConnections((prev) =>
          prev.filter((c) => c.sourceNodeId !== msg.nodeId && c.targetNodeId !== msg.nodeId)
        );
        break;
      }

      case 'CONNECTION_ADD': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setConnections((prev) => [...prev.filter((c) => c.id !== msg.connection.id), msg.connection]);
        break;
      }

      case 'CONNECTION_UPDATE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setConnections((prev) =>
          prev.map((c) => (c.id === msg.connection.id ? msg.connection : c))
        );
        break;
      }

      case 'CONNECTION_DELETE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setConnections((prev) => prev.filter((c) => c.id !== msg.connectionId));
        break;
      }

      case 'SPOTLIGHT_SUMMON': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setSpotlightBanner({
          senderName: msg.senderName,
          senderColor: msg.senderColor,
          worldCenter: msg.worldCenter,
          zoom: msg.zoom,
        });
        break;
      }

      case 'HIGHLIGHT_UPDATE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setNodes((prev) => {
          const node = prev[msg.nodeId];
          if (!node || node.type !== 'scripture') return prev;
          const currentHighlights = node.highlights[msg.verseNum] || [];
          return {
            ...prev,
            [msg.nodeId]: {
              ...node,
              highlights: {
                ...node.highlights,
                [msg.verseNum]: [
                  ...currentHighlights,
                  {
                    verseNum: msg.verseNum,
                    text: '',
                    color: msg.color,
                    tag: msg.tag as any,
                    author: msg.author,
                  },
                ],
              },
            },
          };
        });
        break;
      }

      case 'STICKY_UPDATE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setNodes((prev) => {
          const node = prev[msg.nodeId];
          if (!node || node.type !== 'sticky') return prev;
          return {
            ...prev,
            [msg.nodeId]: {
              ...node,
              ...(msg.content !== undefined ? { content: msg.content } : {}),
              ...(msg.category !== undefined ? { category: msg.category } : {}),
              ...(msg.color !== undefined ? { color: msg.color } : {}),
            },
          };
        });
        break;
      }

      case 'PROMPT_ANSWER': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setNodes((prev) => {
          const node = prev[msg.nodeId];
          if (!node || node.type !== 'prompt') return prev;
          return {
            ...prev,
            [msg.nodeId]: {
              ...node,
              answers: [...node.answers, msg.answer],
            },
          };
        });
        break;
      }

      case 'TITLE_UPDATE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) return;

        setRoomTitle(msg.title);
        break;
      }

      case 'SYNC_REQUEST': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        const localPwd = getRoomPassword(roomCode);
        if (localPwd && !authorizedPeersRef.current.has(msg.senderId)) {
          const challenge = Math.random().toString(36).substring(2) + Date.now().toString(36);
          peerSyncRef.current?.sendAuthChallenge(msg.senderId, challenge);
          break;
        }

        peerSyncRef.current?.sendSyncResponse(
          msg.senderId,
          stateRef.current.nodes,
          stateRef.current.connections,
          stateRef.current.roomTitle
        );
        break;
      }

      case 'SYNC_RESPONSE': {
        if (
          msg.targetId === stateRef.current.currentUser.id ||
          (msg.targetId === '*' && msg.senderId !== stateRef.current.currentUser.id)
        ) {
          setNodes(msg.nodes);
          setConnections(msg.connections);
          setRoomTitle(msg.title);
          setConnectionState('ready');
        }
        break;
      }
    }
  }, [roomCode, showToast]);

  // Initialize Real-time PeerSyncChannel
  useEffect(() => {
    const channel = new PeerSyncChannel(roomCode, currentUser, handlePeerMessage);
    peerSyncRef.current = channel;

    // Send initial sync request
    channel.requestSync();

    return () => {
      channel.destroy();
      peerSyncRef.current = null;
    };
  }, [roomCode, currentUser, handlePeerMessage]);

  // Update profile handler
  const handleUpdateCurrentUser = (name: string, color?: string) => {
    const updated = updateLocalUser(name, color);
    setCurrentUser(updated);
  };

  // Submit password handler for UnlockRoomModal
  const handleSubmitPassword = useCallback(async (passwordAttempt: string): Promise<boolean> => {
    lastAttemptedPasswordRef.current = passwordAttempt.trim();
    setAuthErrorMessage(null);

    // If an online host has challenged us via WebRTC:
    if (pendingChallengeRef.current) {
      const challenge = pendingChallengeRef.current.challenge;
      const targetId = pendingChallengeRef.current.senderId;
      const proof = await computeAuthProof(challenge, passwordAttempt.trim());

      return new Promise<boolean>((resolve) => {
        authResolveRef.current = resolve;
        peerSyncRef.current?.sendAuthVerify(challenge, proof, targetId);

        // Fallback timeout after 7 seconds if no response from host
        setTimeout(() => {
          if (authResolveRef.current === resolve) {
            authResolveRef.current = null;
            resolve(false);
            setAuthErrorMessage('Host verification timed out. Please check that the host is online and try again.');
          }
        }, 7000);
      });
    }

    // Local / offline host unlock
    const local = getRoomPassword(roomCode);
    if (!local || local.toLowerCase() === passwordAttempt.trim().toLowerCase()) {
      markRoomUnlocked(roomCode, passwordAttempt.trim());
      setConnectionState('ready');
      return true;
    }

    setAuthErrorMessage('Incorrect password. Please try again.');
    return false;
  }, [roomCode]);

  // Broadcast cursor movements with throttle
  const handleCursorMove = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastCursorSend.current > 40) { // ~25 fps broadcast
      lastCursorSend.current = now;
      peerSyncRef.current?.sendCursor(x, y);
    }
  };

  const handleCursorLeave = useCallback(() => {
    peerSyncRef.current?.sendCursorLeave();
  }, []);

  // Broadcast cursor hide when switching away or window loses focus
  useEffect(() => {
    const handleBlur = () => {
      peerSyncRef.current?.sendCursorLeave();
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Periodically sweep and prune stale peers that missed heartbeats (> 8s)
  useEffect(() => {
    const sweepInterval = setInterval(() => {
      const now = Date.now();
      setRealPeers((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [id, peer] of Object.entries(next)) {
          if (peer.lastSeen && now - peer.lastSeen > 8000) {
            delete next[id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 2500);

    return () => clearInterval(sweepInterval);
  }, []);

  // Bot Small Group Simulation (Solo mode demonstration)
  const handleToggleCollabSimulation = () => {
    if (!isSimulatingCollab) {
      setIsSimulatingCollab(true);
      setSimulatedPeers([
        {
          id: 'sim_1',
          name: 'Sarah M.',
          avatar: 'S',
          color: '#ec4899',
          cursor: { x: 580, y: 340 },
          isOnline: true,
        },
        {
          id: 'sim_2',
          name: 'Pastor Mark',
          avatar: 'M',
          color: '#f59e0b',
          cursor: { x: 920, y: 260 },
          isOnline: true,
        },
        {
          id: 'sim_3',
          name: 'David L.',
          avatar: 'D',
          color: '#10b981',
          cursor: { x: 740, y: 480 },
          isOnline: true,
        },
      ]);
    } else {
      setIsSimulatingCollab(false);
      setSimulatedPeers([]);
    }
  };

  // Bot wander animation
  useEffect(() => {
    if (!isSimulatingCollab || simulatedPeers.length === 0) return;

    const interval = setInterval(() => {
      setSimulatedPeers((prev) =>
        prev.map((c) => {
          const deltaX = (Math.random() - 0.5) * 80;
          const deltaY = (Math.random() - 0.5) * 60;
          return {
            ...c,
            cursor: {
              x: Math.max(120, Math.min(1400, c.cursor.x + deltaX)),
              y: Math.max(100, Math.min(900, c.cursor.y + deltaY)),
            },
          };
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulatingCollab, simulatedPeers.length]);

  // Combined active collaborators
  const activeCollaborators: Collaborator[] = [
    ...Object.values(realPeers),
    ...simulatedPeers,
  ];

  // Follow Peer Mode: Automatically track followed collaborator's cursor
  useEffect(() => {
    if (!followingPeerId) return;
    const targetPeer =
      realPeers[followingPeerId] || simulatedPeers.find((p) => p.id === followingPeerId);
    if (!targetPeer) {
      setFollowingPeerId(null);
      return;
    }
    const targetPanX = window.innerWidth / 2 - targetPeer.cursor.x * zoom;
    const targetPanY = window.innerHeight / 2 - targetPeer.cursor.y * zoom;
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
  }, [followingPeerId, realPeers, simulatedPeers, zoom]);

  // Jump to Peer & Toggle Follow Mode
  const handleJumpToPeer = useCallback(
    (peer: Collaborator) => {
      if (followingPeerId === peer.id) {
        setFollowingPeerId(null);
        showToast(`Stopped following ${peer.name}`);
        return;
      }
      const targetPanX = window.innerWidth / 2 - peer.cursor.x * zoom;
      const targetPanY = window.innerHeight / 2 - peer.cursor.y * zoom;
      setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
      setFollowingPeerId(peer.id);
      showToast(`Following ${peer.name} — click their avatar again to stop`);
    },
    [followingPeerId, zoom, showToast]
  );

  // Broadcast Spotlight Summon ("Gather Group Here")
  const handleGatherGroup = useCallback(() => {
    const worldCenterX = Math.round((window.innerWidth / 2 - pan.x) / zoom);
    const worldCenterY = Math.round((window.innerHeight / 2 - pan.y) / zoom);
    peerSyncRef.current?.sendSpotlightSummon({ x: worldCenterX, y: worldCenterY }, zoom);
    showToast('Spotlight sent — invited group to your current view!', 'success');
  }, [pan, zoom, showToast]);

  // Dynamic Fit / Auto-Center: Frames all canvas nodes comfortably
  const handleCenterCanvas = useCallback(() => {
    const nodeList = Object.values(nodes);
    if (nodeList.length === 0) {
      setPan({ x: 120, y: 60 });
      setZoom(0.85);
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const n of nodeList) {
      const w = n.type === 'scripture' ? 500 : n.type === 'prompt' ? 400 : 260;
      const h = n.type === 'scripture' ? 450 : n.type === 'prompt' ? 300 : 200;
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + w);
      maxY = Math.max(maxY, n.y + h);
    }

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const padding = 80;
    const viewW = window.innerWidth - padding * 2;
    const viewH = window.innerHeight - 70 - padding * 2;

    const fitZoom = Math.min(
      Math.max(Math.min(viewW / (contentW || 1), viewH / (contentH || 1)), 0.4),
      1.1
    );

    const targetPanX = window.innerWidth / 2 - (minX + contentW / 2) * fitZoom;
    const targetPanY = (window.innerHeight + 56) / 2 - (minY + contentH / 2) * fitZoom;

    setZoom(Number(fitZoom.toFixed(2)));
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
  }, [nodes]);

  // 1-Click Tidy & Auto-Arrange Smart Canvas Layout
  const handleTidyCanvas = useCallback(() => {
    const nodeList = Object.values(nodes);
    if (nodeList.length === 0) return;

    recordSnapshot();

    const scriptures = nodeList.filter((n) => n.type === 'scripture');
    const lexicons = nodeList.filter((n) => n.type === 'lexicon');
    const stickies = nodeList.filter((n) => n.type === 'sticky');
    const prompts = nodeList.filter((n) => n.type === 'prompt');
    const others = nodeList.filter(
      (n) => !['scripture', 'lexicon', 'sticky', 'prompt'].includes(n.type)
    );

    const nextNodes: Record<string, CanvasNode> = { ...nodes };

    // 1. Place Lexicon cards in the left column (x = 20)
    let lexY = 120;
    for (const lex of lexicons) {
      nextNodes[lex.id] = { ...lex, x: 20, y: lexY };
      lexY += 290;
    }

    // 2. Place Scripture cards in the central column (x = 380)
    const scriptureX = lexicons.length > 0 ? 380 : 180;
    let scripY = 120;
    for (const scrip of scriptures) {
      nextNodes[scrip.id] = { ...scrip, x: scriptureX, y: scripY };
      const verseCount = (scrip as ScriptureNodeData).passage?.verses?.length || 4;
      const cardH = Math.min(Math.max(180 + verseCount * 45, 280), 540);
      scripY += cardH + 60;
    }

    // 3. Place Sticky Notes to the right of Scripture cards
    const notesStartX = scriptureX + 560;
    let stickyY = 120;
    stickies.forEach((st, idx) => {
      const col = idx % 2;
      const xPos = notesStartX + col * 285;
      const yPos = col === 0 ? stickyY : stickyY;
      nextNodes[st.id] = { ...st, x: xPos, y: yPos };
      if (col === 1 || idx === stickies.length - 1) {
        stickyY += 230;
      }
    });

    // 4. Place Discussion Prompts below or beside Sticky Notes
    let promptY = stickies.length > 0 ? stickyY + 20 : 120;
    for (const pr of prompts) {
      nextNodes[pr.id] = { ...pr, x: notesStartX, y: promptY };
      promptY += 310;
    }

    // 5. Any remaining nodes
    let otherY = promptY;
    for (const ot of others) {
      nextNodes[ot.id] = { ...ot, x: notesStartX, y: otherY };
      otherY += 260;
    }

    setNodes(nextNodes);
    peerSyncRef.current?.sendSyncResponse('*', nextNodes, connections, roomTitle);
    showToast('Canvas tidied into columns', 'success', 'Undo', handleUndo);

    // Frame the newly organized layout
    setTimeout(() => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of Object.values(nextNodes)) {
        const w = n.type === 'scripture' ? 500 : n.type === 'prompt' ? 400 : 260;
        const h = n.type === 'scripture' ? 450 : n.type === 'prompt' ? 300 : 200;
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x + w);
        maxY = Math.max(maxY, n.y + h);
      }
      const contentW = maxX - minX;
      const contentH = maxY - minY;
      const padding = 80;
      const viewW = window.innerWidth - padding * 2;
      const viewH = window.innerHeight - 70 - padding * 2;
      const fitZoom = Math.min(
        Math.max(Math.min(viewW / (contentW || 1), viewH / (contentH || 1)), 0.45),
        1.0
      );
      const targetPanX = window.innerWidth / 2 - (minX + contentW / 2) * fitZoom;
      const targetPanY = (window.innerHeight + 56) / 2 - (minY + contentH / 2) * fitZoom;
      setZoom(Number(fitZoom.toFixed(2)));
      setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
    }, 30);
  }, [nodes, connections, roomTitle, recordSnapshot, showToast, handleUndo]);

  // Global Tool, History & View Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInput) return;

      // Undo / Redo shortcuts (Ctrl+Z, Cmd+Z, Ctrl+Y, Cmd+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Shift+A: Tidy & Auto-Arrange Canvas
      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleTidyCanvas();
        return;
      }

      // ?: Toggle Shortcuts Cheat-Sheet Modal
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'v') {
        setActiveTool('select');
      } else if (key === 'h') {
        setActiveTool('pan');
      } else if (key === 'c') {
        setActiveTool('connect');
      } else if (key === 'f') {
        e.preventDefault();
        handleCenterCanvas();
      } else if (key === '+' || key === '=') {
        e.preventDefault();
        setZoom((z: number) => Math.min(Number((z * 1.15).toFixed(2)), 2.2));
      } else if (key === '-' || key === '_') {
        e.preventDefault();
        setZoom((z: number) => Math.max(Number((z / 1.15).toFixed(2)), 0.35));
      } else if (key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCenterCanvas, handleUndo, handleRedo, handleTidyCanvas]);

  // Node Position Updater
  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes((prev) => {
      if (!prev[nodeId]) return prev;
      return {
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          x,
          y,
        },
      };
    });
    // Broadcast node position
    peerSyncRef.current?.sendNodeMove(nodeId, x, y);
  };

  // Node Deletion (with Undo Snapshot & Toast)
  const handleDeleteNode = (nodeId: string) => {
    recordSnapshot();
    setNodes((prev) => {
      const next = { ...prev };
      delete next[nodeId];
      return next;
    });
    setConnections((prev) =>
      prev.filter((c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId)
    );
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    peerSyncRef.current?.sendNodeDelete(nodeId);
    showToast('Card removed from canvas', 'info', 'Undo', handleUndo);
  };

  // Connection Deletion (with Undo Snapshot & Toast)
  const handleDeleteConnection = (connectionId: string) => {
    recordSnapshot();
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    peerSyncRef.current?.sendConnectionDelete(connectionId);
    showToast('Connection link removed', 'info', 'Undo', handleUndo);
  };

  // Connection Update (Editable Labels, Colors & Types)
  const handleUpdateConnection = (connectionId: string, updates: Partial<Connection>) => {
    recordSnapshot();
    setConnections((prev) =>
      prev.map((c) => {
        if (c.id !== connectionId) return c;
        const updated = { ...c, ...updates };
        peerSyncRef.current?.sendConnectionUpdate(updated);
        return updated;
      })
    );
  };

  // Highlights Updater (supports clean toggling on re-click)
  const handleUpdateHighlights = (
    nodeId: string,
    verseNum: number,
    color: HighlightColor,
    tag?: string
  ) => {
    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'scripture') return prev;

      const currentHighlights = node.highlights[verseNum] || [];
      const hasExactColor = currentHighlights.some((h) => h.color === color);

      let updatedHighlights: any[];
      if (hasExactColor) {
        // Toggle off if clicking the same color
        updatedHighlights = currentHighlights.filter((h) => h.color !== color);
      } else {
        // Replace with new color
        updatedHighlights = [
          {
            verseNum,
            text: '',
            color,
            tag: tag as any,
            author: currentUser.name,
          },
        ];
      }

      const nextHighlightsMap = { ...node.highlights };
      if (updatedHighlights.length === 0) {
        delete nextHighlightsMap[verseNum];
      } else {
        nextHighlightsMap[verseNum] = updatedHighlights;
      }

      return {
        ...prev,
        [nodeId]: {
          ...node,
          highlights: nextHighlightsMap,
        },
      };
    });

    peerSyncRef.current?.sendHighlightUpdate(nodeId, verseNum, color, tag);
  };

  // Sticky Note Content & Category
  const handleUpdateStickyContent = (nodeId: string, content: string) => {
    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'sticky') return prev;
      return { ...prev, [nodeId]: { ...node, content } };
    });
    peerSyncRef.current?.sendStickyUpdate(nodeId, content, undefined);
  };

  const handleUpdateStickyCategory = (nodeId: string, category: any) => {
    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'sticky') return prev;
      return { ...prev, [nodeId]: { ...node, category } };
    });
    peerSyncRef.current?.sendStickyUpdate(nodeId, undefined, category);
  };

  const handleUpdateStickyColor = (nodeId: string, color: StickyNoteData['color']) => {
    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'sticky') return prev;
      return { ...prev, [nodeId]: { ...node, color } };
    });
    peerSyncRef.current?.sendStickyUpdate(nodeId, undefined, undefined, color);
  };

  // Prompt Question Answer
  const handleAddPromptAnswer = (nodeId: string, text: string) => {
    const answer = {
      id: `ans-${Date.now()}`,
      author: currentUser.name,
      text,
      timestamp: 'Just now',
    };

    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'prompt') return prev;
      return {
        ...prev,
        [nodeId]: {
          ...node,
          answers: [...node.answers, answer],
        },
      };
    });

    peerSyncRef.current?.sendPromptAnswer(nodeId, answer);
  };

  // Connect Two Nodes Manually
  const handleConnectNodes = (sourceId: string, targetId: string) => {
    recordSnapshot();
    const newConn: Connection = {
      id: `conn-${Date.now()}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      label: 'Thematic Link',
      type: 'thematic_motif',
      color: '#38bdf8',
    };
    setConnections((prev) => [...prev, newConn]);
    peerSyncRef.current?.sendConnectionAdd(newConn);
  };

  // Add Scripture Passage to Canvas
  const handleAddPassage = async (reference: string, translation: Translation) => {
    const passage = await fetchPassage(reference, translation);
    recordSnapshot();
    const id = `scripture-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: 'scripture',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom) - 240),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom) - 180),
      zIndex: 10,
      passage,
      highlights: {},
    };

    setNodes((prev) => ({ ...prev, [id]: newNode }));
    setSelectedNodeId(id);
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Add Sticky Note
  const handleAddSticky = (color: 'amber' | 'blue' | 'emerald' | 'rose' | 'purple') => {
    recordSnapshot();
    const id = `sticky-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: 'sticky',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom) - 100),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom) - 80),
      zIndex: 15,
      content: '',
      color,
      author: currentUser.name,
      authorColor: currentUser.color,
      category: 'Observation',
    };

    setNodes((prev) => ({ ...prev, [id]: newNode }));
    setSelectedNodeId(id);
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Add Word Study / Lexicon Node
  const handleAddLexicon = (strongs: string) => {
    const entry = LEXICON_DATABASE[strongs];
    if (!entry) return;

    recordSnapshot();
    const id = `lexicon-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: 'lexicon',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom) - 150),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom) - 120),
      zIndex: 12,
      entry,
    };

    setNodes((prev) => ({ ...prev, [id]: newNode }));
    setSelectedNodeId(id);
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Add Socratic Prompt
  const handleAddPrompt = (category: 'Observation' | 'Interpretation' | 'Application') => {
    recordSnapshot();
    const id = `prompt-${Date.now()}`;
    const questions = {
      Observation: 'What repeated phrases, contrasting words, or logical connectives stand out in this text?',
      Interpretation: 'What is the author trying to communicate to their original audience in this specific historical setting?',
      Application: 'How does the truth of this passage call you to think, pray, or live differently this week?',
    };

    const newNode: CanvasNode = {
      id,
      type: 'prompt',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom) - 200),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom) - 120),
      zIndex: 14,
      category,
      question: questions[category],
      answers: [],
    };

    setNodes((prev) => ({ ...prev, [id]: newNode }));
    setSelectedNodeId(id);
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Spawn Cross Reference & Connect on Canvas
  const handleSpawnAndConnect = async (relation: CrossReferenceRelation) => {
    if (!activeCrossRef) return;

    recordSnapshot();
    const sourceNodeId = activeCrossRef.nodeId;
    const sourceNode = nodes[sourceNodeId];
    const sourceVerse = activeCrossRef.verseNum;

    // Helper to extract verse number from reference string (e.g. "Psalm 44:22" -> 22)
    const parseVerseNum = (refStr: string) => {
      const match = refStr.match(/:(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    };

    const isSource = relation.sourceRef.toLowerCase().includes(activeCrossRef.verseRef.toLowerCase());
    const targetRef = isSource ? relation.targetRef : relation.sourceRef;
    const targetVerse = parseVerseNum(targetRef);

    // Look for existing target passage on the canvas
    let targetNodeId = Object.keys(nodes).find((id) => {
      const n = nodes[id];
      if (n.type !== 'scripture') return false;
      const cleanRef = targetRef.toLowerCase();
      const nRef = n.passage.reference.toLowerCase();
      return (
        nRef.includes(cleanRef) ||
        cleanRef.includes(nRef) ||
        (targetVerse !== undefined &&
          n.passage.verses.some((v) => v.verseNum === targetVerse) &&
          nRef.split(' ')[0] === cleanRef.split(' ')[0])
      );
    });

    // If target doesn't exist, fetch & spawn it
    if (!targetNodeId) {
      const passageData = await fetchPassage(targetRef, 'WEB');
      targetNodeId = `scripture-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      // Count existing target connections from this source so multiple spawned cards don't overlap
      const existingConnectedCount = connections.filter((c) => c.sourceNodeId === sourceNodeId).length;

      const spawnX = sourceNode ? sourceNode.x + 580 : 600;
      const staggerY = existingConnectedCount * 280;
      const spawnY = sourceNode ? sourceNode.y + staggerY : 200 + staggerY;

      const newTargetNode: CanvasNode = {
        id: targetNodeId,
        type: 'scripture',
        x: spawnX,
        y: spawnY,
        zIndex: 10,
        passage: passageData,
        highlights: targetVerse ? {
          [targetVerse]: [{
            verseNum: targetVerse,
            text: '',
            color: 'blue',
            tag: 'Observation',
            author: 'Cross-Reference',
          }]
        } : {},
      };

      setNodes((prev) => ({ ...prev, [targetNodeId!]: newTargetNode }));
      peerSyncRef.current?.sendNodeAdd(newTargetNode);
    }

    // Add connecting line WITH exact sourceVerse and targetVerse
    const newConnection: Connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceNodeId: sourceNodeId,
      sourceVerse: sourceVerse,
      targetNodeId: targetNodeId,
      targetVerse: targetVerse,
      label: relation.title,
      type: relation.type,
      description: relation.explanation,
      color: relation.type === 'direct_quote' ? '#38bdf8' : relation.type === 'prophecy_fulfillment' ? '#10b981' : '#f59e0b',
    };

    setConnections((prev) => [...prev, newConnection]);
    peerSyncRef.current?.sendConnectionAdd(newConnection);
  };

  // Add Sticky for Verse
  const handleAddStickyForVerse = (verseRef: string) => {
    const id = `sticky-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: 'sticky',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom)),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom)),
      zIndex: 15,
      content: '',
      color: 'amber',
      author: currentUser.name,
      authorColor: currentUser.color,
      category: 'Observation',
      targetVerseRef: verseRef,
    };
    setNodes((prev) => ({ ...prev, [id]: newNode }));
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Switch Template
  const handleSelectTemplate = (tmpl: StudyTemplate | null) => {
    if (tmpl) {
      setNodes(tmpl.nodes);
      setConnections(tmpl.connections);
      setRoomTitle(tmpl.title);
      setPan({ x: 180, y: 140 });
      setZoom(0.85);
      peerSyncRef.current?.sendTitleUpdate(tmpl.title);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          nodes: tmpl.nodes,
          connections: tmpl.connections,
          roomTitle: tmpl.title,
          pan: { x: 180, y: 140 },
          zoom: 0.85,
          lastSaved: Date.now(),
        }));
      } catch (e) {
        console.warn(e);
      }
    } else {
      setNodes({});
      setConnections([]);
      setRoomTitle('Fresh Scripture Study Canvas');
      peerSyncRef.current?.sendTitleUpdate('Fresh Scripture Study Canvas');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          nodes: {},
          connections: [],
          roomTitle: 'Fresh Scripture Study Canvas',
          pan: { x: 180, y: 140 },
          zoom: 0.85,
          lastSaved: Date.now(),
        }));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleUpdateRoomTitle = (title: string) => {
    setRoomTitle(title);
    peerSyncRef.current?.sendTitleUpdate(title);
  };

  // 1. Connection & Security Verification Screen (Canvas is completely unmounted)
  if (connectionState === 'connecting') {
    return (
      <RoomConnectingScreen
        roomCode={roomCode}
        onEnterDirectly={() => setConnectionState('ready')}
      />
    );
  }

  // 2. Full-Screen Password Protection Gate (Canvas is NOT in the DOM)
  if (connectionState === 'locked') {
    return (
      <RoomLockScreen
        roomCode={roomCode}
        errorMessage={authErrorMessage}
        onSubmitPassword={handleSubmitPassword}
        onUnlocked={() => {
          setConnectionState('ready');
          setAuthErrorMessage(null);
        }}
      />
    );
  }

  // 3. Authorized Canvas View (Only mounted when connectionState === 'ready')
  return (
    <div className="w-screen h-screen relative bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Navigation */}
      <Navbar
        roomTitle={roomTitle}
        onUpdateTitle={handleUpdateRoomTitle}
        collaborators={activeCollaborators}
        currentUser={currentUser}
        roomCode={roomCode}
        zoom={zoom}
        onZoomIn={() => setZoom((z: number) => Math.min(z * 1.15, 2.2))}
        onZoomOut={() => setZoom((z: number) => Math.max(z / 1.15, 0.35))}
        onResetZoom={() => setZoom(1)}
        onCenterCanvas={handleCenterCanvas}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        followingPeerId={followingPeerId}
        onJumpToPeer={handleJumpToPeer}
        onGatherGroup={handleGatherGroup}
      />

      {/* Main Infinite Canvas */}
      <InfiniteCanvas
        nodes={nodes}
        connections={connections}
        zoom={zoom}
        pan={pan}
        activeTool={activeTool}
        activeColor={activeColor}
        selectedNodeId={selectedNodeId}
        onPanChange={(nextPan) => {
          if (followingPeerId) setFollowingPeerId(null);
          setPan(nextPan);
        }}
        onZoomChange={setZoom}
        onSelectNode={setSelectedNodeId}
        onDragStartNode={() => recordSnapshot()}
        onUpdateNodePosition={handleUpdateNodePosition}
        onDeleteNode={handleDeleteNode}
        onDeleteConnection={handleDeleteConnection}
        onUpdateConnection={handleUpdateConnection}
        onUpdateHighlights={handleUpdateHighlights}
        onUpdateStickyContent={handleUpdateStickyContent}
        onUpdateStickyCategory={handleUpdateStickyCategory}
        onUpdateStickyColor={handleUpdateStickyColor}
        onAddPromptAnswer={handleAddPromptAnswer}
        onOpenCrossRefs={(ref, verseNum, nodeId) => {
          let resolvedNodeId = nodeId;
          if (!resolvedNodeId) {
            resolvedNodeId = Object.keys(nodes).find((id) => {
              const n = nodes[id];
              return n.type === 'scripture' && n.passage.verses.some((v) => v.verseNum === verseNum);
            }) || Object.keys(nodes)[0];
          }
          setActiveCrossRef({ verseRef: ref, verseNum, nodeId: resolvedNodeId });
        }}
        onOpenLexicon={(strongs) => setActiveStrongsWord(strongs)}
        onAddStickyForVerse={handleAddStickyForVerse}
        onOpenCommentary={handleOpenCommentary}
        onConnectNodes={handleConnectNodes}
        onCursorMove={handleCursorMove}
        onCursorLeave={handleCursorLeave}
      />

      {/* Floating Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        onAddScripture={() => setIsPassageModalOpen(true)}
        onAddSticky={handleAddSticky}
        onAddLexicon={handleAddLexicon}
        onOpenLexiconDrawer={() => setActiveStrongsWord('G26')}
        onOpenCommentaryDrawer={handleOpenCommentaryFromToolbar}
        onAddPrompt={handleAddPrompt}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onTidyCanvas={handleTidyCanvas}
        onOpenShortcutsHelp={() => setIsShortcutsModalOpen(true)}
      />

      {/* MiniMap in Bottom-Left (hidden on mobile phones to free canvas space) */}
      <div className="hidden sm:block absolute bottom-6 left-6 z-20">
        <MiniMap
          nodes={nodes}
          pan={pan}
          zoom={zoom}
          onPanTo={(x, y) => {
            if (followingPeerId) setFollowingPeerId(null);
            setPan({ x, y });
          }}
        />
      </div>

      {/* Multiplayer Live Cursors (Rendered for real connected peers & simulation) */}
      <PresenceCursors collaborators={activeCollaborators} pan={pan} zoom={zoom} />

      {/* Follow Mode Indicator Banner */}
      {followingPeerId && (
        <div className="fixed top-16 inset-x-0 flex justify-center z-40 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="pointer-events-auto px-4 py-1.5 rounded-full bg-sky-600/95 text-white text-xs font-semibold shadow-2xl border border-sky-400/50 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>
              Following{' '}
              {(realPeers[followingPeerId] || simulatedPeers.find((p) => p.id === followingPeerId))
                ?.name || 'Collaborator'}
            </span>
            <button
              onClick={() => setFollowingPeerId(null)}
              className="px-2 py-0.5 rounded-full bg-sky-900/80 hover:bg-sky-950 text-[11px] text-sky-100 transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Incoming Group Spotlight Summon Banner */}
      {spotlightBanner && (
        <div className="fixed top-16 inset-x-0 flex justify-center z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="pointer-events-auto px-4 py-2 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-slate-100 text-xs font-medium shadow-2xl backdrop-blur-xl flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: spotlightBanner.senderColor }}
            />
            <span>
              <strong className="text-amber-300">{spotlightBanner.senderName}</strong> invited the
              group to view their current passage
            </span>
            <button
              onClick={() => {
                const targetZoom = spotlightBanner.zoom || 0.9;
                const targetPanX = window.innerWidth / 2 - spotlightBanner.worldCenter.x * targetZoom;
                const targetPanY = window.innerHeight / 2 - spotlightBanner.worldCenter.y * targetZoom;
                setZoom(targetZoom);
                setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
                setSpotlightBanner(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors shadow-sm"
            >
              Jump Here
            </button>
            <button
              onClick={() => setSpotlightBanner(null)}
              className="text-slate-400 hover:text-slate-200 px-1"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Pill (with optional Undo action button) */}
      {toast && (
        <div className="fixed top-16 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl text-xs font-medium text-slate-200 backdrop-blur-md flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  setToast(null);
                }}
                className="ml-1 px-2 py-0.5 rounded-md bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                {toast.actionLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <AddPassageModal
        isOpen={isPassageModalOpen}
        onClose={() => setIsPassageModalOpen(false)}
        onAddPassage={handleAddPassage}
      />

      <CrossReferenceDrawer
        isOpen={!!activeCrossRef}
        onClose={() => setActiveCrossRef(null)}
        selectedVerseRef={activeCrossRef?.verseRef || null}
        onSpawnAndConnect={handleSpawnAndConnect}
      />

      <WordLexiconDrawer
        isOpen={!!activeStrongsWord}
        onClose={() => setActiveStrongsWord(null)}
        strongs={activeStrongsWord}
        onPinToCanvas={(entry) => handleAddLexicon(entry.strongs)}
      />

      <CommentaryDrawer
        isOpen={!!activeCommentaryRef}
        onClose={() => setActiveCommentaryRef(null)}
        reference={activeCommentaryRef}
        onPinAsNote={handlePinCommentaryAsSticky}
      />

      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomCode={roomCode}
        currentUser={currentUser}
        onUpdateCurrentUser={handleUpdateCurrentUser}
        isSimulatingCollab={isSimulatingCollab}
        onToggleCollabSimulation={handleToggleCollabSimulation}
        onPasswordChange={(pwd) => {
          peerSyncRef.current?.sendRoomLockStatus(!!pwd);
        }}
        canvasState={{
          nodes,
          connections,
          zoom,
          pan,
          selectedNodeId,
          activeTool,
          roomTitle,
          roomCode,
          collaborators: activeCollaborators,
        }}
      />

      <ExportStudyModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        roomTitle={roomTitle}
        nodes={nodes}
        connections={connections}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        nodes={nodes}
        onFocusNode={handleFocusNode}
        onAddScripture={(ref) => handleAddPassage(ref, 'BSB')}
        onAddLexicon={handleAddLexicon}
        onAddSticky={() => handleAddSticky('amber')}
        onAddPrompt={() => handleAddPrompt('Observation')}
        onOpenCommentary={handleOpenCommentaryFromToolbar}
        onOpenExport={() => setIsExportModalOpen(true)}
        onCenterCanvas={handleCenterCanvas}
        onTidyCanvas={handleTidyCanvas}
        onOpenShortcutsHelp={() => setIsShortcutsModalOpen(true)}
      />

      <ShortcutsHelpModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
};

export default App;
