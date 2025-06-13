import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Incident, IncidentFilters } from '../types/incident';

// ✅ Dynamic backend URL from .env (for Vercel and local)
const API_URL = import.meta.env.VITE_BACKEND_URL;

interface IncidentState {
  incidents: Incident[];
  filteredIncidents: Incident[];
  filters: IncidentFilters;
  selectedIncident: Incident | null;
  loading: boolean;
  error: string | null;
  basemapStyle: 'streets' | 'satellite';
}

const initialState: IncidentState = {
  incidents: [],
  filteredIncidents: [],
  filters: {
    types: [],
    severities: [],
    dateRange: {}
  },
  selectedIncident: null,
  loading: false,
  error: null,
  basemapStyle: 'streets'
};

export const fetchIncidents = createAsyncThunk(
  'incidents/fetchIncidents',
  async () => {
    const response = await fetch(`${API_URL}/api/incidents`);
    if (!response.ok) {
      throw new Error('Failed to fetch incidents');
    }
    return response.json();
  }
);

export const createIncident = createAsyncThunk(
  'incidents/createIncident',
  async (incident: Omit<Incident, 'id' | 'timestamp'>) => {
    const response = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incident),
    });
    if (!response.ok) {
      throw new Error('Failed to create incident');
    }
    return response.json();
  }
);

const applyFilters = (incidents: Incident[], filters: IncidentFilters): Incident[] => {
  return incidents.filter(incident => {
    if (filters.types.length > 0 && !filters.types.includes(incident.incidentType)) {
      return false;
    }

    if (filters.severities.length > 0 && !filters.severities.includes(incident.severity)) {
      return false;
    }

    if (filters.dateRange.start || filters.dateRange.end) {
      const incidentDate = new Date(incident.timestamp);
      if (filters.dateRange.start && incidentDate < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && incidentDate > new Date(filters.dateRange.end)) {
        return false;
      }
    }

    return true;
  });
};

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<IncidentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredIncidents = applyFilters(state.incidents, state.filters);
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredIncidents = state.incidents;
    },
    setSelectedIncident: (state, action: PayloadAction<Incident | null>) => {
      state.selectedIncident = action.payload;
    },
    toggleBasemapStyle: (state) => {
      state.basemapStyle = state.basemapStyle === 'streets' ? 'satellite' : 'streets';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = action.payload;
        state.filteredIncidents = applyFilters(action.payload, state.filters);
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch incidents';
      })
      .addCase(createIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents.push(action.payload);
        state.filteredIncidents = applyFilters(state.incidents, state.filters);
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create incident';
      });
  },
});

export const { setFilters, clearFilters, setSelectedIncident, toggleBasemapStyle } = incidentSlice.actions;
export default incidentSlice.reducer;
