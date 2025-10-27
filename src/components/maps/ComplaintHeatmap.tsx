import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Fix for default marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Complaint {
  id: string;
  title: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
  description: string;
  created_at: string;
}

interface ComplaintHeatmapProps {
  height?: string;
  showControls?: boolean;
}

// Custom status icons
const getStatusIcon = (status: string) => {
  const color = status === "resolved" ? "#22c55e" : status === "in_progress" ? "#f59e0b" : "#ef4444";
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="10" fill="${encodeURIComponent(color)}" stroke="white" stroke-width="3"/></svg>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// HeatLayer component
function HeatLayer({ complaints }: { complaints: Complaint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!complaints.length) return;

    // Create heat data with intensity based on priority
    const heatData = complaints.map((complaint) => {
      const intensity = 
        complaint.priority === "high" ? 1.0 : 
        complaint.priority === "medium" ? 0.6 : 0.3;
      
      return [complaint.latitude, complaint.longitude, intensity];
    });

    // @ts-ignore - leaflet.heat types
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#0000ff',
        0.3: '#00ffff',
        0.5: '#00ff00',
        0.7: '#ffff00',
        1.0: '#ff0000'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, complaints]);

  return null;
}

export default function ComplaintHeatmap({ 
  height = "600px", 
  showControls = true 
}: ComplaintHeatmapProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    fetchComplaints();

    // Real-time subscription
    const channel = supabase
      .channel("complaints-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        () => {
          console.log("Real-time update detected, refreshing complaints...");
          fetchComplaints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setComplaints(data || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500";
      case "in_progress":
        return "bg-orange-500";
      default:
        return "bg-red-500";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-600";
      case "medium":
        return "bg-yellow-600";
      default:
        return "bg-blue-600";
    }
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg border border-border bg-card"
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading heatmap...</p>
        </div>
      </div>
    );
  }

  if (!complaints.length) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg border border-border bg-card"
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <div className="text-6xl">🗺️</div>
          <h3 className="text-xl font-semibold">No data yet</h3>
          <p className="text-muted-foreground max-w-md">
            Once reports come in, you'll see hotspots here.
          </p>
        </div>
      </div>
    );
  }

  // Calculate center based on complaints
  const center: [number, number] = complaints.length > 0
    ? [complaints[0].latitude, complaints[0].longitude]
    : [28.6139, 77.2090];

  return (
    <div className="relative">
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] bg-card border border-border rounded-lg shadow-lg p-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent"
          >
            {showHeatmap ? "Hide Heat Layer" : "Show Heat Layer"}
          </button>
        </div>
      )}
      
      <div 
        className="rounded-lg overflow-hidden border border-border shadow-lg"
        style={{ height }}
      >
        <MapContainer
          // @ts-expect-error - Leaflet type definitions issue
          center={center}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {showHeatmap && <HeatLayer complaints={complaints} />}
          
          {complaints.map((complaint) => {
            const MarkerAny = Marker as any;
            return (
              <MarkerAny
                key={complaint.id}
                position={[complaint.latitude, complaint.longitude]}
                icon={getStatusIcon(complaint.status)}
              >
                <Popup>
                  <div className="min-w-[200px] space-y-2 p-1">
                    <h4 className="font-semibold text-base">{complaint.title}</h4>
                    <p className="text-xs text-muted-foreground">{complaint.location_name}</p>
                    <p className="text-sm line-clamp-2">{complaint.description}</p>
                    
                    <div className="flex gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusBadgeColor(complaint.status)}`}>
                        {complaint.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getPriorityBadgeColor(complaint.priority)}`}>
                        {complaint.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Popup>
              </MarkerAny>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">|</span>
          <span className="font-medium">{complaints.length}</span>
          <span className="text-muted-foreground">total reports</span>
        </div>
      </div>
    </div>
  );
}
