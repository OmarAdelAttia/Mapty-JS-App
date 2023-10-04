'use strict';
// prettier-ignore

import * as element from './elements.js';
import * as method from './methods.js';

let map, mapEvent;

if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    map = L.map('map').setView(coords, 13);
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // handling clicks on map
    map.on('click', mapE => {
      mapEvent = mapE;
      element.form.classList.remove('hidden');
      element.inputDistance.focus();
    });
  }, method.errorCallback);

element.form.addEventListener('submit', e => {
  e.preventDefault();

  // Clear input fields
  element.inputDistance.value = element.inputDuration.value = element.inputCadence.value = element.inputElevation.value = '';

  console.log(element.inputDistance.target);
  console.log(element.inputDistance.value);
  // Display marker
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
        // className: 'cycling-popup',
      })
    )
    .setPopupContent('workout')
    .openPopup();
});

element.inputType.addEventListener('change', () => {
  element.inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  element.inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
