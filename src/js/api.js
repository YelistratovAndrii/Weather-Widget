const searchInput = document.querySelector('.search__text');
const cancelInput = document.querySelector('.fa-xmark');
const weatherBlock = document.querySelector('.weather');
const spanSelected = document.querySelector('.search__selected');
const presentPosition = document.querySelector('[data-present="name"]');
const forecast = document.querySelector('.forecast');
const weather = {
  apiKey: 'e2fb717aef11ea6aadadf61778654d1f',

  getUserLocation: function () {
    const success = function (position) {
      const { latitude, longitude } = position.coords;

      weather.fetchWeather(latitude, longitude);
      weather.displayUserLocation(latitude, longitude);
    };

    const error = () => {
      if (!spanSelected) {
        return;
      }

      spanSelected.textContent = `User location is unavalable`;
    };

    navigator.geolocation.getCurrentPosition(success, error);
  },

  displayUserLocation: function (latitude, longitude) {
    const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    fetch(geoApiUrl)
      .then((data) => data.json())
      .then((data) => {
        presentPosition.textContent = `${data.countryName}, ${data.locality}`;
        spanSelected.textContent = `${data.locality}, ${data.countryName}`;
      })
      .catch((err) => {
        alert(`User location is unavailable`);
        console.log(err);
        spanSelected.textContent = ``;
      });
  },

  fetchLocation: function (city) {
    fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${this.apiKey}`
    )
      .then((response) => {
        if (!response.ok) {
          console.log(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.fetchWeather(data[0].lat, data[0].lon);
        this.displayCity(data[0]);
      })
      .catch((err) => {
        alert(`Unable to recieve coordinates of requested location`);
        console.log(err);
        spanSelected.textContent = ``;
      });
  },

  fetchWeather: function (lat, lon) {
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={part}&appid=${this.apiKey}&units=metric`
    )
      .then((response) => {
        if (!response.ok) {
          console.log(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this.displayWeather(data);
      })
      .catch((err) => {
        alert(`Unable to recieve weather for requested location`);
        console.log(err);
        spanSelected.textContent = ``;
      });
  },

  displayCity: function (data) {
    presentPosition.textContent = `${data.country}, ${data.name}`;

    if (data.local_names?.ru) {
      spanSelected.textContent = `${data.name}, ${data.local_names.ru}, ${data.country}`;
    } else {
      spanSelected.textContent = `${data.name}, ${data.country}`;
    }
  },

  displayWeather: function (data) {
    const { feels_like, temp } = data.current;
    const { icon, main } = data.current.weather[0];
    const present = document.querySelector('.present');
    const presentItems = [...present.querySelectorAll('[data-present]')];
    const daily = [...data.daily];

    presentItems.forEach((item) => {
      if (item.dataset.present === 'icon') {
        item.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
      }

      if (item.dataset.present === 'feels_like') {
        item.innerHTML = `Feels like ${Math.round(feels_like)}&#8451`;
      }

      if (item.dataset.present === 'temp') {
        item.innerHTML = `${Math.round(temp)}&#8451`;
      }

      if (item.dataset.present === 'main') {
        item.textContent = main;
      }
    });

    for (let i = 1; i <= 5; i++) {
      forecast.innerHTML += `
        <div class="forecast-row">
          <span class="forecast-row__day">${this.getDay(
            daily[i].dt * 1000
          )}</span>
          <div class="forecast-row__img">
            <img class="present__img"  data-present="icon" src="http://openweathermap.org/img/wn/${
              daily[i].weather[0].icon
            }@2x.png"/></img>
          </div>
          <span class="forecast-row__description">${
            daily[i].weather[0].description
          }</span>
          <div class="forecast-row__min-max">
            <span>${Math.round(daily[i].temp.max)}&#8451</span>
            <span>${Math.round(daily[i].temp.min)}&#8451</span>
          </div>
        </div>
      `;
    }

    if (weatherBlock.classList.contains('_hidden')) {
      weatherBlock.classList.remove('_hidden');
    }
  },

  getDay(timestamp) {
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(timestamp);
    const day = date.getDay();
    return weekday[day];
  },

  search: function () {
    this.fetchLocation(searchInput.value);
  },
};

document.addEventListener('DOMContentLoaded', weather.getUserLocation);

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    forecast.innerHTML = ``;

    weather.search();

    if (!weatherBlock.classList.contains('_hidden')) {
      weatherBlock.classList.add('_hidden');
    }
  }
});

if (cancelInput) {
  cancelInput.addEventListener('click', () => (searchInput.value = ''));
}
