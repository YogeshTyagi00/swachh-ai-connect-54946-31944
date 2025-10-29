import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";


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

export default function ComplaintHeatmap({ 
  height = "600px", 
  showControls = true 
}: ComplaintHeatmapProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

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
      
      const validComplaints = (data || []).filter(
        c => c.latitude != null && c.longitude != null && 
             !isNaN(Number(c.latitude)) && !isNaN(Number(c.longitude))
      );
      
      setComplaints(validComplaints);
      setError(null);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError("Failed to load map data");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map after DOM is ready
  useEffect(() => {
    // Wait for DOM to be ready with multiple checks
    const timer = setTimeout(() => {
      if (mapRef.current || !containerRef.current || typeof window === 'undefined') {
        return;
      }

      try {
        // Check if Leaflet is available
        if (!L) {
          console.error("Leaflet not loaded");
          setError("Map library not loaded");
          return;
        }

        // Ensure container has dimensions
        const container = containerRef.current;
        if (!container.offsetWidth || !container.offsetHeight) {
          console.error("Container has no dimensions");
          setError("Map container not ready");
          return;
        }

        const map = L.map(container, {
          center: [28.6139, 77.2090],
          zoom: 12,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        setMapReady(true);
        
        // Force map to resize after initialization and again after a delay
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 100);
        
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 500);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Map failed to load, please refresh.");
      }
    }, 200); // Increased delay for lazy-loaded components

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.error("Error removing map:", err);
        }
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Update heatmap and markers
  useEffect(() => {
    if (!mapRef.current || !mapReady || complaints.length === 0) return;

    try {
      // Clear existing layers
      if (heatLayerRef.current) {
        mapRef.current.removeLayer(heatLayerRef.current);
      }
      markersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
      markersRef.current = [];

      // Create heat data
      const heatData = complaints.map((complaint) => {
        const intensity = 
          complaint.priority === "high" ? 1.0 : 
          complaint.priority === "medium" ? 0.6 : 0.3;
        
        return [
          parseFloat(String(complaint.latitude)), 
          parseFloat(String(complaint.longitude)), 
          intensity
        ] as [number, number, number];
      });

      // Add heatmap layer
      if (showHeatmap && typeof (L as any).heatLayer === 'function') {
        heatLayerRef.current = (L as any).heatLayer(heatData, {
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
        }).addTo(mapRef.current);
      }

      // Add markers
      complaints.forEach((complaint) => {
        const lat = parseFloat(String(complaint.latitude));
        const lng = parseFloat(String(complaint.longitude));
        
        if (isNaN(lat) || isNaN(lng)) return;

        const color = complaint.status === "resolved" ? "#22c55e" : 
                     complaint.status === "in_progress" ? "#f59e0b" : "#ef4444";
        
        const icon = L.icon({
          iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="10" fill="${encodeURIComponent(color)}" stroke="white" stroke-width="3"/></svg>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([lat, lng], { icon })
          .bindPopup(`
            <div class="min-w-[200px] space-y-2 p-1">
              <h4 class="font-semibold text-base">${complaint.title}</h4>
              <p class="text-xs text-muted-foreground">${complaint.location_name || ''}</p>
              <p class="text-sm line-clamp-2">${complaint.description}</p>
              <div class="flex gap-2 flex-wrap">
                <span class="text-xs px-2 py-1 rounded-full text-white" style="background-color: ${color}">
                  ${complaint.status.replace("_", " ").toUpperCase()}
                </span>
                <span class="text-xs px-2 py-1 rounded-full text-white bg-blue-600">
                  ${complaint.priority.toUpperCase()}
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                ${new Date(complaint.created_at).toLocaleDateString()}
              </p>
            </div>
          `)
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      });

      // Center map on first complaint
      if (complaints.length > 0) {
        const firstLat = parseFloat(String(complaints[0].latitude));
        const firstLng = parseFloat(String(complaints[0].longitude));
        if (!isNaN(firstLat) && !isNaN(firstLng)) {
          mapRef.current.setView([firstLat, firstLng], 12);
        }
      }
    } catch (err) {
      console.error("Error updating heatmap:", err);
      setError("Failed to update heatmap");
    }
  }, [complaints, showHeatmap, mapReady]);

  // Real-time subscription
  useEffect(() => {
    fetchComplaints();

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

  if (error) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg border border-border bg-card"
        style={{ height }}
      >
        <div className="text-center space-y-2">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-xl font-semibold">Map failed to load</h3>
          <p className="text-muted-foreground">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  if (!complaints.length && !loading) {
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
        ref={containerRef}
        className="rounded-lg overflow-hidden border border-border shadow-lg bg-muted"
        style={{ height, width: "100%" }}
      />

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
