import { initCitySearch } from './citySearch.js';
import { initTemperatureToggle } from './temperatureUnit.js';
import { get12Weather } from './api.js';
import { initTopCities} from './renderTopCities.js';
import { eventBus } from './eventBus.js';
import './showWeather5Days.js';
import './showWeather12Hours.js';


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
    eventBus.emit('unit-changed');
});

initTopCities(); 