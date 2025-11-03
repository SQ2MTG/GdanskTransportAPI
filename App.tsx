
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle, RoutesApiResponse, RawVehicle, ApiResponse } from './types';

// The original API endpoints are blocked by CORS policy.
// We use a CORS proxy to bypass this browser limitation.
const PROXY_URL = 'https://api.allorigins.win/raw?url=';
const VEHICLES_API_URL = `${PROXY_URL}${encodeURIComponent('https://ckan2.multimediagdansk.pl/gpsPositions?v=2')}`;
const ROUTES_API_URL = `${PROXY_URL}${encodeURIComponent('https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/22313c56-5acf-41c7-a5fd-dc5dc72b3851/download/routes.json')}`;


const GDANSK_CENTER: L.LatLngExpression = [54.372158, 18.638306];
const REFRESH_INTERVAL = 5000; // 5 seconds
const DELAY_THRESHOLD_SECONDS = 120; // 2 minutes

// --- Helper Types ---
type IconShape = 'vehicle' | 'dot' | 'pin';
type VehicleTypeFilter = 'ALL' | 'BUS' | 'TRAM';
type DelayFilter = 'ALL' | 'ON_TIME' | 'DELAYED';

interface Settings {
  busColor: string;
  tramColor: string;
  busIconShape: IconShape;
  tramIconShape: IconShape;
  isDarkMode: boolean;
}

interface Filters {
    line: string;
    type: VehicleTypeFilter;
    delay: DelayFilter;
}

// Helper function to fetch data with retries on server errors
const fetchWithRetry = async (url: string, retries = 2, delay = 500): Promise<Response> => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) {
        return response;
      }
      console.warn(`Attempt ${i + 1} for ${url} failed with server error: ${response.status}. Retrying...`);
    } catch (error) {
      console.warn(`Attempt ${i + 1} for ${url} failed with a network error. Retrying...`, error);
    }
    
    if (i < retries) {
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error(`Failed to fetch from ${url} after ${retries + 1} attempts.`);
};


// --- Helper Components ---
interface VehicleMarkerProps {
  vehicle: Vehicle;
  color: string;
  iconShape: IconShape;
}

const VehicleMarker: React.FC<VehicleMarkerProps> = ({ vehicle, color, iconShape }) => {
  const icon = useMemo(() => {
    const isTram = vehicle.vehicleType === 'TRAM';
    let svg: string;
    let iconSize: L.PointExpression;

    const shadowFilter = `filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));`;

    switch (iconShape) {
      case 'dot':
        const line = vehicle.routeShortName;
        const fontSize = line.length > 2 ? '10px' : line.length > 1 ? '12px' : '14px';
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="26" height="26" style="${shadowFilter}">
            <circle cx="12" cy="12" r="11" stroke="white" stroke-width="1.5" />
            <text x="12" y="12" dominant-baseline="central" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="bold" font-family="sans-serif">
              ${line}
            </text>
          </svg>`;
        iconSize = [26, 26];
        break;
      
      case 'pin':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="30" height="30" style="${shadowFilter}">
            <path d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
          </svg>`;
        iconSize = [30, 30];
        break;

      case 'vehicle':
      default:
        if (isTram) {
          svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 12" fill="${color}" width="40" height="12" style="${shadowFilter}">
              <rect x="0" y="0" width="19" height="12" rx="3" />
              <rect x="21" y="0" width="19" height="12" rx="3" />
              <rect x="18" y="4" width="4" height="4" fill="rgba(0,0,0,0.4)" rx="1"/>
            </svg>`;
          iconSize = [40, 12];
        } else {
          svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 14" fill="${color}" width="30" height="14" style="${shadowFilter}">
              <rect x="0" y="0" width="30" height="14" rx="3" />
              <rect x="3" y="2" width="24" height="10" fill="rgba(255,255,255,0.4)" rx="2" />
            </svg>`;
          iconSize = [30, 14];
        }
        break;
    }

    const iconHtml = `
      <div style="transform-origin: center; transform: rotate(${vehicle.bearing}deg); transition: transform 0.5s linear;">
        ${svg}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
      popupAnchor: [0, -iconSize[1] / 2],
    });
  }, [vehicle.bearing, vehicle.vehicleType, color, iconShape, vehicle.routeShortName]);

  const delayInMinutes = Math.round(vehicle.delay / 60);
  const delayText =
    delayInMinutes > 0
      ? `${delayInMinutes} min opóźnienia`
      : delayInMinutes < 0
      ? `${-delayInMinutes} min przyspieszenia`
      : 'punktualnie';
  const delayColor =
    delayInMinutes > 2 ? 'text-red-500' : delayInMinutes < -2 ? 'text-green-500' : 'text-gray-700 dark:text-gray-400';

  return (
    <Marker position={[vehicle.lat, vehicle.lon]} icon={icon}>
      <Popup>
        <div className="font-sans text-gray-800 dark:text-gray-300">
          <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
            {vehicle.vehicleType === 'TRAM' ? 'Tramwaj' : 'Autobus'} Linii: {vehicle.routeShortName}
          </h3>
          <p>
            <span className="font-semibold">Kierunek:</span> {vehicle.headsign}
          </p>
          <p>
            <span className="font-semibold">Pojazd:</span> {vehicle.vehicleCode}
          </p>
          <p>
            <span className="font-semibold">Prędkość:</span> {vehicle.speed} km/h
          </p>
          <p className={delayColor}>
            <span className="font-semibold">Status:</span> {delayText}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routeInfo, setRouteInfo] = useState<Map<string, 'BUS' | 'TRAM'>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  const [filters, setFilters] = useState<Filters>({
    line: '',
    type: 'ALL',
    delay: 'ALL',
  });

  const defaultSettings: Settings = {
    busColor: '#2563EB',
    tramColor: '#DC2626',
    busIconShape: 'dot',
    tramIconShape: 'dot',
    isDarkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
  };

  const loadSettings = (): Settings => {
    try {
      const savedSettings = localStorage.getItem('gdanskTransportMapSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Ensure isDarkMode is a boolean
        if (typeof parsed.isDarkMode !== 'boolean') {
          parsed.isDarkMode = defaultSettings.isDarkMode;
        }
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error("Could not load settings from localStorage", error);
    }
    return defaultSettings;
  };
  
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('gdanskTransportMapSettings', JSON.stringify(settings));
    } catch (error) {
      console.error("Could not save settings to localStorage", error);
    }
    
    const root = window.document.documentElement;
    if (settings.isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    const fetchRouteInfo = async () => {
      try {
        const response = await fetchWithRetry(ROUTES_API_URL);
        if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);
        
        const data: RoutesApiResponse = await response.json();
        const routes = Object.values(data)[0]?.routes;
        if (!routes) throw new Error("Nieprawidłowy format danych o liniach.");

        const newRouteInfo = new Map<string, 'BUS' | 'TRAM'>();
        for (const route of routes) {
           if (route && route.routeShortName) {
            const isTram = /^\d{1,2}$/.test(route.routeShortName);
            const vehicleType = isTram ? 'TRAM' : 'BUS';
            newRouteInfo.set(route.routeShortName, vehicleType);
          }
        }
        setRouteInfo(newRouteInfo);
      } catch (error) {
        console.error("Błąd krytyczny podczas pobierania informacji o liniach:", error);
        setInitError("Nie można załadować kluczowych informacji o liniach. Odśwież stronę, aby spróbować ponownie.");
        setIsLoading(false);
      }
    };
    fetchRouteInfo();
  }, []);

  const fetchVehicles = useCallback(async () => {
    if (routeInfo.size === 0) return;

    if (isInitialLoad.current) {
      setIsLoading(true);
    }
    
    try {
      const response = await fetchWithRetry(VEHICLES_API_URL);
      const data: ApiResponse = await response.json();
      
      const enrichedVehicles: Vehicle[] = data.vehicles.map((v: RawVehicle) => ({
        ...v,
        vehicleType: routeInfo.get(v.routeShortName) || 'BUS',
      }));

      setVehicles(enrichedVehicles);
      if (data.lastUpdate) {
        setLastUpdate(data.lastUpdate);
      }
      setApiError(null);
    } catch (error) {
      console.error("Błąd pobierania danych o pojazdach:", error);
      setApiError("Wystąpił problem podczas aktualizacji pozycji pojazdów.");
    } finally {
      if (isInitialLoad.current) {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    }
  }, [routeInfo]);

  useEffect(() => {
    if (routeInfo.size > 0 && !initError) {
      fetchVehicles();
      const intervalId = setInterval(fetchVehicles, REFRESH_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [fetchVehicles, routeInfo.size, initError]);

  const handleSettingsChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({...prev, [key]: value}));
  }

  const filteredVehicles = useMemo(() => {
    const lines = filters.line
      .split(',')
      .map(l => l.trim().toUpperCase())
      .filter(l => l !== '');

    return vehicles
      .filter(v => {
        if (filters.type === 'ALL') return true;
        return v.vehicleType === filters.type;
      })
      .filter(v => {
        if (filters.delay === 'ALL') return true;
        const isDelayed = v.delay > DELAY_THRESHOLD_SECONDS;
        return filters.delay === 'DELAYED' ? isDelayed : !isDelayed;
      })
      .filter(v => {
        if (lines.length === 0) return true;
        return lines.includes(v.routeShortName.toUpperCase());
      });
  }, [vehicles, filters]);

  const tramCount = useMemo(() => filteredVehicles.filter(v => v.vehicleType === 'TRAM').length, [filteredVehicles]);
  const busCount = useMemo(() => filteredVehicles.filter(v => v.vehicleType === 'BUS').length, [filteredVehicles]);

  const FilterButton = ({
    label,
    value,
    currentValue,
    onClick,
  }: {
    label: string;
    value: any;
    currentValue: any;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded transition-colors ${
        currentValue === value 
        ? 'bg-blue-600 text-white font-bold' 
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative h-screen w-screen bg-white dark:bg-gray-900">
      <header className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-white/80 dark:bg-black/70 backdrop-blur-sm text-gray-800 dark:text-white shadow-lg flex flex-col gap-2">
        <div className="relative flex justify-center items-center flex-wrap gap-2 md:justify-end">
          <div className="text-center md:absolute md:left-1/2 md:-translate-x-1/2">
              <h1 className="text-xl md:text-2xl font-bold">Gdańsk Transport na Żywo</h1>
              {lastUpdate && !isLoading && (
                <p className="text-xs text-gray-600 dark:text-gray-300">Ostatnia aktualizacja: {lastUpdate}</p>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm md:text-base">
               {apiError && (
                <span className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400" title={apiError}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.22 3.008-1.742 3.008H4.42c-1.522 0-2.492-1.674-1.742-3.008l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 001 1h.01a1 1 0 100-2H10a1 1 0 00-1 1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden md:inline">Problem z danymi</span>
                </span>
               )}
               <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: settings.busColor, border: '2px solid rgba(150,150,150,0.7)' }}></div>
                Autobusy: <span className="font-bold">{busCount}</span>
              </span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: settings.tramColor, border: '2px solid rgba(150,150,150,0.7)' }}></div>
                Tramwaje: <span className="font-bold">{tramCount}</span>
              </span>
              <button
                onClick={() => handleSettingsChange('isDarkMode', !settings.isDarkMode)}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Zmień motyw"
              >
                {settings.isDarkMode ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 10.607a1 1 0 011.414 0l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" /></svg>
                )}
              </button>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Dostosuj ikony"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mt-2 flex flex-wrap gap-x-4 gap-y-2 items-center justify-center text-sm">
           <div className="flex items-center gap-2">
            <label htmlFor="lineFilter" className="font-medium">Linia:</label>
            <input
              id="lineFilter"
              type="text"
              value={filters.line}
              onChange={(e) => handleFilterChange('line', e.target.value)}
              placeholder="np. 2, 115, N1"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-1 w-32 border-gray-300 dark:border-gray-600 border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Typ:</span>
            <FilterButton label="Wszystkie" value="ALL" currentValue={filters.type} onClick={() => handleFilterChange('type', 'ALL')} />
            <FilterButton label="Autobusy" value="BUS" currentValue={filters.type} onClick={() => handleFilterChange('type', 'BUS')} />
            <FilterButton label="Tramwaje" value="TRAM" currentValue={filters.type} onClick={() => handleFilterChange('type', 'TRAM')} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <FilterButton label="Wszystkie" value="ALL" currentValue={filters.delay} onClick={() => handleFilterChange('delay', 'ALL')} />
            <FilterButton label="Na czas" value="ON_TIME" currentValue={filters.delay} onClick={() => handleFilterChange('delay', 'ON_TIME')} />
            <FilterButton label="Opóźnione" value="DELAYED" currentValue={filters.delay} onClick={() => handleFilterChange('delay', 'DELAYED')} />
          </div>
        </div>

        {isSettingsOpen && (
           <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg mt-2 flex flex-wrap gap-4 items-center justify-center text-sm">
              <div className="flex items-center gap-2">
                <label htmlFor="busColor">Kolor Autobusu:</label>
                <input type="color" id="busColor" value={settings.busColor} onChange={(e) => handleSettingsChange('busColor', e.target.value)} className="w-8 h-8 p-0 border-0 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="busIcon">Ikona Autobusu:</label>
                <select id="busIcon" value={settings.busIconShape} onChange={(e) => handleSettingsChange('busIconShape', e.target.value as IconShape)} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-1">
                  <option value="dot">Kropka</option>
                  <option value="vehicle">Pojazd</option>
                  <option value="pin">Pinezka</option>
                </select>
              </div>
              <div className="border-l border-gray-400 dark:border-gray-600 h-8 mx-2"></div>
               <div className="flex items-center gap-2">
                <label htmlFor="tramColor">Kolor Tramwaju:</label>
                <input type="color" id="tramColor" value={settings.tramColor} onChange={(e) => handleSettingsChange('tramColor', e.target.value)} className="w-8 h-8 p-0 border-0 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="tramIcon">Ikona Tramwaju:</label>
                <select id="tramIcon" value={settings.tramIconShape} onChange={(e) => handleSettingsChange('tramIconShape', e.target.value as IconShape)} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-1">
                  <option value="dot">Kropka</option>
                  <option value="vehicle">Pojazd</option>
                  <option value="pin">Pinezka</option>
                </select>
              </div>
           </div>
        )}
      </header>
      
      {(isLoading || initError) && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-gray-100/70 dark:bg-gray-900/70">
          {initError ? (
            <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-xl text-center max-w-sm">
              <p className="font-bold">Błąd Krytyczny</p>
              <p>{initError}</p>
            </div>
          ) : (
            <div className="text-gray-800 dark:text-white text-2xl font-semibold animate-pulse">Ładowanie danych...</div>
          )}
        </div>
      )}
      
      {!isLoading && vehicles.length === 0 && apiError && !initError && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1001] p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-xl text-center">
            <p className="font-bold">Błąd Ładowania Danych</p>
            <p>Nie udało się załadować żadnych danych o pojazdach.</p>
            <p className="text-sm text-gray-600 mt-2">Sprawdź połączenie z internetem lub spróbuj ponownie później.</p>
        </div>
      )}

      <MapContainer center={GDANSK_CENTER} zoom={12} scrollWheelZoom={true}>
        {settings.isDarkMode ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {filteredVehicles.map(vehicle => {
          const isTram = vehicle.vehicleType === 'TRAM';
          return (
            <VehicleMarker 
              key={vehicle.vehicleId} 
              vehicle={vehicle}
              color={isTram ? settings.tramColor : settings.busColor}
              iconShape={isTram ? settings.tramIconShape : settings.busIconShape}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default App;
