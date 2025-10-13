import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  description: string;
  reportedBy: string;
}

interface ComplaintMapProps {
  complaints: Complaint[];
  showHeatmap?: boolean;
}

export default function ComplaintMap({ complaints, showHeatmap = false }: ComplaintMapProps) {
  // Create different marker colors for heatmap view
  const getMarkerIcon = (status: string) => {
    if (!showHeatmap) return DefaultIcon;
    
    const color = status === "Resolved" ? "green" : status === "In Progress" ? "orange" : "red";
    return L.icon({
      iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="${color}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.4 12.5 28.5 12.5 28.5S25 20.9 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle fill="white" cx="12.5" cy="12.5" r="5"/></svg>`,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border border-primary/20">
      {/* @ts-expect-error - Leaflet type definitions issue */}
      <MapContainer center={[28.6139, 77.2090]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {complaints.map((complaint) => {
          const MarkerAny = Marker as any;
          return (
            <MarkerAny 
              key={complaint.id} 
              position={[complaint.latitude, complaint.longitude]}
              icon={getMarkerIcon(complaint.status)}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <strong className="font-semibold">{complaint.id}</strong>
                  <p className="text-xs">{complaint.location}</p>
                  <p className="text-xs">{complaint.description}</p>
                  <p className="text-xs">Status: <span className="font-medium">{complaint.status}</span></p>
                  <p className="text-xs text-muted-foreground">By: {complaint.reportedBy}</p>
                </div>
              </Popup>
            </MarkerAny>
          );
        })}
      </MapContainer>
    </div>
  );
}
