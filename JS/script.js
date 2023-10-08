'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min

    // this.date = 
    // this.id = 
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Runnning extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace = () => this.pace = this.distance / this.duration;
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed = () => this.speed = this.distance / (this.duration / 60);
}

// Application Architecture
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Could not get your position')
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // Empty Inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
    inputCadence
      .closest('.form__row')
      .classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    const addErrorBorder = (...inputs) => inputs.forEach(inp => inp.classList.add('error'));
    const removeErrorBorder = (...inputs) => inputs.forEach(inp => inp.classList.remove('error'));
    const checkData = (elements, inputs) => {
      if (!validInputs(...inputs) || !allPositive(...inputs)) {
        addErrorBorder(...elements);
        alert('Not valid input, Input should be positive numbers only!');
      } else {
        removeErrorBorder(...elements);
      }
    }

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      checkData([inputDistance, inputDuration, inputCadence], [distance, duration, cadence]);

      workout = new Runnning([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration)) return alert('Not valid input, Input should be positive numbers only!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as a marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + Clear input fields
    this._hideForm();
    // Display marker

  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
      .openPopup();
  }

  _renderWorkout(workout) {
    const html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.type === 'running' ? workout.pace.toFixed(2) : workout.speed.toFixed(2)}</span>
        <span class="workout__unit">${workout.type === 'running' ? 'min/km' : 'km/h'}</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">${workout.type === 'running' ? '🦶🏼' : '⛰'}</span>
        <span class="workout__value">${workout.type === 'running' ? workout.cadence : workout.elevationGain}</span>
        <span class="workout__unit">${workout.type === 'running' ? 'spm' : 'm'}</span>
      </div>
    </li>
    `

    form.insertAdjacentHTML('afterend', html);
  }
}

const app = new App();
