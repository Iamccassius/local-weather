// Global variable that stores the total amount of items in the database
let count;

/* The success-function is called when the geolocation was successfully determined */
function success(pos) {
  let location = pos.coords;
  let latitude = location.latitude;
  let longitude = location.longitude;

  /*The Openweathermap API is called with a getJSON request using the coordinates from the geolocation */
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=a823ad7bba736b25bf0604de42c11ee5`).then(function(response2) {
    return response2.json();
  }).then(function(response) {

    /* City and Country Name from API Information is passed into HTML */
    document.querySelector("#city").textContent = `${response.name}, ${response.sys.country}`;

    /* Changes the weather icon depending on API weather ID */
    let weatherId = response.weather[0].icon;
    switch (weatherId) {
      case '01d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-day-sunny");
        break;
      case '02d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-day-cloudy");
        break;
      case '03d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-cloud");
        break;
      case '04d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-cloudy");
        break;
      case '09d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-showers");
        break;
      case '10d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-day-showers");
        break;
      case '11d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-thunderstorm");
        break;
      case '13d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-snow");
        break;
      case '50d':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-day-haze");
        break;
      case '01n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-night-clear");
        break;
      case '02n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-night-alt-cloudy");
        break;
      case '03n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-cloud");
        break;
      case '04n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-cloudy");
        break;
      case '09n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-showers");
        break;
      case '10n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-night-alt-showers");
        break;
      case '11n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-thunderstorm");
        break;
      case '13n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-snow");
        break;
      case '50n':
        document.getElementById("weather-icon").setAttribute("class", "wi wi-fog");
        break;

      default:
        document.getElementById("weather-icon").setAttribute("class", "wi wi-refresh");
    }

    /* Temperature in Kelvin from API is converted to Celsius and rounded to one decimal point */
    let tempCelsius = Math.round((response.main.temp - 273.15) * 10) / 10;
    document.getElementById("temperature").innerHTML = `${tempCelsius}`;

    /* Capitalized weather description from API is passed into HTML */
    document.getElementById("weather-description").innerHTML = `${response.weather[0].description}`;

    /* Wind speed and Cloudiness */
    let windInKmh = Math.round(response.wind.speed * 3.6);
    document.getElementById("wind-speed").innerHTML = `wind speed: ${windInKmh} km/h`;

    document.getElementById("cloudiness").innerHTML = `cloudiness: ${response.clouds.all}%`;

    /* Converts the API information about sunrise and sunset from epoch/unix to human readable date and stores it into HTML */
    let sunrise = timeFromUnix(response.sys.sunrise);
    let sunset = timeFromUnix(response.sys.sunset);

    document.querySelector('#sunrise').textContent = `sunrise: ${sunrise.hours}:${sunrise.minutes} UTC${sunrise.timezoneOffset}`;
    document.querySelector('#sunset').textContent = `sunset: ${sunset.hours}:${sunset.minutes} UTC${sunset.timezoneOffset}`;

    /* Module to change the temperature unit from Celsius to Fahrenheit */

    document.getElementById("temp-unit").setAttribute("class", "temp-unit-active"); // Displays the temperature unit as a link once the temperature has succesfully been loaded from the API

    /* The tempUnit function is called, when you click on the temperature unit. It converts between Celsius and Fahrenheit */
    function changeTempUnit() {
      let tempUnit = document.getElementById("temp-unit").innerHTML;
      /* If the temperature unit is equal to °C convert the Kelvin API temp to Fahrenheit and display Fahrenheit */
      if (tempUnit === "°C") {
        let tempFahrenheit = Math.round((response.main.temp * (9/5) - 459.67) * 10) / 10;
        document.getElementById("temperature").innerHTML = tempFahrenheit;
        document.getElementById("temp-unit").innerHTML = "°F";
        document.getElementById("temp-unit").addEventListener("click", changeTempUnit);
      }
      /*else if the temperature unit is °F convert the Kelvin API temp to Celsius and display Celsius */
      else if (tempUnit === "°F") {
        let tempCelsius = Math.round((response.main.temp - 273.15) * 10) / 10;
        document.getElementById("temperature").innerHTML = `${tempCelsius}`;
        document.getElementById("temp-unit").innerHTML = "°C";
        document.getElementById("temp-unit").addEventListener("click", changeTempUnit);
      }
      else {
        document.getElementById("temp-unit").innerHTML = "N/A $Temp Unit Error$";    // error message
      }
    }; // closes the changeTempUnit function

    /* Adds an event listener to the temperature unit. When clicked it changes between Fahrenheit and Celsius. */
    document.getElementById("temp-unit").addEventListener("click", changeTempUnit);

    // store the data of the successfull geolocation into the database, but only if data from the same day is not in the database

    // Count the number of objects stored in the visits objectStore
    let transaction = db.transaction(['visits'], 'readwrite');
    let objectStore = transaction.objectStore('visits');
    let objectStoreCount = objectStore.count();

    let lastVisit;
    let lastVisitminusOne;

    objectStoreCount.onsuccess = function(e) {
      count = objectStoreCount.result;
      console.log(`There are ${count} objects stored in the database`);
    };

    transaction.onerror = function() {
      console.log('Transaction not completed due to error. Counting of objectStore failed.')
    };

    // When the number of objects in objectStore has been counted, we access the last item
    transaction.oncomplete = function() {
      console.log('Transaction completed: Counting of objectStore finished.')

      // Access the last and next-to-last item of the objectStore
      let transaction2 = db.transaction(['visits'], 'readonly');
      let transaction3 = db.transaction(['visits'], 'readonly');
      let objectStore2 = transaction2.objectStore('visits');
      let objectStore3 = transaction3.objectStore('visits');
      let objectStoreGet = objectStore2.get(count);
      let objectStoreGet2 = objectStore3.get(count-1);

      // Store the information from the last entry in the database in lastVisit
      objectStoreGet.onsuccess = function(e) {
        lastVisit = e.target.result;
      };

      objectStoreGet2.onsuccess = function(e) {
        lastVisitMinusOne =  e.target.result;
      };

      transaction2.onerror = function() {
        console.log('Transaction not completed due to error: Last object could not be stored in lastVisit');
      };

      transaction2.oncomplete = function() {
        console.log('Transaction completed: Last object in objectStore saved in lastVisit');
      };

      transaction3.onerror = function() {
        console.log('Transaction not completed due to error: Next to last object could not be stored in lastVisitMinusOne');
      };

      transaction3.oncomplete = function() {
        console.log('Transaction completed: Next to last object in objectStore saved in lastVisitMinusOne');

        // At this point the last entry in the database is stored in lastVisit and the next to last in lastVisitMinusOne
        // We only want to store the result of the geolocation in the database,
        // when the last entry is not from today. We want to show the lasVisit,
        // but only if it is not the lastVisit from today. Then we want to show the next to last visit


        let responsedate = timeFromUnix(response.sys.sunrise);

        // Check whether a lastVisit exists, if yes then store it, else compare it to today
        if(!(lastVisit)) {
          console.log('Data from today has been stored in the database, since you never visited before.');
          addData(response);
        } else {

          let lastVisitDate = timeFromUnix(lastVisit.sunrise);

          if(responsedate.year + responsedate.month + responsedate.date === lastVisitDate.year + lastVisitDate.month + lastVisitDate.date) {
            console.log('Data from today is already in the database. No additional information has been stored!');
            if(lastVisitMinusOne) {
              displayData(count-1);
            }
          } else {
            displayData(count);
            addData(response);
            console.log('Data from today has been stored in the database, since today you did not already visit the site.');
          }
        }

      }; // closes the oncomplete of the second transaction: getting the last item in the database

    }; // closes the oncomplete of the first transaction: counting the amount of stored items in objectStore

  }); // closes the fetch request

}; // closes the success function

/* The error-function is called when the geolocation was not successfull */
function error(err) {
  document.getElementById("city").innerHTML = "Your location could not be determined. Please enable GPS (on mobile), refresh the page and accept geolocation."
  console.log(err);
};

// Create needed constants
const lastVisitBtnDiv = document.querySelector('#divBtnIdb');
const lastVisitBtn = document.querySelector('#btnIdb');
const databaseContentDiv = document.querySelector('#divContentIdb');
const lastDate = document.querySelector('#dateIdb');
const lastCity = document.querySelector('#cityIdb');
const lastSunrise = document.querySelector('#sunriseIdb');
const lastSunset = document.querySelector('#sunsetIdb');
const nextBtn = document.querySelector('#nextIdb');
const lastBtn = document.querySelector('#lastIdb');

// Create an instance of a db object to store the open database in
let db;

// Stores the visit data in the database. All dates are in UNIX. Is called in the success function of the geolocation.
function addData(e) {
  let newItem = { city: e.name, country: e.sys.country, sunrise: e.sys.sunrise, sunset: e.sys.sunset};

  let transaction = db.transaction(['visits'], 'readwrite');
  let objectStore = transaction.objectStore('visits');
  let request = objectStore.add(newItem);

  transaction.oncomplete = function() {
    console.log('Transaction completed: database modification finished.');
  };

  transaction.onerror = function() {
    console.log('Transaction not opened due to error');
  };
};

let currCount;
// Gets an item from the database by index and returns it into a variable
function displayData(i) {

  let transaction = db.transaction(['visits'], 'readonly');

  transaction.onerror = function(e) {
    console.log('Transaction not completed: The item could not be retrieved.')
  }

  transaction.oncomplete = function(e) {
    console.log('Transaction completed: The item has been retrieved.');
  };

  let objectStore = transaction.objectStore('visits');
  let objectStoreRequest = objectStore.get(i);

  objectStoreRequest.onsuccess = function(e) {
    let result = e.target.result;
    let thisSunrise = timeFromUnix(result.sunrise);
    let thisSunset = timeFromUnix(result.sunset);
    lastDate.textContent = `${thisSunrise.date}.${thisSunrise.month}.${thisSunrise.year}`;
    lastCity.textContent = `${result.city}, ${result.country}`;
    lastSunrise.textContent = `sunrise: ${thisSunrise.hours}:${thisSunrise.minutes} UTC${thisSunrise.timezoneOffset}`;
    lastSunset.textContent = `sunset: ${thisSunset.hours}:${thisSunset.minutes} UTC${thisSunset.timezoneOffset}`;
    lastVisitBtnDiv.style.display = 'flex';
    currCount = i;


    // Two buttons to toggle between the different database items, if there are any
    if (currCount > 1) {
      lastBtn.style.display = 'flex';
    } else {
      lastBtn.style.display = 'none';
    }

    if (currCount < count) {
      nextBtn.style.display = 'flex';
    } else {
      nextBtn.style.display = 'none';
    }
  };
};

// takes UNIX/epoch time data and returns human readable date and time information
function timeFromUnix(unix) {
  let myDate = new Date(unix * 1000);
  let dateObject = {};
  dateObject.year = myDate.getFullYear();
  if ((myDate.getMonth() + 1) < 10) {
    dateObject.month = '0' + (myDate.getMonth() + 1);
  } else {
    dateObject.month = myDate.getMonth() + 1;
  }
  dateObject.date = myDate.getDate();
  dateObject.day = myDate.getDay();
  dateObject.hours = myDate.getHours();
  if(myDate.getMinutes() >= 10) {
    dateObject.minutes = myDate.getMinutes();
  } else {
    dateObject.minutes = '0' + myDate.getMinutes();
  }
  if ((-1 * (myDate.getTimezoneOffset() / 60)) >= 0) {
    dateObject.timezoneOffset = '+' + (-1 * (myDate.getTimezoneOffset() / 60));
  } else {
    dateObject.timezoneOffset = '-' + (-1 * (myDate.getTimezoneOffset() / 60));
  }

  return dateObject;
};

/* The code below will get executed once the page has fully loaded */
$(document).ready(function() {

  //Open the database; it is created in onupgradeneeded if it doesn't already exist
  let request = window.indexedDB.open('visits', 1);

  request.onerror = function() {
    console.log('Database failed to open');
  };

  request.onsuccess = function() {
    console.log('Database opened successfully');

    // Store the database in the db variable
    db = request.result;

  };

  // Setup the database it this has not been done yet
  request.onupgradeneeded = function(e) {
    // Reference to the opened database
    let db = e.target.result;

    let objectStore = db.createObjectStore('visits', { keyPath: 'id', autoIncrement:true });

    objectStore.createIndex('city', 'city', { unique: false });
    objectStore.createIndex('country', 'country', { unique: false });
    objectStore.createIndex('sunrise', 'sunset', { unique: false });
    objectStore.createIndex('sunset', 'sunset', { unique: false });

    console.log('Database setup complete');
  };

// The button openes and closes the div with the database content of the last visit
  lastVisitBtn.addEventListener('click', function(){
    if(databaseContentDiv.style.display === '' || databaseContentDiv.style.display === 'none') {
      databaseContentDiv.style.display = 'block';
    } else {
      databaseContentDiv.style.display = 'none';
    }
    console.log('Button is pressed');
  });

  lastBtn.addEventListener('click', function() {
    displayData(currCount - 1);
  });
  nextBtn.addEventListener('click',  function() {
    displayData(currCount + 1);
  });

  navigator.geolocation.getCurrentPosition(success, error);

}); // closes the document.ready section
