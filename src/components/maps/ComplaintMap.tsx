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
}

export default function ComplaintMap({ complaints }: ComplaintMapProps) {
  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border border-primary/20">
      {/* @ts-expect-error - Leaflet type definitions issue */}
      <MapContainer center={[28.6139, 77.2090]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {complaints.map((complaint) => (
          <Marker key={complaint.id} position={[complaint.latitude, complaint.longitude]}>
            <Popup>
              <div className="text-sm space-y-1">
                <strong className="font-semibold">{complaint.id}</strong>
                <p className="text-xs">{complaint.location}</p>
                <p className="text-xs">{complaint.description}</p>
                <p className="text-xs">Status: <span className="font-medium">{complaint.status}</span></p>
                <p className="text-xs text-muted-foreground">By: {complaint.reportedBy}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
