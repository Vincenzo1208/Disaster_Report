export interface Incident {
  id: string;
  incidentType: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  latitude: number;
  longitude: number;
  reporterName?: string;
  timestamp: string;
}

export interface IncidentFilters {
  types: string[];
  severities: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
}

export const INCIDENT_TYPES = [
  'Fire',
  'Flood',
  'Earthquake',
  'Hurricane',
  'Tornado',
  'Landslide',
  'Explosion',
  'Chemical Spill',
  'Medical Emergency',
  'Other'
];

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;