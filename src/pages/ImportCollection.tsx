
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const ImportCollection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const streamlitUrl = "https://collection-film-enjun.streamlit.app/?embedded=true";
  const ALLOWED_USER_ID = import.meta.env.VITE_ALLOWED_ADMIN_ID;
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || user.id !== ALLOWED_USER_ID) {
      navigate("/collections");
    }
  }, [user, loading, navigate, ALLOWED_USER_ID]);

  if (loading || !user || user.id !== ALLOWED_USER_ID) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
       <Loader className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header for the embedded page */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/collections")}
            className="rounded-xl hover:bg-accent text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Import Collection</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              Powered by Streamlit
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/10 rounded-xl"
            onClick={() => window.open(streamlitUrl, "_blank")}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-2" />
            Open Fullsite
          </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-card">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-20">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
              <Loader className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Connecting to Sync Service</h2>
            <p className="text-muted-foreground text-sm">This may take a moment to wake up the server...</p>
          </div>
        )}
        
        <iframe
          src={streamlitUrl}
          className={cn(
            "w-full h-[calc(100vh-64px)] border-none transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          title="Streamlit Collection Importer"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"
        />
      </div>
    </div>
  );
};

export default ImportCollection;
