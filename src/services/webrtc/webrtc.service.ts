/* eslint-disable @typescript-eslint/no-explicit-any */
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
    ],
  };
  private onRemoteStreamUpdate:
    | ((streams: Map<string, MediaStream>) => void)
    | null = null;

  // Fonctions d'envoi de signalisation (injectées par le hook)
  private sendOffer:
    | ((offer: RTCSessionDescriptionInit, to: string) => void)
    | null = null;
  private sendAnswer:
    | ((answer: RTCSessionDescriptionInit, to: string) => void)
    | null = null;
  private sendCandidate:
    | ((candidate: RTCIceCandidateInit, to: string) => void)
    | null = null;

  public initializeSignaling(
    sendOffer: (offer: RTCSessionDescriptionInit, to: string) => void,
    sendAnswer: (answer: RTCSessionDescriptionInit, to: string) => void,
    sendCandidate: (candidate: RTCIceCandidateInit, to: string) => void,
  ) {
    this.sendOffer = sendOffer;
    this.sendAnswer = sendAnswer;
    this.sendCandidate = sendCandidate;
  }

  public async setupLocalStream(
    videoEnabled = true,
    audioEnabled = true,
  ): Promise<MediaStream | null> {
    try {
      if (this.state.localStream) {
        this.stopLocalStream();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioEnabled,
        video: videoEnabled,
      });
      this.state.localStream = stream;
      this.state.peerConnections.forEach((peer) => {
        this.addLocalStreamToPeer(peer.connection);
      });
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      return null;
    }
  }

  public async setupScreenShare(): Promise<MediaStream | null> {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: false,
      });
      // Remplace la vidéo dans tous les peers
      this.state.peerConnections.forEach((peer) => {
        // Retire les anciennes tracks vidéo
        peer.connection.getSenders().forEach((sender) => {
          if (sender.track && sender.track.kind === "video") {
            sender.replaceTrack(stream.getVideoTracks()[0]);
          }
        });
      });
      return stream;
    } catch (error) {
      console.error("Error accessing screen share:", error);
      return null;
    }
  }

  private addLocalStreamToPeer(peerConnection: RTCPeerConnection): void {
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.state.localStream!);
      });
    }
  }

  public async createPeerConnection(peerId: string, isInitiator: boolean) {
    const peerConnection = new RTCPeerConnection(this.configuration);
    const peerState: PeerConnection = {
      peerId,
      connection: peerConnection,
    };
    this.state.peerConnections.set(peerId, peerState);
    this.addLocalStreamToPeer(peerConnection);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.sendCandidate) {
        this.sendCandidate(event.candidate, peerId);
      }
    };
    peerConnection.ontrack = (event) => {
      peerState.stream = event.streams[0];
      this.notifyStreamUpdate();
    };

    if (isInitiator && this.sendOffer) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      this.sendOffer(offer, peerId);
    }
    return peerState;
  }

  public async handleOffer(data: any) {
    const { from, sdp, type } = data;
    let peer = this.state.peerConnections.get(from);
    if (!peer) {
      peer = await this.createPeerConnection(from, false);
    }
    await peer.connection.setRemoteDescription(
      new RTCSessionDescription({ sdp, type }),
    );
    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);
    if (this.sendAnswer) this.sendAnswer(answer, from);
  }

  public async handleAnswer(data: any) {
    const { from, sdp, type } = data;
    const peer = this.state.peerConnections.get(from);
    if (peer) {
      await peer.connection.setRemoteDescription(
        new RTCSessionDescription({ sdp, type }),
      );
    }
  }

  public async handleCandidate(data: any) {
    const { from, candidate, sdpMid, sdpMLineIndex } = data;
    const peer = this.state.peerConnections.get(from);
    if (peer && candidate) {
      await peer.connection.addIceCandidate(
        new RTCIceCandidate({ candidate, sdpMid, sdpMLineIndex }),
      );
    }
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

  public setRemoteStreamUpdateHandler(
    handler: (streams: Map<string, MediaStream>) => void,
  ) {
    this.onRemoteStreamUpdate = handler;
  }

  public stopLocalStream() {
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach((track) => track.stop());
      this.state.localStream = null;
    }
  }
}

const webRTCService = new WebRTCService();
export default webRTCService;
