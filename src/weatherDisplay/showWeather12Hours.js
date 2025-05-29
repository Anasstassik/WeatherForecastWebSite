import { getCurrentUnit } from '../utils/temperatureUnit.js';    
import { eventBus } from '../../lib/src/index.js';
import { processHourlyForecastItem } from '../utils/weatherUtils.js';

const hourlyWeatherContainer = document.querySelector('.weather-12hours');
let latestHourlyData = null;

export async function display12HourWeather(hourlyForecastsData) {
    if (hourlyForecastsData) {
        latestHourlyData = hourlyForecastsData;
    }

    if (!hourlyWeatherContainer) {
        console.error("Element.weather-12hours wasn't found.");
        return;
    }

    if (!hourlyForecastsData || !Array.isArray(hourlyForecastsData) || hourlyForecastsData.length === 0) {
        hourlyWeatherContainer.innerHTML = "<p class='empty-message-hourly'>Data about hourly forecast is absent.</p>";
        return;
    }

    const currentDisplayUnit = getCurrentUnit();
    hourlyWeatherContainer.innerHTML = ''; 

    const titleElement = document.createElement('h3');
    titleElement.className = 'hourly-forecast-title';
    titleElement.textContent = 'Weather for nearly 12 hours.';
    hourlyWeatherContainer.appendChild(titleElement);

    const forecastList = document.createElement('div');
    forecastList.className = 'hourly-forecast-list';
    hourlyWeatherContainer.appendChild(forecastList);

    const hourElementsPromises = latestHourlyData.map(async (hourData) => {
        const processedHour = await processHourlyForecastItem(hourData, currentDisplayUnit);
        const hourElement = document.createElement('div');
        hourElement.className = 'weather-hour-item';
       const tempDisplay = processedHour.temp !== null
            ? `${processedHour.temp}°${processedHour.displayUnit}`
            : 'N/A'; 

        hourElement.innerHTML = `
            <div class="hour-time">${processedHour.time}</div>
            <img src="${processedHour.iconUrl}" alt="${processedHour.iconPhrase}" class="hour-weather-icon" title="${processedHour.iconPhrase}">
            <div class="hour-iconphrase">${processedHour.iconPhrase}</div>
            <div class="hour-temp">${tempDisplay}</div>
        `;
        return hourElement;
    });

    const hourElements = await Promise.all(hourElementsPromises);
    hourElements.forEach((el) => forecastList.appendChild(el));
}

eventBus.on('hourly-weather-updated', (data) => {
    display12HourWeather(data);
});

eventBus.on('unit-changed', () => {
    if (latestHourlyData) {
        display12HourWeather(latestHourlyData);
    }
});