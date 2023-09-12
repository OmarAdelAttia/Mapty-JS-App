'use strict';
// prettier-ignore

import * as element from "./elements.js";
import * as method from './methods.js';

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    const map = L.map('map').setView(coords, 13);
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.marker(coords)
      .addTo(map)
      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
      .openPopup();
  }, method.errorCallback());
