import { initCitySearch } from './citySearch.js';
import { updateTemperatureDisplay } from './showWeather5Days.js';
import { initTemperatureToggle } from './temperatureUnit.js';
import { get12Weather } from './api.js';
import { display12HourWeather } from './showWeather12Hours.js';

let lastWeatherData = null;
let lastWeatherData12Hour = null;

initCitySearch(async (weatherData, cityKey) => {
    lastWeatherData = weatherData;
    updateTemperatureDisplay(weatherData);
    if (cityKey) {
        const hourlyData = await get12Weather(cityKey);
        lastWeatherData12Hour = hourlyData;
        display12HourWeather(lastWeatherData12Hour );
    } else {
        lastWeatherData12Hour = null;
        display12HourWeather(null);
    }
});

initTemperatureToggle(() => {
    if (lastWeatherData) {
        updateTemperatureDisplay(lastWeatherData);
    }
    if (lastWeatherData12Hour ) {
        display12HourWeather(lastWeatherData12Hour );
    }
});
