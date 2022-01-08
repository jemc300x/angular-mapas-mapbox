import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import Mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"

Mapboxgl.accessToken = 'pk.eyJ1IjoiamVtYzMwMHgiLCJhIjoiY2t4dDZlcGkwMzd5dzJucG5kbmlsdDJ0YSJ9.82Rk7Qvwqycy4hqG82HARQ';

if (!navigator.geolocation) {
  alert('El navegador no soporta la Geolocation');
  throw new Error('El navegador no soporta la Geolocation');
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
