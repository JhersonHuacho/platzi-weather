(function(){

  const API_WEATHER_KEY = '80114c7878f599621184a687fc500a12';
  const API_WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather?id=524901&APPID=' + API_WEATHER_KEY + '&';
  const IMG_WEATHER = "http://openweathermap.org/img/w/";

  const API_WORLDTIME_KEY = "8e3fc401ba9c63be235fd03f27ce2";
  const API_WORLDTIME = "http://api.worldweatheronline.com/free/v2/tz.ashx?&format=json&key=" + API_WORLDTIME_KEY + "&q=";
  
  let today = new Date();
  let timeNow = today.toLocaleTimeString();
  
  let $body              = document.querySelector("body");
  let $loader            = document.querySelector(".loader");
  let $nombreNuevaCiudad = document.querySelector("[data-input='cityAdd']");
  let $buttonAdd         = document.querySelector("[data-button='add']");
  let $buttonLoad         = document.querySelector("[data-saved-cities]");

  let cities = [];
  let cityWeather = {};
  cityWeather.zone;
  cityWeather.icon;
  cityWeather.temp;
  cityWeather.temp_max;
  cityWeather.temp_min;
  cityWeather.main;

  $buttonAdd.addEventListener("click", addNewCity);
  $nombreNuevaCiudad.addEventListener("keypress", function(event) {
    //console.log(event.which);
    if (event.which == 13) addNewCity(event);
  });
  $buttonLoad.addEventListener("click", loadSavedCities);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getCoords, errorFound);
  } else {
    alert('Por favor, actualizar tu navegador');
  }

  function errorFound(error) {
    alert('Un error ocurrió: ' + error.code);
    //0: Error desconocido
    //1: Permiso denegado
    //2: Posición no esta disponible
    //3: Timeout
  }

  function getCoords(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    console.log('Tu posición es: ' + lat + ' , ' + lon + ' , ' + API_WEATHER_URL + 'lat=' + lat + '&lon=' + lon);
    $.getJSON(API_WEATHER_URL + 'lat=' + lat + '&lon=' + lon, getCurrentWeather);
    //$.getJSON(`${API_WEATHER_URL}lat=${lat}&lon=${lon}`)
  }

  function getCurrentWeather(data) {
    console.log(data);
    cityWeather.zone     = data.name;
    cityWeather.icon     = IMG_WEATHER + data.weather[0].icon + ".png";
    cityWeather.temp     = data.main.temp - 273.15; //restando nos devuelve en grados centigrados
    cityWeather.temp_max = data.main.temp_max - 273.15;
    cityWeather.temp_min = data.main.temp_min - 273.15;
    cityWeather.main     = data.weather[0].main;
    console.log(cityWeather.zone);
    //render
    renderTemplate(cityWeather);
  }

  function activateTemplate(idTemplate) {
    let t = document.querySelector(idTemplate);
    return document.importNode(t.content, true)
  }

  function renderTemplate(cityWeather, localTime) {
    let clone = activateTemplate('#template--city');
    let timeToShow;

    if (localTime) {
      timeToShow = localTime.split(" ")[1];
    } else {
      timeToShow = timeNow;
    }
    //console.log(clone);
    clone.querySelector("[data-time]").innerHTML = timeToShow;
    clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
    clone.querySelector("[data-icon]").src = cityWeather.icon;
    clone.querySelector("[data-temp='max']").innerHTML = cityWeather.temp_max.toFixed(1);
    clone.querySelector("[data-temp='min']").innerHTML = cityWeather.temp_min.toFixed(1);
    clone.querySelector("[data-temp='current']").innerHTML = cityWeather.temp.toFixed(1);

    //$(".loader").hide(); //con jquery ocultar el elemento
    $loader.style.display = "none";
    //$("body").append(clone); //con jquery
    //$( $body ).append(clone); //con jquery creando una variable
    $body.appendChild(clone);
  }

  function addNewCity(event) {
    event.preventDefault();
    console.log($nombreNuevaCiudad.value);
    $.getJSON(`${API_WEATHER_URL}q=${$nombreNuevaCiudad.value}`, getWeatherNewCity);
  }

  function getWeatherNewCity(data) {
    //console.log(data);
    //$.getJSON(`${API_WORLDTIME}${$nombreNuevaCiudad.value}`, function(response) {
      $nombreNuevaCiudad.value = "";
      cityWeather = {};
      cityWeather.zone     = data.name;
      cityWeather.icon     = IMG_WEATHER + data.weather[0].icon + ".png";
      cityWeather.temp     = data.main.temp - 273.15; //restando nos devuelve en grados centigrados
      cityWeather.temp_max = data.main.temp_max - 273.15;
      cityWeather.temp_min = data.main.temp_min - 273.15;
      cityWeather.main     = data.weather[0].main;
      //console.log(response);
      //renderTemplate(cityWeather, response.data.time_zone[0].localtime);
      renderTemplate(cityWeather);
      
      cities.push(cityWeather);
      localStorage.setItem("cities", JSON.stringify(cities));
    //});
  }
  /*
  Local Storage
  */
  function loadSavedCities(event) {
    event.preventDefault();

    function renderCities(cities) {
      cities.forEach(city => {
        renderTemplate(city);
      });
    }

    let cities = JSON.parse(localStorage.getItem("cities"));
    renderCities(cities);
  }
})();