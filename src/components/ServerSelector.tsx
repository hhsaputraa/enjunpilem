import React from 'react';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';
import { StreamingServer, STREAMING_SERVERS } from '@/services/streaming';
import { cn } from '@/lib/utils';

interface ServerSelectorProps {
  currentServer: StreamingServer;
  onSelectServer: (server: StreamingServer) => void;
  className?: string;
  size?: 'sm' | 'default';
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  currentServer,
  onSelectServer,
  className,
  size = 'default',
}) => {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mr-1">
        <Server className="w-3.5 h-3.5 text-primary" />
        Server Streaming:
      </span>
      {STREAMING_SERVERS.map((srv) => {
        const isActive = currentServer === srv.id;
        return (
          <Button
            key={srv.id}
            variant={isActive ? "default" : "outline"}
            size={size === 'sm' ? "sm" : "default"}
            onClick={() => onSelectServer(srv.id)}
            className={cn(
              "transition-all duration-200 font-medium text-xs rounded-xl",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                : "bg-background/60 hover:bg-muted/80 text-foreground border-border/60"
            )}
          >
            <span className={cn(
              "w-2 h-2 rounded-full mr-2 transition-colors",
              isActive ? "bg-white animate-pulse" : "bg-muted-foreground/40"
            )} />
            {srv.label}
          </Button>
        );
      })}
    </div>
  );
};
