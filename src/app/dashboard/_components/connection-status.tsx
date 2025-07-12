/* eslint-disable react/react-in-jsx-scope */
import { useChat } from '../chat/_hooks/use-chat';
import { WifiIcon, WifiOffIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ConnectionStatus() {
  const { isConnected, isLoading } = useChat();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
        <span className="text-xs">Connexion...</span>
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className="flex items-center gap-1"
    >
      {isConnected ? (
        <>
          <WifiIcon className="w-3 h-3" />
          <span className="text-xs">En ligne</span>
        </>
      ) : (
        <>
          <WifiOffIcon className="w-3 h-3" />
          <span className="text-xs">Hors ligne</span>
        </>
      )}
    </Badge>
  );
} 