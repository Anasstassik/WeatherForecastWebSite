import { getCities, getWeather as fetchWeather } from './api.js';
import { debounce} from './utils/debounce.js'
import page from 'page';

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
    } else if (query.length === 0) {
        page('/');
        cityList.classList.add('hidden');
    }
}, 400);

async function fetchAndDisplayCities(query) {
    const cities = await getCities(query);

    if (cities.length === 0) {
        const emptyMessage = document.createElement("div");
        emptyMessage.classList.add("empty-message");
        emptyMessage.textContent = "No cities found";
        cityList.appendChild(emptyMessage);
        cityList.classList.remove('hidden');
        return;
    }

    cities.forEach(city => {
        const cityItem = document.createElement("div");
        cityItem.classList.add("cityList");
        cityItem.textContent = `${city.LocalizedName}, ${city.Country.LocalizedName}`;
        cityItem.dataset.key = city.Key;

        cityItem.addEventListener('click', async () => {
            await handleCityClick(city);
        });
        cityList.appendChild(cityItem);
    });
  cityList.classList.remove('hidden');
}

async function handleCityClick(city) {
    cityList.innerHTML = "";
    cityList.classList.add('hidden');

    const weather = await fetchWeather(city.Key);
    if (!weather) return;

    let cityTitle = document.querySelector('.city-title');
    if (!cityTitle) {
        cityTitle = document.createElement('h2');
        cityTitle.className = 'city-title';
        const fiveDayContainer = document.querySelector('.weather-container .weather-5days');
        if (fiveDayContainer) {
            document.querySelector('.weather-container').insertBefore(cityTitle, fiveDayContainer);
        } else {
            document.querySelector('.weather-container').prepend(cityTitle);
        }    
    }
    cityTitle.textContent = `Weather in ${city.LocalizedName}`;

    page('/weather'); 
    setTimeout(() => {
        if (typeof onWeatherFetchedCallback === 'function') {
            onWeatherFetchedCallback(weather, city.Key);
        }
    }, 0);
}
