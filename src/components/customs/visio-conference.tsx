/* eslint-disable react/react-in-jsx-scope */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useVideoConference } from "@/app/dashboard/meet/_hooks/use-video-conference"
import { ParticipantVideo } from "@/app/dashboard/meet/_components/participant-video"
import { InviteParticipants } from "@/app/dashboard/meet/_components/invite-participants"
// import { ConnectionDiagnostics } from "@/app/dashboard/meet/_components/connection-diagnostics"
import { EnhancedConnectionDiagnostics } from "@/app/dashboard/meet/_components/enhanced-connection-diagnostics"
import { useRouter } from "next/navigation"
import { useSessionContext } from "@/context/SessionContext"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Phone,
  MessageSquare,
  Users,
  Settings,
  Send,
  ChevronRight,
  ChevronLeft,
  Grid3X3,
  Volume2,
  VolumeX,
  UserPlus,
  Wifi,

} from "lucide-react"

export function VisioConference() {
  const router = useRouter()
  const session = useSessionContext()
  const params = useParams()
  const roomId = params.meetId as string
  const [isSessionChecked, setIsSessionChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [manualConnectNeeded, setManualConnectNeeded] = useState(false)
  const [sessionCheckAttempts, setSessionCheckAttempts] = useState(0)
  
  // Fonction pour rafraîchir la session
  const handleSessionRefresh = async () => {
    if (session?.refreshSession) {
      try {
        toast.info("Rafraîchissement de la session...");
        const refreshed = await session.refreshSession();
        if (refreshed) {
          toast.success("Session rafraîchie avec succès");
          // Garder le mode manuel mais actualiser la session
        } else {
          toast.error("Échec du rafraîchissement de la session");
        }
      } catch (error) {
        console.error("Erreur lors du rafraîchissement de la session:", error);
        toast.error("Erreur lors du rafraîchissement de la session");
      }
    } else {
      toast.error("La fonctionnalité de rafraîchissement de session n'est pas disponible");
    }
  };

  // Vérifier l'état de la session et charger correctement
  useEffect(() => {
    console.log('[VisioConference] MONTÉ avec roomId:', roomId);
    
    const maxCheckAttempts = 10; // Maximum 10 tentatives à intervalle d'une seconde
    
    // Fonction de vérification de session
    const checkSession = () => {
      console.log('[VisioConference] Checking session...', {
        attempt: sessionCheckAttempts + 1,
        hasToken: !!session?.token,
        isLoading: session?.isLoading
      });
      
      // Si la session est en cours de chargement, attendre
      if (session?.isLoading) {
        if (sessionCheckAttempts < maxCheckAttempts) {
          // Attendre et réessayer
          console.log('[VisioConference] Session is loading, waiting...');
          const timer = setTimeout(() => {
            setSessionCheckAttempts(prev => prev + 1);
          }, 1000);
          return () => clearTimeout(timer);
        } else {
          // Trop de tentatives, proposer une connexion manuelle
          console.log('[VisioConference] Session check timeout, offering manual connection');
          setIsLoading(false);
          setManualConnectNeeded(true);
          return undefined;
        }
      }
      
      // La session a fini de charger
      setIsLoading(false);
      
      // Vérifier que l'utilisateur est connecté
      if (!session?.token) {
        console.log('[VisioConference] No valid session found, redirecting to login');
        toast.error('Veuillez vous connecter pour accéder à la réunion');
        router.push(`/auth/signin?redirect=/dashboard/meet/${roomId}`);
        return;
      }
      
      if (!roomId) {
        console.log('[VisioConference] No roomId provided, redirecting to meet page');
        toast.error('ID de réunion manquant');
        router.push('/dashboard/meet');
        return;
      }
      
      // Utiliser la connexion manuelle pour tous les cas afin de résoudre les problèmes de connexion
      setManualConnectNeeded(true); // Cette ligne active toujours la connexion manuelle
      
      setIsSessionChecked(true);
      console.log('[VisioConference] Session checked successfully, roomId:', roomId, 'token:', session.token ? 'présent' : 'absent');
    };
    
    // Premier contrôle
    return checkSession();
  }, [session, roomId, router, sessionCheckAttempts]);

  // Ajouter un effet pour suivre l'état de la session
  useEffect(() => {
    console.log('[VisioConference] Session state change:', { 
      hasToken: !!session?.token,
      isSessionChecked,
      isLoading,
      attempts: sessionCheckAttempts
    });
  }, [session?.token, isSessionChecked, isLoading, sessionCheckAttempts]);

  // Utiliser notre hook de visioconférence seulement quand la session est vérifiée et prête
  const {
    isConnecting,
    isConnected,
    // localStream,
    remoteStreams,
    isMuted,
    isVideoOff,
    isScreenSharing,
    participants,
    messages,
    currentSpeaker,
    toggleAudio,
    toggleVideo,
    toggleScreenSharing,
    leaveConference,
    connect: initiateConnect,
    kickParticipant,
    sendChatMessage,
  } = useVideoConference({
    skipConnect: !isSessionChecked || isLoading || manualConnectNeeded // Ne pas tenter de connexion automatique dans ces cas
  })
  
  // Fonction pour gérer la connexion manuelle
  const handleManualConnect = async () => {
    try {
      if (!session?.token) {
        toast.error('Pas de session disponible. Veuillez vous reconnecter.');
        router.push(`/auth/signin?redirect=/dashboard/meet/${roomId}`);
        return;
      }
      
      // Tenter une connexion manuelle
      console.log('[VisioConference] Manual connection attempt');
      toast.info('Tentative de connexion en cours...');
      
      // Si le hook est initialisé correctement, utiliser sa fonction de connexion
      if (initiateConnect) {
        await initiateConnect();
      } else {
        toast.error('Impossible d\'initialiser la connexion');
      }
      
      setManualConnectNeeded(false);
    } catch (err) {
      console.error('[VisioConference] Manual connection failed:', err);
      toast.error('Échec de la connexion manuelle');
    }
  };

  // États locaux pour l'interface
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"participants" | "chat">("participants")
  const [message, setMessage] = useState("")
  const [viewMode, setViewMode] = useState<"speaker" | "grid">("grid")
  const [isMobile, setIsMobile] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Gérer la sortie de la conférence
  const handleLeaveConference = () => {
    leaveConference()
    router.push("/dashboard/meet")
  }

  // Envoyer un message de chat
  const handleSendMessage = () => {
    if (!message.trim()) return
    
    const sent = sendChatMessage(message.trim())
    if (sent) {
      setMessage("")
    } else {
      toast.error("Impossible d'envoyer le message")
    }
  }

  // Gérer le haut-parleur (pour les flux distants)
  const toggleSpeaker = () => {
    setIsSpeakerOff(!isSpeakerOff)
    remoteStreams.forEach(stream => {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isSpeakerOff
      })
    })
  }

  const getGridCols = () => {
    if (isMobile) return participants.length <= 2 ? "grid-cols-1" : "grid-cols-2"
    return participants.length <= 4 ? "grid-cols-2" : "grid-cols-3"
  }

  // Si erreur de connexion
  // if (error) {
  //   return (
  //     <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100">
  //       <div className="text-red-500 mb-4">
  //         <svg
  //           xmlns="http://www.w3.org/2000/svg"
  //           width="48"
  //           height="48"
  //           viewBox="0 0 24 24"
  //           fill="none"
  //           stroke="currentColor"
  //           strokeWidth="2"
  //           strokeLinecap="round"
  //           strokeLinejoin="round"
  //         >
  //           <circle cx="12" cy="12" r="10" />
  //           <line x1="12" y1="8" x2="12" y2="12" />
  //           <line x1="12" y1="16" x2="12.01" y2="16" />
  //         </svg>
  //       </div>
  //       <h2 className="text-xl font-bold mb-2">Erreur de connexion</h2>
  //       <p className="text-center text-slate-600 mb-6">{error}</p>
  //       <Button onClick={() => router.push("/dashboard/meet")}>
  //         Retour aux réunions
  //       </Button>
  //     </div>
  //   )
  // }

  // Si en cours de chargement de la session ou de connexion
  if (isLoading || isConnecting) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100">
        <div className="animate-spin text-primary mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">
          {isLoading ? "Chargement..." : "Connexion en cours"}
        </h2>
        <p className="text-center text-slate-600 mb-6">
          {isLoading 
            ? "Initialisation de votre session..." 
            : "Nous vous connectons à la salle de conférence..."}
        </p>
        
        {/* Bouton de connexion manuelle si l'attente est trop longue */}
        {(!isLoading && isSessionChecked) && (
          <Button 
            onClick={initiateConnect}
            variant="outline"
            className="mt-4"
          >
            Connexion manuelle
          </Button>
        )}
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header sidebar */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex gap-1">
          <Button
            variant={activeTab === "participants" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("participants")}
            className="rounded-lg text-xs sm:text-sm"
          >
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Participants</span>
            <span className="sm:hidden">({participants.length})</span>
          </Button>
          <Button
            variant={activeTab === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("chat")}
            className="rounded-lg text-xs sm:text-sm"
          >
            <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Chat</span>
            <span className="sm:hidden">({messages.length})</span>
          </Button>
        </div>
        {!isMobile && (
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Contenu sidebar */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "participants" ? (
          <div className="p-3 sm:p-4">
            <div className="mb-4 hidden sm:block">
              <p className="text-sm text-slate-600">{participants.length} participants</p>
            </div>
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                      <AvatarImage src="" alt={participant.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs sm:text-sm">
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                        {participant.name} {participant.id === 'local' && '(Vous)'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            participant.id === currentSpeaker ? "bg-green-500 animate-pulse" : "bg-green-400"
                          }`}
                        />
                        <span className="text-xs text-slate-500">
                          {participant.isMuted 
                            ? 'Muet' 
                            : participant.id === currentSpeaker
                              ? 'En train de parler'
                              : 'En ligne'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.isMuted ? (
                        <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      ) : (
                        <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      )}
                      {participant.role === 'admin' && (
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      )}
                      {participant.id !== 'local' && session?.user?.role === 'owner' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => kickParticipant(participant.id)}
                          title="Exclure"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-3 sm:p-4">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 sm:p-3 rounded-lg max-w-[85%] ${
                      (msg.userId === 'local' || msg.user === "Vous" || msg.userId === session?.user?.id)
                        ? "bg-blue-500 text-white ml-auto" 
                        : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium">{msg.user}</span>
                      <span className={`text-xs ${(msg.userId === 'local' || msg.user === "Vous") ? "text-blue-100" : "text-slate-500"}`}>
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 sm:p-4 border-t bg-slate-50">
              <div className="flex gap-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      handleSendMessage()
                    }
                  }}
                />
                <Button size="sm" disabled={!message.trim()} onClick={handleSendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Afficher un écran de chargement pendant l'initialisation
  if (isLoading) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Chargement de la session...</h2>
          <p className="text-gray-400">Préparation de votre espace de réunion</p>
        </div>
      </div>
    );
  }
  
  // Afficher un écran de connexion manuelle si nécessaire
  if (manualConnectNeeded) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-white mb-4">Connexion à la réunion</h2>
            <p className="text-gray-300 mb-6">
              Une connexion manuelle est nécessaire pour rejoindre cette réunion.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={handleManualConnect} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <span className="animate-spin mr-2">⚙️</span> 
                    Connexion en cours...
                  </>
                ) : (
                  <>Rejoindre la réunion</>
                )}
              </Button>
              
              <Button 
                onClick={handleSessionRefresh} 
                variant="outline" 
                className="w-full border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Rafraîchir ma session
              </Button>
              
              <Button 
                onClick={() => router.push("/dashboard/meet")} 
                variant="ghost" 
                className="w-full text-gray-400 hover:text-white hover:bg-transparent"
              >
                Retour
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4 text-gray-400 hover:text-white"
              onClick={() => setShowDiagnostics(true)}
            >
              <Wifi className="w-4 h-4 mr-2" />
              Diagnostics de connexion
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle>Diagnostics de connexion</DialogTitle>
            </DialogHeader>
            <EnhancedConnectionDiagnostics
              onRetryAction={handleManualConnect}
              isConnected={isConnected}
              isConnecting={isConnecting}
              roomId={roomId}
              token={session?.token||""}
             />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col relative overflow-hidden">
      {/* Header responsive */}
      <div className="absolute top-0 left-0 right-0 z-20 p-2 sm:p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge className={`${isConnected ? "bg-red-500" : "bg-amber-500"} text-white px-2 py-1 text-xs`}>
              {isConnected ? "LIVE" : isConnecting ? "CONNEXION..." : "DÉCONNECTÉ"}
            </Badge>
            <span className="font-medium text-sm sm:text-base">Réunion: {roomId}</span>
            <span className="text-xs sm:text-sm opacity-75 hidden sm:inline">• {participants.length} participants</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 w-8 h-8 sm:w-auto sm:h-auto p-1 sm:p-2"
              onClick={() => setShowInviteModal(true)}
              title="Inviter des participants"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 w-8 h-8 sm:w-auto sm:h-auto p-1 sm:p-2"
              onClick={() => setViewMode(viewMode === "speaker" ? "grid" : "speaker")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 w-8 h-8 sm:w-auto sm:h-auto p-1 sm:p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Zone vidéo principale */}
      <div className="flex-1 relative">
        {viewMode === "speaker" ? (
          <>
            {/* Vidéo principale - Premier participant ou utilisateur local si seul */}
            <div className="absolute inset-0">
              {participants.length > 0 && (
                <ParticipantVideo
                  stream={
                    participants.find((p) => p.id !== 'local')?.stream || 
                    participants.find((p) => p.id === 'local')?.stream
                  }
                  name={
                    participants.find((p) => p.id !== 'local')?.name || 
                    participants.find((p) => p.id === 'local')?.name || 'Participant'
                  }
                  isMuted={
                    participants.find((p) => p.id !== 'local')?.isMuted || 
                    (participants.find((p) => p.id === 'local') ? isMuted : false)
                  }
                  isVideoOff={
                    participants.find((p) => p.id !== 'local')?.isVideoOff ||
                    (participants.find((p) => p.id === 'local') ? isVideoOff : false)
                  }
                  isScreenSharing={
                    participants.find((p) => p.id !== 'local')?.isScreenSharing ||
                    (participants.find((p) => p.id === 'local') ? isScreenSharing : false)
                  }
                  isLocal={!participants.find((p) => p.id !== 'local')}
                  isActive={true}
                  role={
                    participants.find((p) => p.id !== 'local')?.role ||
                    participants.find((p) => p.id === 'local')?.role
                  }
                />
              )}
            </div>

            {/* Miniatures des autres participants */}
            <div className="absolute bottom-16 sm:bottom-20 right-2 sm:right-4 flex flex-col gap-1 sm:gap-2 max-h-64 sm:max-h-96 overflow-y-auto">
              {participants.map((participant, index) => {
                // Dans la vue speaker, ne pas afficher le participant principal dans les miniatures
                const isMainParticipant = (participants.find((p) => p.id !== 'local') && participant.id !== 'local') ||
                                        (!participants.find((p) => p.id !== 'local') && index === 0)
                
                if (isMainParticipant) return null
                
                return (
                  <div key={participant.id} className="w-16 h-12 sm:w-24 sm:h-16">
                    <ParticipantVideo
                      stream={participant.stream}
                      name={participant.name}
                      isMuted={participant.isMuted}
                      isVideoOff={participant.isVideoOff}
                      isScreenSharing={participant.isScreenSharing}
                      isLocal={participant.id === 'local'}
                      role={participant.role}
                    />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          /* Vue grille */
          <div className="absolute inset-0 p-2 sm:p-4 pt-12 sm:pt-20">
            <div className={`grid ${getGridCols()} gap-2 sm:gap-4 h-full`}>
              {participants.map((participant) => (
                <ParticipantVideo
                  key={participant.id}
                  stream={participant.stream}
                  name={participant.name}
                  isMuted={participant.isMuted}
                  isVideoOff={participant.isVideoOff}
                  isScreenSharing={participant.isScreenSharing}
                  isLocal={participant.id === 'local'}
                  isActive={currentSpeaker === participant.id}
                  role={participant.role}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barre de contrôles flottante responsive */}
      <div className="absolute bottom-2 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <Card className="bg-slate-800/90 backdrop-blur-md border-slate-700">
          <CardContent className="p-2 sm:p-3">
            <div className="flex items-center gap-1 sm:gap-3">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size={isMobile ? "default" : "lg"}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200"
                onClick={toggleAudio}
              >
                {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
              </Button>

              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size={isMobile ? "default" : "lg"}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200"
                onClick={toggleVideo}
              >
                {isVideoOff ? (
                  <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>

              {!isMobile && (
                <Button
                  variant={isSpeakerOff ? "destructive" : "secondary"}
                  size="lg"
                  className="rounded-full w-12 h-12 transition-all duration-200"
                  onClick={toggleSpeaker}
                >
                  {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              )}

              <div className="w-px h-6 sm:h-8 bg-slate-600 mx-1 sm:mx-2" />

              <Button
                variant={isScreenSharing ? "default" : "secondary"}
                size={isMobile ? "default" : "lg"}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200"
                onClick={toggleScreenSharing}
              >
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              {/* Mobile: Sheet, Desktop: Sidebar */}
              {isMobile ? (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="secondary"
                      size="default"
                      className="rounded-full w-10 h-10 transition-all duration-200"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:w-80 p-0">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full w-12 h-12 transition-all duration-200"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              )}

              <div className="w-px h-6 sm:h-8 bg-slate-600 mx-1 sm:mx-2" />

              {/* Bouton de diagnostic */}
              <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size={isMobile ? "default" : "lg"}
                    className="rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200"
                    title="Diagnostics de connexion"
                  >
                    <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Diagnostics de la connexion</DialogTitle>
                  </DialogHeader>
                  <EnhancedConnectionDiagnostics
                    roomId={roomId}
                    token={session?.token || ''}
                    isConnected={isConnected}
                    isConnecting={isConnecting}
                    onRetryAction={initiateConnect}
                  />
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                size={isMobile ? "default" : "lg"}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200"
                onClick={handleLeaveConference}
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar desktop uniquement */}
      {!isMobile && (
        <>
          <div
            className={`absolute top-0 right-0 h-full w-80 bg-white transform transition-transform duration-300 ease-in-out z-40 ${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <SidebarContent />
          </div>

          {/* Bouton d'ouverture sidebar quand fermée */}
          {!sidebarOpen && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30 rounded-full w-10 h-10"
              onClick={() => setSidebarOpen(true)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </>
      )}

      {/* Modal d'invitation */}
      <InviteParticipants 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />


    </div>
  )
}
