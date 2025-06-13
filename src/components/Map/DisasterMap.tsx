import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import L from 'leaflet';
import { RootState, AppDispatch } from '../../store';
import { setSelectedIncident } from '../../store/incidentSlice';
import { Incident } from '../../types/incident';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DisasterMapProps {
  onMapClick?: (lat: number, lng: number) => void;
  center?: [number, number];
  clickableMarker?: [number, number];
  isSelectingLocation?: boolean;
}

const createIncidentIcon = (incident: Incident, isSelected: boolean = false) => {
  const isCritical = (incident.incidentType === 'Fire' || incident.incidentType === 'Explosion') && 
                    incident.severity === 'Critical';
  
  const color = getSeverityColor(incident.severity);
  const size = isSelected ? 32 : isCritical ? 28 : 24;
  const pulse = isCritical ? 'animate-pulse' : '';
  const selectedRing = isSelected ? `
    <div class="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping" 
         style="width: ${size + 8}px; height: ${size + 8}px; margin: -4px;">
    </div>
  ` : '';
  
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${selectedRing}
        <div class="rounded-full border-3 border-white shadow-xl ${pulse} z-10" 
             style="background-color: ${color}; width: ${size}px; height: ${size}px;">
          <div class="w-full h-full rounded-full flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        ${isCritical ? `
          <div class="absolute inset-0 rounded-full animate-ping z-0" 
               style="background-color: ${color}; opacity: 0.4; width: ${size}px; height: ${size}px;">
          </div>
        ` : ''}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
  });
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Critical': return '#DC2626';
    case 'High': return '#F59E0B';
    case 'Medium': return '#2563EB';
    case 'Low': return '#059669';
    default: return '#6B7280';
  }
};

const MapClickHandler: React.FC<{ 
  onMapClick?: (lat: number, lng: number) => void;
  isSelectingLocation?: boolean;
}> = ({ onMapClick, isSelectingLocation }) => {
  useMapEvents({
    click: (e) => {
      console.log('Map click event:', e.latlng, 'isSelectingLocation:', isSelectingLocation);
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

export const DisasterMap: React.FC<DisasterMapProps> = ({ 
  onMapClick, 
  center = [40.7128, -74.0060], 
  clickableMarker,
  isSelectingLocation = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { filteredIncidents, selectedIncident, basemapStyle } = useSelector((state: RootState) => state.incidents);
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (selectedIncident && mapRef.current) {
      mapRef.current.setView([selectedIncident.latitude, selectedIncident.longitude], 14, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedIncident]);

  const getTileLayerUrl = () => {
    return basemapStyle === 'satellite' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  };

  const getTileLayerAttribution = () => {
    return basemapStyle === 'satellite'
      ? '&copy; <a href="https://www.esri.com/">Esri</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  };

  return (
    <div className={`h-full w-full relative ${isSelectingLocation ? 'cursor-crosshair' : ''}`}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          url={getTileLayerUrl()}
          attribution={getTileLayerAttribution()}
        />
        
        <MapClickHandler 
          onMapClick={onMapClick} 
          isSelectingLocation={isSelectingLocation}
        />
        
        {/* Clickable marker for form */}
        {clickableMarker && (
          <Marker 
            position={clickableMarker}
            icon={L.divIcon({
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-xl animate-bounce z-10">
                    <div class="w-full h-full rounded-full flex items-center justify-center">
                      <div class="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div class="absolute inset-0 w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-40"></div>
                </div>
              `,
              className: 'custom-div-icon',
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })}
          />
        )}
        
        {filteredIncidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[incident.latitude, incident.longitude]}
            icon={createIncidentIcon(incident, selectedIncident?.id === incident.id)}
            eventHandlers={{
              click: () => {
                if (!isSelectingLocation) {
                  dispatch(setSelectedIncident(incident));
                }
              },
            }}
          >
            <Popup className="custom-popup">
              <div className="p-4 min-w-[280px] max-w-sm">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-xl text-slate-800">{incident.incidentType}</h3>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                    incident.severity === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' :
                    incident.severity === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                    incident.severity === 'Medium' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-green-100 text-green-800 border-green-200'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-700 leading-relaxed">{incident.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {incident.reporterName && (
                      <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                        <span className="font-semibold text-blue-800">Reporter:</span>
                        <span className="text-blue-700">{incident.reporterName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Location:</span>
                      <span className="font-mono text-slate-600">
                        {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-slate-700">Time:</span>
                      <span className="text-slate-600">
                        {new Date(incident.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-10 flex flex-col space-y-2">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors font-bold text-lg"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-white transition-colors font-bold text-lg"
        >
          −
        </button>
      </div>
    </div>
  );
};