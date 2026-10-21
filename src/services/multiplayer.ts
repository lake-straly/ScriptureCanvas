import type { 
  UserProfile, 
  PeerMessage, 
  CanvasNode, 
  Connection 
} from '../types';
import { joinRoom } from 'trystero';

const COLORS = [
  '#0284c7', // Sky Blue
  '#10b981', // Emerald Green
  '#f59e0b', // Amber
  '#ec4899', // Pink / Rose
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
];

const DEFAULT_NAMES = [
  'Berean Scholar',
  'Pilgrim',
  'Scripture Reader',
  'Study Fellow',
  'Fellow Traveler',
  'Disciple',
];

export function getLocalUser(): UserProfile {
  // Check URL param first (useful for test windows: ?testPeer=true&guestName=Pastor%20Mark)
  const urlParams = new URLSearchParams(window.location.search);
  const guestNameParam = urlParams.get('guestName');
  const isTestPeer = urlParams.get('testPeer') === 'true';

  const storedId = sessionStorage.getItem('scripture_user_id');
  const storedName = sessionStorage.getItem('scripture_user_name');
  const storedColor = sessionStorage.getItem('scripture_user_color');

  if (storedId && storedName && storedColor && !isTestPeer) {
    return {
      id: storedId,
      name: storedName,
      color: storedColor,
      avatar: storedName.trim().charAt(0).toUpperCase() || 'U',
    };
  }

  // Generate new guest profile
  const id = 'user_' + Math.random().toString(36).substring(2, 9);
  const randomName = guestNameParam 
    ? decodeURIComponent(guestNameParam)
    : DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];
  
  const randomColor = isTestPeer 
    ? '#ec4899' 
    : COLORS[Math.floor(Math.random() * COLORS.length)];

  const profile: UserProfile = {
    id,
    name: randomName,
    color: randomColor,
    avatar: randomName.trim().charAt(0).toUpperCase() || 'U',
  };

  sessionStorage.setItem('scripture_user_id', profile.id);
  sessionStorage.setItem('scripture_user_name', profile.name);
  sessionStorage.setItem('scripture_user_color', profile.color);

  return profile;
}

export function updateLocalUser(name: string, color?: string): UserProfile {
  const current = getLocalUser();
  const updated: UserProfile = {
    ...current,
    name: name.trim() || current.name,
    color: color || current.color,
    avatar: (name.trim() || current.name).charAt(0).toUpperCase(),
  };

  sessionStorage.setItem('scripture_user_name', updated.name);
  sessionStorage.setItem('scripture_user_color', updated.color);
  return updated;
}

// Room Password Handling
export function hashPassword(password: string): string {
  try {
    return btoa(encodeURIComponent(password.trim()));
  } catch {
    return password.trim();
  }
}

export function unhashPassword(hash: string): string | null {
  try {
    return decodeURIComponent(atob(hash));
  } catch {
    return null;
  }
}

export function getRoomPassword(roomCode: string): string | null {
  const local = localStorage.getItem(`room_pwd_${roomCode}`);
  if (local) return local;

  // Check URL query parameters (?pwd=... or ?pwdHash=...)
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search);
    const directPwd = p.get('pwd');
    if (directPwd) {
      return decodeURIComponent(directPwd);
    }
    const pwdHash = p.get('pwdHash');
    if (pwdHash) {
      return unhashPassword(pwdHash);
    }
  }
  return null;
}

export function setRoomPassword(roomCode: string, password: string): void {
  if (!password.trim()) {
    localStorage.removeItem(`room_pwd_${roomCode}`);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('locked');
      url.searchParams.delete('pwdHash');
      url.searchParams.delete('pwd');
      window.history.replaceState({}, '', url.toString());
    }
  } else {
    localStorage.setItem(`room_pwd_${roomCode}`, password.trim());
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('locked', '1');
      url.searchParams.set('pwdHash', hashPassword(password));
      window.history.replaceState({}, '', url.toString());
    }
  }
}

export function isRoomUnlocked(roomCode: string): boolean {
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search);
    const directPwd = p.get('pwd');
    if (directPwd) {
      sessionStorage.setItem(`room_unlocked_${roomCode}`, 'true');
      return true;
    }
  }

  const setPwd = getRoomPassword(roomCode);
  if (!setPwd) {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('locked') === '1') {
        return sessionStorage.getItem(`room_unlocked_${roomCode}`) === 'true';
      }
    }
    return true; // No password required
  }
  return sessionStorage.getItem(`room_unlocked_${roomCode}`) === 'true';
}

export function unlockRoom(roomCode: string, passwordAttempt: string): boolean {
  const setPwd = getRoomPassword(roomCode);
  if (!setPwd || setPwd.toLowerCase() === passwordAttempt.trim().toLowerCase()) {
    sessionStorage.setItem(`room_unlocked_${roomCode}`, 'true');
    return true;
  }
  return false;
}

// Open 2nd window for instant multiplayer verification
export function openTestCollaboratorWindow(roomCode: string): void {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('room', roomCode);
  currentUrl.searchParams.set('testPeer', 'true');
  currentUrl.searchParams.set('guestName', 'Pastor Mark (Peer)');

  window.open(
    currentUrl.toString(),
    '_blank',
    'width=1000,height=750,left=100,top=100'
  );
}

// Real-Time Peer Synchronization Client
export class PeerSyncChannel {
  private channel: BroadcastChannel | null = null;
  private trysteroRoom: any = null;
  private sendTrysteroAction: ((data: PeerMessage) => Promise<any>) | null = null;
  private roomCode: string;
  private localUser: UserProfile;
  private onMessageCallback: (msg: PeerMessage) => void;
  private heartbeatTimer: number | null = null;

  constructor(
    roomCode: string,
    localUser: UserProfile,
    onMessage: (msg: PeerMessage) => void
  ) {
    this.roomCode = roomCode;
    this.localUser = localUser;
    this.onMessageCallback = onMessage;

    // 1. Local same-machine tab synchronization via BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(`scripture_room_${roomCode}`);
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.onMessageCallback(event.data);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel error, falling back to WebRTC:', err);
      }
    }

    // 2. Global cross-device real-time WebRTC mesh across the internet
    if (typeof window !== 'undefined') {
      try {
        const cleanRoomId = `bible-study-${roomCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'general'}`;
        const rtcConfig = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun.cloudflare.com:3478' }
          ]
        };

        this.trysteroRoom = joinRoom({ appId: 'scripture-canvas-p2p', rtcConfig }, cleanRoomId);

        const action = this.trysteroRoom.makeAction('peerMessage');
        this.sendTrysteroAction = (msg: PeerMessage) => action.send(msg);

        action.onMessage = (data: any) => {
          if (data && typeof data === 'object') {
            this.onMessageCallback(data as PeerMessage);
          }
        };

        this.trysteroRoom.onPeerJoin = (peerId: string) => {
          console.log(`[ScriptureCanvas P2P] New remote peer connected: ${peerId}`);
          this.broadcast({
            type: 'PEER_JOIN',
            user: this.localUser,
          });
        };

        this.trysteroRoom.onPeerLeave = (peerId: string) => {
          console.log(`[ScriptureCanvas P2P] Remote peer disconnected: ${peerId}`);
          this.onMessageCallback({
            type: 'PEER_LEAVE',
            userId: peerId,
          });
        };
      } catch (err) {
        console.warn('[ScriptureCanvas P2P] WebRTC room notice:', err);
      }
    }

    // Broadcast join
    this.broadcast({
      type: 'PEER_JOIN',
      user: this.localUser,
    });

    // Send heartbeat every 3 seconds to keep presence alive
    this.heartbeatTimer = window.setInterval(() => {
      this.broadcast({
        type: 'PEER_HEARTBEAT',
        user: this.localUser,
      });
    }, 3000);

    // Broadcast leave on beforeunload
    window.addEventListener('beforeunload', this.handleUnload);
  }

  private handleUnload = () => {
    this.broadcast({
      type: 'PEER_LEAVE',
      userId: this.localUser.id,
    });
  };

  public getRoomCode(): string {
    return this.roomCode;
  }

  public broadcast(msg: PeerMessage): void {
    if (!msg.msgId) {
      msg.msgId = `${this.localUser.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // Local BroadcastChannel (0ms latency for tabs on same computer)
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('Failed to broadcast message locally:', e);
      }
    }

    // WebRTC P2P DataChannel mesh across internet devices
    if (this.sendTrysteroAction) {
      try {
        this.sendTrysteroAction(msg);
      } catch {
        // fail gracefully if peer disconnected
      }
    }
  }

  public sendCursor(x: number, y: number): void {
    this.broadcast({
      type: 'CURSOR_MOVE',
      userId: this.localUser.id,
      cursor: { x, y },
    });
  }

  public sendNodeMove(nodeId: string, x: number, y: number): void {
    this.broadcast({
      type: 'NODE_MOVE',
      nodeId,
      x,
      y,
      senderId: this.localUser.id,
    });
  }

  public sendNodeAdd(node: CanvasNode): void {
    this.broadcast({
      type: 'NODE_ADD',
      node,
      senderId: this.localUser.id,
    });
  }

  public sendNodeDelete(nodeId: string): void {
    this.broadcast({
      type: 'NODE_DELETE',
      nodeId,
      senderId: this.localUser.id,
    });
  }

  public sendConnectionAdd(connection: Connection): void {
    this.broadcast({
      type: 'CONNECTION_ADD',
      connection,
      senderId: this.localUser.id,
    });
  }

  public sendConnectionDelete(connectionId: string): void {
    this.broadcast({
      type: 'CONNECTION_DELETE',
      connectionId,
      senderId: this.localUser.id,
    });
  }

  public sendHighlightUpdate(nodeId: string, verseNum: number, color: any, tag?: string): void {
    this.broadcast({
      type: 'HIGHLIGHT_UPDATE',
      nodeId,
      verseNum,
      color,
      tag,
      author: this.localUser.name,
      senderId: this.localUser.id,
    });
  }

  public sendStickyUpdate(nodeId: string, content?: string, category?: any): void {
    this.broadcast({
      type: 'STICKY_UPDATE',
      nodeId,
      content,
      category,
      senderId: this.localUser.id,
    });
  }

  public sendPromptAnswer(nodeId: string, answer: { id: string; author: string; text: string; timestamp: string }): void {
    this.broadcast({
      type: 'PROMPT_ANSWER',
      nodeId,
      answer,
      senderId: this.localUser.id,
    });
  }

  public sendTitleUpdate(title: string): void {
    this.broadcast({
      type: 'TITLE_UPDATE',
      title,
      senderId: this.localUser.id,
    });
  }

  public requestSync(): void {
    this.broadcast({
      type: 'SYNC_REQUEST',
      senderId: this.localUser.id,
    });
  }

  public sendSyncResponse(
    targetId: string, 
    nodes: Record<string, CanvasNode>, 
    connections: Connection[], 
    title: string
  ): void {
    this.broadcast({
      type: 'SYNC_RESPONSE',
      targetId,
      nodes,
      connections,
      title,
      senderId: this.localUser.id,
    });
  }

  public destroy(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.handleUnload();
    window.removeEventListener('beforeunload', this.handleUnload);
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.trysteroRoom) {
      try {
        this.trysteroRoom.leave();
      } catch {
        // ignore
      }
      this.trysteroRoom = null;
      this.sendTrysteroAction = null;
    }
  }
}
