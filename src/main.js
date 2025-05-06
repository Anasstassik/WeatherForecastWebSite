import { getCities, getWeather as fetchWeather } from './api.js';

const tempSwitch = document.querySelector(".temp-switch");
const units = document.querySelectorAll(".unit");
const cityInput = document.querySelector(".js-search-input");
const cityList = document.querySelector(".js-city-list");

let weather = null;
let currentUnit = 'C';

tempSwitch.addEventListener('change', () => {
    units.forEach(unit => unit.classList.toggle('active'));
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    updateTemperature();
});

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const handleInput = debounce(async () => {
    const query = cityInput.value.trim();
    cityList.innerHTML = "";

    if (query.length > 1) {
        await fetchAndDisplayCities(query);
    } else {
        hideWeatherContainer();
    }  
},400);

//Вивід списку міст
async function fetchAndDisplayCities(query) {
    const cities = await getCities(query);

    if (cities.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.classList.add("empty-message");
        emptyMessage.textContent = "No cities found";
        cityList.appendChild(emptyMessage);
        return;
    }

    cities.forEach(city => {
        const cityItem = document.createElement("div");
        cityItem.classList.add("cityList");
        cityItem.textContent = `${city.LocalizedName}, ${city.Country.LocalizedName}`;
        cityItem.dataset.key = city.Key;

        cityItem.addEventListener("click", () => handleCityClick(city));
        cityList.appendChild(cityItem);

    });
    
}

//Клік по місту
async function handleCityClick(city) {
    cityList.innerHTML = "";

    weather = await fetchWeather(city.Key);
    if (!weather) return;

    const weatherContainer = document.querySelector('.weather-container');
    weatherContainer.style.display = 'block';
    
    let cityTitle = document.querySelector('.city-title');
    if (!cityTitle) {
        cityTitle = document.createElement('h2');
        cityTitle.className = 'city-title';
        weatherContainer.prepend(cityTitle);
    }
    cityTitle.textContent = `Weather in ${city.LocalizedName}`;
    
    updateTemperature();
};

function hideWeatherContainer() {
    const weatherContainer = document.querySelector('.weather-container');
    weatherContainer.style.display = 'none';
}

cityInput.addEventListener("input", handleInput);

function updateTemperature() {
    if (!weather) return;

    const weatherContainer = document.querySelector('.weather-5days');
    weatherContainer.innerHTML = '';

    weather.DailyForecasts.forEach((day) => {
        const date = new Date(day.Date);
        let minTemp, maxTemp;

        if (currentUnit === 'C') {
            minTemp = Math.round(((day.Temperature.Minimum.Value - 32) * 5) / 9);
            maxTemp = Math.round(((day.Temperature.Maximum.Value - 32) * 5) / 9);
        } else {
            minTemp = Math.round(day.Temperature.Minimum.Value);
            maxTemp = Math.round(day.Temperature.Maximum.Value);
        }

        const dayElement = document.createElement('div');
        dayElement.className = 'weather-day';
        dayElement.innerHTML = `
        <h3>${date.toLocaleDateString("en-GB", { weekday: "short" })}</h3>
        <div class="date">${date.toLocaleDateString("en-GB", { month: "long", day: "numeric" })}</div>
        <div class="temp">${minTemp}°${currentUnit} / ${maxTemp}°${currentUnit}</div>
        `;
        weatherContainer.appendChild(dayElement);
    });
};
