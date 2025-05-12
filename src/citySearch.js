import { getCities, getWeather as fetchWeather } from './api.js';
import { debounce } from './utils.js';

const cityInput = document.querySelector(".js-search-input");
const cityList = document.querySelector(".js-city-list");

let onWeatherFetchedCallback = null;

export function initCitySearch(onWeatherFetched) {
    onWeatherFetchedCallback = onWeatherFetched;
    cityInput.addEventListener("input", handleInput);
}

const handleInput = debounce(async () => {
    const query = cityInput.value.trim();
    cityList.innerHTML = "";

    if (query.length > 1) {
        await fetchAndDisplayCities(query);
    } else {
        hideWeatherContainer();
    }
}, 400);

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

async function handleCityClick(city) {
    cityList.innerHTML = "";

    const weather = await fetchWeather(city.Key);
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

    if (typeof onWeatherFetchedCallback === 'function') {
        onWeatherFetchedCallback(weather);
    }
}

function hideWeatherContainer() {
    const weatherContainer = document.querySelector('.weather-container');
    weatherContainer.style.display = 'none';
}
