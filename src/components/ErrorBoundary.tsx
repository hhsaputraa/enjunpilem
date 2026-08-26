import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
    
    // Check if it is a chunk load/dynamic import failure
    const errorMsg = error.message || "";
    const errorName = error.name || "";
    
    const isChunkError = 
      errorName === 'ChunkLoadError' || 
      errorMsg.includes('Loading chunk') || 
      errorMsg.includes('Failed to fetch dynamically imported module');
      
    if (isChunkError) {
      const now = Date.now();
      const lastReload = sessionStorage.getItem('last_chunk_error_reload');
      const lastReloadTime = lastReload ? parseInt(lastReload, 10) : 0;
      
      // Only auto-reload if the last reload was more than 10 seconds ago to prevent loops
      if (now - lastReloadTime > 10000) {
        sessionStorage.setItem('last_chunk_error_reload', now.toString());
        console.warn("Detected dynamic import / chunk load error. Reloading page to fetch latest bundles...");
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    sessionStorage.removeItem('last_chunk_error_reload');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-white font-sans selection:bg-teal-500/30">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.05),transparent_60%)] pointer-events-none" />
          
          <div className="max-w-md w-full p-8 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500" />
            
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/5">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Oops, Terjadi Kesalahan!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Aplikasi mengalami kendala saat memuat halaman ini. Hal ini biasanya terjadi setelah pembaruan sistem.
              </p>
              {this.state.error && (
                <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-left text-muted-foreground max-h-[100px] overflow-y-auto scrollbar-hide select-all">
                  {this.state.error.toString()}
                </div>
              )}
            </div>
            
            <Button
              onClick={this.handleReload}
              className="w-full h-11 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Halaman
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
