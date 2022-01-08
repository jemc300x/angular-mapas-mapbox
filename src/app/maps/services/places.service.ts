import { query } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MapService } from '.';
import { PlacesApiClient } from '../api/placesApiClient';
import { Feature, PlacesResponse } from '../interfaces/places';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  public userLocation?: [number, number];
  public isLoadingPlaces = false;
  public places: Feature[] = [];

  get isUserLocationReady(): boolean {
    return !!this.userLocation;
  }

  constructor(
    private http: PlacesApiClient,
    private mapService: MapService
  ) {
    this.getUserLocation();
  }

  public async getUserLocation(): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({coords}) => {
          this.userLocation = [coords.longitude, coords.latitude];
          resolve(this.userLocation)
        },
        (err) => {
          alert('No se pudo obtener la geolocalización');
          console.error(err);
          reject(err);
        }
      )
    })
  }

  getPlacesByQuery(query: string) {

    if (query.length === 0) {
      this.isLoadingPlaces = false;
      this.places = [];
      return;
    }

    this.isLoadingPlaces = true;
    this.http.get<PlacesResponse>(`/${query}.json`, { params: {proximity: this.userLocation!.join(',')}})
      .subscribe(res => {
        console.log(res.features)
        this.isLoadingPlaces = false;
        this.places = res.features;
        this.mapService.removeLayer();
        this.mapService.createMarkerFromPlaces(this.places, this.userLocation!);
      });
  }

  clearPlaces() {
    this.places = [];
  }

}
