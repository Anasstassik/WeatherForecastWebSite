import {getWeatherIcon} from './api'
import { getCurrentUnit } from './temperatureUnit.js';
import { eventBus } from '../lib/src/index.js';

let weather = null;

export async function updateTemperatureDisplay(weatherData) {
    if (!weatherData) return;

    weather = weatherData;
    const currentUnit = getCurrentUnit();

    const weatherContainer = document.querySelector('.weather-5days');
    weatherContainer.innerHTML = '';

    const dayElements = await Promise.all(
        weather.DailyForecasts.map(async (day) => {
            const date = new Date(day.Date);
            let minTemp, maxTemp;

            if (currentUnit === 'C') {
                minTemp = Math.round(((day.Temperature.Minimum.Value - 32) * 5) / 9);
                maxTemp = Math.round(((day.Temperature.Maximum.Value - 32) * 5) / 9);
            } else {
                minTemp = Math.round(day.Temperature.Minimum.Value);
                maxTemp = Math.round(day.Temperature.Maximum.Value);
            }

            const iconUrl = await getWeatherIcon(day.Day.Icon);

            const dayElement = document.createElement('div');
            dayElement.className = 'weather-day';
            dayElement.innerHTML = `
                <h3>${date.toLocaleDateString("en-GB", { weekday: "short" })}</h3>
                <div class="date">${date.toLocaleDateString("en-GB", { month: "long", day: "numeric" })}</div>
                <img src="${iconUrl}" alt="Weather icon" class="weather-icon"/>
                <div class="temp-max">${maxTemp}°${currentUnit}</div>
                <div class="temp-min">${minTemp}°${currentUnit}</div>
            `;
            return dayElement;
        })
    );

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
