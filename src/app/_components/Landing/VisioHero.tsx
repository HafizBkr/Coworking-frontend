"use client";
import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageCircle,
  MoreHorizontal,
  Volume2,
  ChevronLeft,
  Square,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHost?: boolean;
}

const VideoConferenceComponent: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, ] = useState(true);

  const participants: Participant[] = [
    {
      id: "1",
      name: "Jessica Martinez",
      isHost: true,
      avatar: "/avatars/jessica.jpg",
    },
    {
      id: "2",
      name: "Marcus Williams",
      isMuted: true,
      avatar: "/avatars/marcus.jpg",
    },
  ];

  // const mainSpeaker = participants[0];

  return (
    <div className="py-16 px-8 w-full max-w-7xl mx-auto bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Design Project Initial
            </h1>
            <p className="text-sm text-gray-500">15 Nov 2023</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-orange-500 font-medium">07:32:34</span>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Square className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="flex h-[700px]">
        {/* Main video area */}
        <div className="flex-1 relative bg-gradient-to-br from-orange-50 to-orange-100">
          {/* Main speaker */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl">
                <div className="w-56 h-56 bg-white rounded-full flex items-center justify-center">
                  <div className="text-6xl">👋</div>
                </div>
              </div>

              {/* Speaker info */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">You</span>
              </div>
            </div>

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-2 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-xs font-medium">Recording...</span>
              </div>
            )}

            {/* Subtitle area */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg max-w-md text-center">
              <p className="text-sm">
                Hi team, I hope everyone is doing well today. We have an
                exciting new...
              </p>
            </div>
          </div>

          {/* Control buttons - left side */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3">
            <button className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all transform hover:scale-105">
              <Volume2 className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all transform hover:scale-105">
              <MessageCircle className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-lg transition-all transform hover:scale-105">
              <MoreHorizontal className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 ${
                isMuted
                  ? "bg-red-500 text-white"
                  : "bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700"
              }`}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 ${
                isVideoOff
                  ? "bg-red-500 text-white"
                  : "bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700"
              }`}
            >
              {isVideoOff ? (
                <VideoOff className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </button>
            <button className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all transform hover:scale-105">
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Participants sidebar */}
        <div className="w-64 bg-gray-50 border-l border-gray-200">
          <div className="p-4 space-y-3">
            {participants.slice(0, 2).map((participant, index) => (
              <div key={participant.id} className="relative">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div
                    className="aspect-video flex items-center justify-center relative"
                    style={{
                      backgroundImage: participant.avatar
                        ? `url(${participant.avatar})`
                        : "linear-gradient(135deg, #c7d2fe 0%, #fbc2eb 100%)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Si tu veux garder l’emoji en overlay */}
                    <div className="text-4xl bg-white bg-opacity-60 rounded-full px-2 py-1">
                      {index === 0 ? "👋" : index === 1 ? "👨‍💼" : "👩‍💻"}
                    </div>

                    {/* Mute indicator */}
                    {participant.isMuted && (
                      <div className="absolute bottom-2 left-2 bg-red-500 p-1 rounded-full">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {/* Host indicator */}
                    {participant.isHost && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Host
                      </div>
                    )}

                    {/* Download button */}
                    <button className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 p-1 rounded-full transition-colors">
                      <div className="w-4 h-4 text-white">↓</div>
                    </button>
                  </div>

                  {/* Participant name */}
                  <div className="p-2 text-center">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {participant.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConferenceComponent;
