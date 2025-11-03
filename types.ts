export interface Vehicle {
  vehicleId: number;
  routeShortName: string;
  headsign: string;
  vehicleCode: string;
  vehicleType: "BUS" | "TRAM";
  speed: number;
  lat: number;
  lon: number;
  bearing: number;
  delay: number;
}

export interface RawVehicle {
  vehicleId: number;
  routeShortName: string;
  headsign: string;
  vehicleCode: string;
  speed: number;
  lat: number;
  lon: number;
  bearing: number;
  delay: number;
}


export interface ApiResponse {
  lastUpdate: string;
  vehicles: RawVehicle[];
}

export interface Route {
  routeId: string;
  agencyName: string;
  routeShortName: string;
  routeLongName: string;
  activationDate: string;
}

export interface RoutesApiResponse {
  [date: string]: {
    routes: Route[];
  };
}
