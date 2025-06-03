import './style/index.css';
import { initCitySearch } from './citySearch.js';
import { initTemperatureToggle } from './utils/temperatureUnit.js';
import { get12Weather } from './api.js';
import { initTopCities} from './weatherDisplay/renderTopCities.js';
import { eventBus } from '../lib/src/index.js';
import './weatherDisplay/showWeather5Days.js';
import './weatherDisplay/showWeather12Hours.js';
import { initRouting } from './navigation/router.js';
import page from 'page';


let lastWeatherData = null;
let lastWeatherData12Hour = null;

initCitySearch(async (weatherData, cityKey) => {
    lastWeatherData = weatherData;
    eventBus.emit('weather-updated', weatherData);

    if (cityKey) {
        const hourlyData = await get12Weather(cityKey);
        lastWeatherData12Hour = hourlyData;
        eventBus.emit('hourly-weather-updated', hourlyData);
    } else {
        lastWeatherData12Hour = null;
        eventBus.emit('hourly-weather-updated', null);
    }
});

initTemperatureToggle(() => {
    const allowedPaths = ['/', '/weather'];
    if (!allowedPaths.includes(location.pathname)) return;
    eventBus.emit('unit-changed');
});

initTopCities(); 

initRouting();

const backToHomeBtn = document.querySelector('.back-to-home-btn');
const cityInput = document.querySelector('.js-search-input');
const cityList = document.querySelector('.js-city-list');
backToHomeBtn.addEventListener('click', () => {
    page('/');
    cityInput.value = '';
    cityList.innerHTML = '';
    cityList.classList.add('hidden');
});