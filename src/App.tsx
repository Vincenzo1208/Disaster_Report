import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Plus, List, Map as MapIcon, AlertTriangle, Activity } from 'lucide-react';
import { store } from './store';
import { DisasterMap } from './components/Map/DisasterMap';
import { IncidentForm } from './components/IncidentForm/IncidentForm';
import { IncidentList } from './components/IncidentList/IncidentList';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { fetchIncidents } from './store/incidentSlice';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, filteredIncidents } = useSelector((state: RootState) => state.incidents);
  
  const [showForm, setShowForm] = useState(false);
  const [formLocation, setFormLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  useEffect(() => {
    dispatch(fetchIncidents());
  }, [dispatch]);

  
  useEffect(() => {
    if (showForm) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showForm]);

 const handleMapClick = (lat: number, lng: number) => {
  if (isSelectingLocation) {
    setFormLocation({ lat, lng });
    setIsSelectingLocation(false);     // stop selecting
    setShowForm(true);                 
    console.log('Location set:', { lat, lng });
  }
};

 const handleReportIncident = () => {
  setFormLocation(null);            
  setIsSelectingLocation(true);     
  setShowForm(false);               
};

  const handleLocationSelect = () => {
    setIsSelectingLocation(true);
    console.log('Location selection mode activated');
  };

  const handleFormClose = () => {
    setShowForm(false);
    setFormLocation(null);
    setIsSelectingLocation(false);
  };

  const criticalIncidents = filteredIncidents.filter(
    incident => (incident.incidentType === 'Fire' || incident.incidentType === 'Explosion') && 
                incident.severity === 'Critical'
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
     
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200/50 z-20 relative">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Disaster Response Center
                </h1>
                <p className="text-sm text-slate-500 font-medium">Real-time incident monitoring & reporting</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
             
              <div className="hidden sm:flex items-center space-x-4 px-4 py-2 bg-slate-100 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">
                    {filteredIncidents.length} Active
                  </span>
                </div>
                {criticalIncidents.length > 0 && (
                  <div className="flex items-center space-x-2 px-2 py-1 bg-red-100 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-red-700">
                      {criticalIncidents.length} Critical
                    </span>
                  </div>
                )}
              </div>

              
              <button
                onClick={() => setShowMobileList(!showMobileList)}
                className="md:hidden p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 shadow-sm"
              >
                {showMobileList ? <MapIcon className="w-5 h-5 text-slate-700" /> : <List className="w-5 h-5 text-slate-700" />}
              </button>
              
              <button
                onClick={handleReportIncident}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Report Incident</span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </header>

      
      <div className="flex-1 flex overflow-hidden">
        
        <div className={`${
          showMobileList 
            ? 'fixed inset-0 z-30 bg-white' 
            : 'hidden md:flex'
        } md:w-96 flex-col shadow-2xl bg-white/95 backdrop-blur-sm border-r border-slate-200/50`}>
          {showMobileList && (
            <div className="p-6 border-b border-slate-200 md:hidden bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Control Panel</h2>
                <button
                  onClick={() => setShowMobileList(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <MapIcon className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-1/2 border-b border-slate-200/50">
              <FilterPanel />
            </div>
            <div className="h-1/2">
              <IncidentList />
            </div>
          </div>
        </div>

        
        <div className={`flex-1 relative ${showMobileList ? 'hidden md:block' : 'block'}`}>
          <DisasterMap
            onMapClick={handleMapClick}
            clickableMarker={formLocation ? [formLocation.lat, formLocation.lng] : undefined}
            isSelectingLocation={isSelectingLocation}
          />
          
          
          {isSelectingLocation && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-5 h-5" />
                <span className="font-semibold">Click on the map to select location</span>
              </div>
            </div>
          )}
          

          <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50">
            <div className="text-sm text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Legend</div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    
      {showForm && (
  <IncidentForm
    isOpen={showForm}
    onClose={handleFormClose}
    selectedLocation={formLocation}
    onLocationSelect={handleLocationSelect}
    isSelectingLocation={isSelectingLocation}
  />
)}
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;