'use strict';
// prettier-ignore

import * as element from "./elements.js";
import * as method from "./methods.js";

if (navigator.geolocation) navigator.geolocation.getCurrentPosition(position => {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
}, method.errorCallback());