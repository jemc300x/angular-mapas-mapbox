import { Injectable } from '@angular/core';
import { AnySourceData, LngLatBounds, LngLatLike, Map, Marker, Popup } from 'mapbox-gl';
import { type } from 'os';
import { DirectionsApiClient } from '../api/directionsApiClient';
import { DirectionResponse, Route } from '../interfaces/directions';
import { Feature } from '../interfaces/places';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private _map?: Map;
  private _markers: Marker[] = [];

  get isMapReady() {
    return !!this._map;
  }

  constructor(private directionsApiClient: DirectionsApiClient) {}

  setMap(map: Map) {
    this._map = map;
  }

  flyTo(coords: LngLatLike) {
    if (!this.isMapReady) throw Error('El mapa no esta inicializado');

    this._map?.flyTo({
      center: coords,
      zoom: 14
    });
  }

  createMarkerFromPlaces(places: Feature[], userLocation: [number, number]) {

    if (!this._map) throw Error('Mapa no inicializado');

    this._markers.forEach(marker => marker.remove());

    const newMarkers = [];

    for (const place of places) {
      const [lng, lat] = place.center;
      const popup = new Popup()
        .setHTML(`
          <h6>${place.text_es}</h6>
          <span>${place.place_name_es}</span>
        `);
      const newMarker = new Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this._map);

      newMarkers.push(newMarker);

    }

    this._markers = newMarkers;

    if (places.length === 0) return;

    const bounds = new LngLatBounds();
    bounds.extend(userLocation);
    newMarkers.forEach(marker => bounds.extend(marker.getLngLat()))

    this._map.fitBounds(bounds, {
      padding: 200
    })

  }

  getRouterBetweenPoints(start: [number, number], end: [number, number]) {
    this.directionsApiClient.get<DirectionResponse>(`/${start.join(',')};${end.join(',')}`)
      .subscribe(
        resp => {
          console.log(resp)
          if (resp.code === 'NoRoute') return;
          this.drawPolyline(resp.routes[0])
        }
      )
  }

  private drawPolyline(route: Route) {
    console.log({kms: route.distance / 1000, duration: route.duration / 60});

    if (!this._map) throw Error('Mapa no inicializado');

    const coords = route.geometry.coordinates;

    const bounds = new LngLatBounds();
    coords.forEach(([lng, lat]) => bounds.extend([lng, lat]));

    this._map.fitBounds(bounds, {
      padding: 200
    });

    // Polyline
    const sourceDate: AnySourceData = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          }
        ]
      }
    }


    this.removeLayer();

    this._map.addSource('RouteString', sourceDate);

    this._map.addLayer({
      id: 'RouteString',
      type: 'line',
      source: 'RouteString',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': 'green',
        'line-width': 3
      }
    })

  }
  removeLayer() {
    if (this._map?.getLayer('RouteString')) {
      this._map.removeLayer('RouteString');
      this._map.removeSource('RouteString');
    }
  }


}
