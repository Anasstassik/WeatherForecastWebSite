import { getCurrentUnit } from '../utils/temperatureUnit.js';
import { eventBus } from '../../lib/src/index.js';
import { processDailyForecastItem } from '../utils/weatherUtils.js';
import { BiDirectionalPriorityQueue } from '../../lib/src/index.js';
import { convertTemperature } from '../utils/weatherUtils.js';

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
    dayElements.forEach(el => weatherContainer.appendChild(el));
    const tempQueue = new BiDirectionalPriorityQueue();

    weather.DailyForecasts.forEach((day) => {
        const rawTemp = day.Temperature.Maximum?.Value;
        const convertedTemp = convertTemperature(rawTemp, 'F', currentUnit);
        const date = new Date(day.Date).toLocaleDateString();
        tempQueue.enqueue({ type: 'day', date }, convertedTemp);
    });

    function displayDailyExtremes(hottestDay, coldestDay, unit) {
    const section = document.getElementById('daily-summary-section');
    section.style.display = 'block';
    section.innerHTML = `
        <h3>The warmest day: ${hottestDay.item.date}, ${hottestDay.priority}°${unit}</h3>
        <h3>The coldest day: ${coldestDay.item.date}, ${coldestDay.priority}°${unit}</h3>
    `;
    }

    if (!tempQueue.isEmpty()) {
        const hottest = tempQueue.peek({ highest: true });
        const coldest = tempQueue.peek({ lowest: true });
        displayDailyExtremes(hottest, coldest, currentUnit);
    }

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
