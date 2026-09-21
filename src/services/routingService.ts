import { LocationDetails, RouteAlternative, RouteTrafficSummary } from '../types/traffic';

export interface RouteResponse {
  success: boolean;
  routes: RouteAlternative[];
  trafficSummary: RouteTrafficSummary;
  source: string;
  requestedAt: string;
  receivedAt: string;
  error?: string;
}

export interface GeocodeResponse {
  success: boolean;
  results: LocationDetails[];
  error?: string;
}

class RoutingService {
  private geocodeAbortController: AbortController | null = null;

  /**
   * Search for places using real Geocoding API
   */
  async searchLocations(query: string): Promise<LocationDetails[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    // Abort previous in-flight geocode query
    if (this.geocodeAbortController) {
      this.geocodeAbortController.abort();
    }
    this.geocodeAbortController = new AbortController();

    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, {
        signal: this.geocodeAbortController.signal
      });

      if (!res.ok) {
        throw new Error(`Geocoding server responded with ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.results)) {
        return data.results.map((item: any) => ({
          name: item.name,
          address: item.address,
          city: item.city,
          district: item.district,
          state: item.state,
          country: item.country,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          placeId: item.placeId,
          source: item.source || 'AURA Geocoding Service',
          selectedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
      }
      return [];
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return [];
      }
      console.warn('Geocoding service notice:', err?.message || err);
      throw err;
    }
  }

  /**
   * Reverse Geocode coordinates to address
   */
  async reverseGeocode(lat: number, lon: number): Promise<LocationDetails> {
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
    if (!res.ok) {
      throw new Error(`Reverse geocode failed with status ${res.status}`);
    }

    const data = await res.json();
    if (data.location) {
      return {
        name: data.location.name,
        address: data.location.address,
        city: data.location.city,
        district: data.location.district,
        state: data.location.state,
        country: data.location.country,
        latitude: Number(data.location.latitude),
        longitude: Number(data.location.longitude),
        placeId: data.location.placeId,
        source: data.location.source || 'AURA GPS Kinematics',
        selectedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }

    return {
      name: `GPS Point (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      address: `Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}`,
      latitude: lat,
      longitude: lon,
      source: 'Device GPS',
      selectedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }

  /**
   * Calculate Driving Routes between Origin and Destination
   */
  async calculateRoutes(
    origin: LocationDetails,
    destination: LocationDetails
  ): Promise<RouteResponse> {
    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: {
          latitude: origin.latitude,
          longitude: origin.longitude,
          name: origin.name,
          address: origin.address
        },
        destination: {
          latitude: destination.latitude,
          longitude: destination.longitude,
          name: destination.name,
          address: destination.address
        }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Route calculation failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      routes: data.routes || [],
      trafficSummary: data.trafficSummary || {
        status: 'ESTIMATED',
        condition: 'MODERATE',
        averageSpeedKmh: 40,
        delayMinutes: 0,
        futureRiskLevel: 'LOW',
        riskWindow: 'Stable',
        potentialDisruption: 'None',
        cascadeExposure: 'None',
        downstreamJunctionsCount: 0
      },
      source: data.source || 'Routing Provider',
      requestedAt: data.requestedAt || new Date().toISOString(),
      receivedAt: data.receivedAt || new Date().toISOString()
    };
  }
}

export const routingService = new RoutingService();
