import { initCitySearch } from './citySearch.js';
import { updateTemperatureDisplay } from './showWeather5Days.js';
import { initTemperatureToggle } from './temperatureUnit.js';

let lastWeatherData = null;

initCitySearch((weatherData) => {
    lastWeatherData = weatherData;
    updateTemperatureDisplay(weatherData);
});

initTemperatureToggle(() => {
    if (lastWeatherData) {
        updateTemperatureDisplay(lastWeatherData);
    }
});
