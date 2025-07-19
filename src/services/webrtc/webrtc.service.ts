/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from "socket.io-client";

export interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface WebRTCState {
  localStream: MediaStream | null;
  peerConnections: Map<string, PeerConnection>;
  roomId: string | null;
  isConnected: boolean;
}

class WebRTCService {
  private socket: Socket | null = null;
  private state: WebRTCState = {
    localStream: null,
    peerConnections: new Map(),
    roomId: null,
    isConnected: false,
  };
  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { 
        urls: "turn:global.turn.twilio.com:3478?transport=udp",
        username: "f778499bb8c4b9640117e4747c667462b6309b5ec4acb69d96da43478118:1689848477",
        credential: "uEDHG/o2YHPMZEdwo4doL1u8n2Y="
      },
    ],
  };
  private videoConstraints = {
    audio: true,
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
  };
  private onRemoteStreamUpdate: ((streams: Map<string, MediaStream>) => void) | null = null;

  public initialize(socket: Socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("room-joined", (data: { roomId: string; participants: string[] }) => {
      this.state.roomId = data.roomId;
      this.state.isConnected = true;
      
      // Send offer to all existing participants
      data.participants.forEach((participantId) => {
        if (participantId !== this.socket?.id) {
          this.createPeerConnection(participantId, true);
        }
      });
    });

    this.socket.on("user-joined", async (userId: string) => {
      console.log(`User joined: ${userId}`);
      // When a new user joins, wait for their offer
      await this.createPeerConnection(userId, false);
    });

    this.socket.on("user-left", (userId: string) => {
      this.removePeerConnection(userId);
    });

    this.socket.on("offer", async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      const { from, offer } = data;
      console.log(`Received offer from ${from}`);
      
      const peerConnection = this.state.peerConnections.get(from) || 
        await this.createPeerConnection(from, false);
      
      await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.connection.createAnswer();
      await peerConnection.connection.setLocalDescription(answer);
      
      this.socket?.emit("answer", {
        to: from,
        answer,
      });
    });

    this.socket.on("answer", async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      const { from, answer } = data;
      console.log(`Received answer from ${from}`);
      
      const peerConnection = this.state.peerConnections.get(from);
      if (peerConnection) {
        await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    this.socket.on("ice-candidate", async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      const { from, candidate } = data;
      console.log(`Received ICE candidate from ${from}`);
      
      const peerConnection = this.state.peerConnections.get(from);
      if (peerConnection && candidate) {
        await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }

  public async joinRoom(roomId: string): Promise<boolean> {
    if (!this.socket) {
      console.error("Socket not initialized");
      return false;
    }

    try {
      await this.setupLocalStream();
      this.socket.emit("join-room", roomId);
      return true;
    } catch (error) {
      console.error("Failed to join room:", error);
      return false;
    }
  }

  public async setupLocalStream(videoEnabled = true, audioEnabled = true): Promise<MediaStream | null> {
    try {
      if (this.state.localStream) {
        this.stopLocalStream();
      }

      const constraints = {
        audio: audioEnabled,
        video: videoEnabled ? this.videoConstraints.video : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.state.localStream = stream;

      // Update all existing peer connections with the new stream
      this.state.peerConnections.forEach((peer) => {
        this.addLocalStreamToPeer(peer.connection);
      });

      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      return null;
    }
  }

  private addLocalStreamToPeer(peerConnection: RTCPeerConnection): void {
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => {
        if (this.state.localStream) {
          peerConnection.addTrack(track, this.state.localStream);
        }
      });
    }
  }

  public async createPeerConnection(peerId: string, isInitiator: boolean): Promise<PeerConnection> {
    const peerConnection = new RTCPeerConnection(this.configuration);
    
    const peerState: PeerConnection = {
      peerId,
      connection: peerConnection,
    };
    
    this.state.peerConnections.set(peerId, peerState);
    
    // Add local stream tracks to the peer connection
    this.addLocalStreamToPeer(peerConnection);
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket?.emit("ice-candidate", {
          to: peerId,
          candidate: event.candidate,
        });
      }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}: ${peerConnection.connectionState}`);
    };
    
    // Handle receiving remote stream
    peerConnection.ontrack = (event) => {
      console.log(`Received track from ${peerId}`);
      peerState.stream = event.streams[0];
      this.notifyStreamUpdate();
    };
    
    // If we're the initiator, create and send an offer
    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      this.socket?.emit("offer", {
        to: peerId,
        offer,
      });
    }
    
    return peerState;
  }
  
  private notifyStreamUpdate() {
    if (this.onRemoteStreamUpdate) {
      const streams = new Map<string, MediaStream>();
      this.state.peerConnections.forEach((peer) => {
        if (peer.stream) {
          streams.set(peer.peerId, peer.stream);
        }
      });
      this.onRemoteStreamUpdate(streams);
    }
  }
  
  public removePeerConnection(peerId: string) {
    const peer = this.state.peerConnections.get(peerId);
    if (peer) {
      peer.connection.close();
      this.state.peerConnections.delete(peerId);
      this.notifyStreamUpdate();
    }
  }
  
  public leaveRoom() {
    if (this.socket && this.state.roomId) {
      this.socket.emit("leave-room", this.state.roomId);
    }
    
    // Close all peer connections
    this.state.peerConnections.forEach((peer) => {
      peer.connection.close();
    });
    
    this.state.peerConnections.clear();
    this.stopLocalStream();
    this.state.roomId = null;
    this.state.isConnected = false;
  }
  
  public stopLocalStream() {
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.state.localStream = null;
    }
  }
  
  public toggleVideo(enabled: boolean) {
    if (this.state.localStream) {
      this.state.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }
  
  public toggleAudio(enabled: boolean) {
    if (this.state.localStream) {
      this.state.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }
  
  public async startScreenShare(): Promise<boolean> {
    try {
      if (!this.socket || !this.state.roomId) return false;
      
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      
      // Store current video tracks to restore later
      const oldStream = this.state.localStream;
      
      // Replace video tracks in all peer connections
      const videoTrack = stream.getVideoTracks()[0];
      
      this.state.peerConnections.forEach((peer) => {
        const senders = peer.connection.getSenders();
        const videoSender = senders.find((s) => 
          s.track?.kind === "video"
        );
        
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        } else if (oldStream) {
          peer.connection.addTrack(videoTrack, oldStream);
        }
      });
      
      // When screen share ends
      videoTrack.onended = async () => {
        await this.stopScreenShare();
      };
      
      return true;
    } catch (error) {
      console.error("Error starting screen share:", error);
      return false;
    }
  }
  
  public async stopScreenShare(): Promise<void> {
    try {
      // Re-establish the original video stream
      await this.setupLocalStream();
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  }
  
  public setOnRemoteStreamUpdate(callback: (streams: Map<string, MediaStream>) => void) {
    this.onRemoteStreamUpdate = callback;
  }
  
  public getLocalStream(): MediaStream | null {
    return this.state.localStream;
  }
  
  public getRemoteStreams(): Map<string, MediaStream> {
    const streams = new Map<string, MediaStream>();
    this.state.peerConnections.forEach((peer) => {
      if (peer.stream) {
        streams.set(peer.peerId, peer.stream);
      }
    });
    return streams;
  }
  
  public isConnectedToRoom(): boolean {
    return this.state.isConnected && this.state.roomId !== null;
  }

  public async handleOffer(from: string, offer: RTCSessionDescriptionInit): Promise<void> {
    console.log(`[WebRTCService] Handling offer from ${from}`);
    
    // Créer une nouvelle connexion peer si elle n'existe pas
    let peerConnection = this.state.peerConnections.get(from);
    if (!peerConnection) {
      peerConnection = await this.createPeerConnection(from, false);
    }
    
    // Définir la description distante
    await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Créer et envoyer la réponse
    const answer = await peerConnection.connection.createAnswer();
    await peerConnection.connection.setLocalDescription(answer);
    
    // Envoyer la réponse via le service de socket
    this.sendWebRTCMessage('answer', {
      to: from,
      answer
    });
  }

  public async handleAnswer(from: string, answer: RTCSessionDescriptionInit): Promise<void> {
    console.log(`[WebRTCService] Handling answer from ${from}`);
    
    const peerConnection = this.state.peerConnections.get(from);
    if (peerConnection) {
      await peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  public async handleIceCandidate(from: string, candidate: RTCIceCandidateInit): Promise<void> {
    console.log(`[WebRTCService] Handling ICE candidate from ${from}`);
    
    const peerConnection = this.state.peerConnections.get(from);
    if (peerConnection && candidate) {
      await peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private sendWebRTCMessage(type: string, data: any): void {
    // Cette méthode sera remplacée par le hook qui gère les messages
    console.log(`[WebRTCService] Would send ${type}:`, data);
  }

  public setMessageSender(sender: (type: string, data: any) => void): void {
    this.sendWebRTCMessage = sender;
  }
  
  /**
   * Récupérer des informations de diagnostic sur le service WebRTC
   */
  public getDiagnosticInfo(): Record<string, any> {
    // Recueillir les états ICE de tous les pairs
    const iceConnectionStates: Record<string, string> = {};
    const iceCandidatePairs: Record<string, any> = {};
    
    this.state.peerConnections.forEach((peer, peerId) => {
      iceConnectionStates[peerId] = peer.connection.iceConnectionState;
      
      // Tenter de récupérer les statistiques si disponible
      try {
        peer.connection.getStats().then(stats => {
          stats.forEach(report => {
            if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              iceCandidatePairs[peerId] = {
                localCandidate: report.localCandidateId,
                remoteCandidate: report.remoteCandidateId,
                bytesSent: report.bytesSent,
                bytesReceived: report.bytesReceived,
              };
            }
          });
        }).catch(err => console.error('Failed to get stats:', err));
      } catch {
        console.warn('WebRTC stats not supported');
      }
    });
    
    return {
      initialized: this.state.isConnected,
      hasLocalStream: !!this.state.localStream,
      localStreamTracks: this.state.localStream ? {
        audio: this.state.localStream.getAudioTracks().length,
        video: this.state.localStream.getVideoTracks().length,
      } : null,
      peerConnectionsCount: this.state.peerConnections.size,
      peerIds: Array.from(this.state.peerConnections.keys()),
      iceConnectionStates,
      iceCandidatePairs,
      usingTurnServer: false, // À implémenter en analysant les candidats ICE utilisés
    };
  }
  
  /**
   * Obtenir le nombre de connexions de pairs
   */
  public getPeerConnectionsCount(): number {
    return this.state.peerConnections.size;
  }
  
  /**
   * Obtenir les états de connexion ICE
   */
  public getIceConnectionStates(): Record<string, string> {
    const states: Record<string, string> = {};
    this.state.peerConnections.forEach((peer, peerId) => {
      states[peerId] = peer.connection.iceConnectionState;
    });
    return states;
  }
  
}

// Singleton instance
const webRTCService = new WebRTCService();
export default webRTCService;
