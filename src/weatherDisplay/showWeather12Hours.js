import { getCurrentUnit } from '../utils/temperatureUnit.js';    
import { eventBus } from '../../lib/src/index.js';
import { processHourlyForecastItem } from '../utils/weatherUtils.js';
import { BiDirectionalPriorityQueue } from '../../lib/src/index.js';
import { convertTemperature } from '../utils/weatherUtils.js';

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
    const hourQueue = new BiDirectionalPriorityQueue();

    latestHourlyData.forEach((hour) => {
        const rawTemp = hour.Temperature?.Value;
        const sourceUnit = hour.Temperature?.Unit || 'F';
        const convertedTemp = convertTemperature(rawTemp, sourceUnit, currentDisplayUnit);

        const time = new Date(hour.DateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        hourQueue.enqueue({ type: 'hour', time }, convertedTemp);
    });

    function displayHourlyExtremes(hottestHour, coldestHour, unit) {
    const section = document.getElementById('hourly-summary-section');
    section.style.display = 'block';
    section.innerHTML = `
        <h3>The warmest time: ${hottestHour.item.time}, ${hottestHour.priority}°${unit}</h3>
        <h3>The coldest time: ${coldestHour.item.time}, ${coldestHour.priority}°${unit}</h3>
    `;
    }

    if (!hourQueue.isEmpty()) {
        const hottest = hourQueue.peek({ highest: true });
        const coldest = hourQueue.peek({ lowest: true });
        displayHourlyExtremes(hottest, coldest, currentDisplayUnit);
    }

    hourElements.forEach((el) => forecastList.appendChild(el));
}

eventBus.off('hourly-weather-updated');
eventBus.on('hourly-weather-updated', (data) => {
    display12HourWeather(data);
});

eventBus.off('unit-changed');
eventBus.on('unit-changed', () => {
    if (location.pathname === '/weather' && latestHourlyData) {
        display12HourWeather(latestHourlyData);
    }
});