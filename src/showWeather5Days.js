import { getCurrentUnit } from './temperatureUnit.js';

let weather = null;

export function updateTemperatureDisplay(weatherData) {
    if (!weatherData) return;

    weather = weatherData;
    const currentUnit = getCurrentUnit();

    const weatherContainer = document.querySelector('.weather-5days');
    weatherContainer.innerHTML = '';

    weather.DailyForecasts.forEach((day) => {
        const date = new Date(day.Date);
        let minTemp, maxTemp;

        if (currentUnit === 'C') {
            minTemp = Math.round(((day.Temperature.Minimum.Value - 32) * 5) / 9);
            maxTemp = Math.round(((day.Temperature.Maximum.Value - 32) * 5) / 9);
        } else {
            minTemp = Math.round(day.Temperature.Minimum.Value);
            maxTemp = Math.round(day.Temperature.Maximum.Value);
        }

        const dayElement = document.createElement('div');
        dayElement.className = 'weather-day';
        dayElement.innerHTML = `
        <h3>${date.toLocaleDateString("en-GB", { weekday: "short" })}</h3>
        <div class="date">${date.toLocaleDateString("en-GB", { month: "long", day: "numeric" })}</div>
        <div class="temp">${minTemp}°${currentUnit} / ${maxTemp}°${currentUnit}</div>
        `;
        weatherContainer.appendChild(dayElement);
    });
}
