import { getCurrentUnit } from '../utils/temperatureUnit.js';
import { eventBus } from '../../lib/src/index.js';
import { processDailyForecastItem } from '../utils/weatherUtils.js';

let weather = null;

export async function updateTemperatureDisplay(weatherData) {
    if (!weatherData) return;

    weather = weatherData;
    const currentUnit = getCurrentUnit();

    const weatherContainer = document.querySelector('.weather-5days');
    weatherContainer.innerHTML = '';

    const dayElementsPromises = weather.DailyForecasts.map(async (day) => {
        const processedDay = await processDailyForecastItem(day, currentUnit);

            const dayElement = document.createElement('div');
            dayElement.className = 'weather-day';
            dayElement.innerHTML = `
                <h3>${processedDay.dayShort}</h3>
                <div class="date">${processedDay.dateFull}</div> 
                <img src="${processedDay.iconUrl}" alt="Weather icon" class="weather-icon"/>
                <div class="temp-max">${processedDay.maxTemp}°${processedDay.displayUnit}</div>
                <div class="temp-min">${processedDay.minTemp}°${processedDay.displayUnit}</div>
            `;
            return dayElement;
    });

    const dayElements = await Promise.all(dayElementsPromises);
    dayElements.forEach(dayElement => weatherContainer.appendChild(dayElement));
    document.querySelector('.weather-container').style.display = 'block';
}
eventBus.on('weather-updated', (data) => {
    updateTemperatureDisplay(data);
});
eventBus.on('unit-changed', () => {
    if (weather) {
        updateTemperatureDisplay(weather);
    }
});
