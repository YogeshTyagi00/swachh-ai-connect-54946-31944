import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import "leaflet/dist/leaflet.css";

interface Report {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  location_name?: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

function AutoRefresh({ onRefresh }: { onRefresh: () => void }) {
  const map = useMap();

  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  return null;
}

const getSeverityColor = (status: string) => {
  switch (status) {
    case "resolved":
      return "bg-green-500/10 text-green-700";
    case "in-progress":
      return "bg-yellow-500/10 text-yellow-700";
    default:
      return "bg-red-500/10 text-red-700";
  }
};

export default function AdminHeatmap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const fetchReports = async () => {
    try {
      const { data: complaints, error } = await supabase
        .from("complaints" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((complaints as any)?.map((r: any) => r.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles" as any)
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map((profiles as any)?.map((p: any) => [p.user_id, p]) || []);

      const reportsWithProfiles = (complaints as any)?.map((report: any) => ({
        ...report,
        profiles: profileMap.get(report.user_id) || { full_name: "Unknown" }
      })) || [];

      setReports(reportsWithProfiles as Report[]);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

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
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96" />
        </CardContent>
      </Card>
    );
  }

  const defaultCenter: [number, number] = [28.6139, 77.209];
  const mapCenter: [number, number] =
    reports.length > 0
      ? [Number(reports[0].latitude), Number(reports[0].longitude)]
      : defaultCenter;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Interactive Heatmap</CardTitle>
            <CardDescription>
              Live view of all reported waste issues ({reports.length} total)
            </CardDescription>
          </div>
          <Button
            variant={showHeatmap ? "default" : "outline"}
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            {showHeatmap ? "Cluster View" : "Heat View"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] rounded-lg overflow-hidden">
          <MapContainer
            // @ts-ignore - leaflet types issue
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <AutoRefresh onRefresh={fetchReports} />
            {reports.map((report) => {
              const position: [number, number] = [
                Number(report.latitude),
                Number(report.longitude)
              ];

              return (
                <Marker
                  key={report.id}
                  // @ts-ignore - leaflet types issue
                  position={position}
                >
                  <Popup>
                    <div className="space-y-2 min-w-[200px]">
                      <div>
                        <h3 className="font-semibold text-sm">{report.title}</h3>
                        <Badge className={getSeverityColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {report.description}
                      </p>
                      {report.location_name && (
                        <p className="text-xs">
                          <strong>Location:</strong> {report.location_name}
                        </p>
                      )}
                      {report.profiles && (
                        <p className="text-xs">
                          <strong>Reported by:</strong> {report.profiles.full_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Pending ({reports.filter(r => r.status === "pending").length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>In Progress ({reports.filter(r => r.status === "in-progress").length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Resolved ({reports.filter(r => r.status === "resolved").length})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
