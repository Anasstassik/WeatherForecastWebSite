import { getCurrentUnit } from './temperatureUnit.js';
import { getWeatherIcon } from './api.js'; 
import { eventBus } from './eventBus.js';

const hourlyWeatherContainer = document.querySelector('.weather-12hours');
let latestHourlyData = null;

export async function display12HourWeather(hourlyForecastsData) {
    if (!hourlyWeatherContainer) {
        console.error("Element.weather-12hours wasn't found.");
        return;
    }

    if (!hourlyForecastsData || !Array.isArray(hourlyForecastsData) || hourlyForecastsData.length === 0) {
        hourlyWeatherContainer.innerHTML = "<p class='empty-message-hourly'>Data about hourly forecast is absent.</p>";
        return;
    }

    latestHourlyData = hourlyForecastsData; 

    const currentDisplayUnit = getCurrentUnit();
    hourlyWeatherContainer.innerHTML = ''; 

    const titleElement = document.createElement('h3');
    titleElement.className = 'hourly-forecast-title';
    titleElement.textContent = 'Weather for nearly 12 hours.';
    hourlyWeatherContainer.appendChild(titleElement);

    const forecastList = document.createElement('div');
    forecastList.className = 'hourly-forecast-list';
    hourlyWeatherContainer.appendChild(forecastList);

    const hourElements = await Promise.all(hourlyForecastsData.map(async (hourData) => {
        const dateTimeString = hourData.DateTime;
        const iconPhrase = hourData.IconPhrase || "N/A"; 
        const weatherIcon = hourData.WeatherIcon; 
        const iconNumberString = String(weatherIcon).padStart(2, '0');
        const iconUrl = await getWeatherIcon(iconNumberString);

        let temperatureApiValue = hourData.Temperature ? hourData.Temperature.Value : null;
        const temperatureApiUnit = hourData.Temperature ? hourData.Temperature.Unit : "";

        let displayTemp;
        let displayUnitChar = currentDisplayUnit;

        if (temperatureApiValue !== null) {
            temperatureApiValue = Math.round(parseFloat(temperatureApiValue)); 
            if (currentDisplayUnit === 'C' && temperatureApiUnit === 'F') {
                displayTemp = Math.round(((temperatureApiValue - 32) * 5) / 9);
            } else if (currentDisplayUnit === 'F' && temperatureApiUnit === 'C') {
                displayTemp = Math.round((temperatureApiValue * 9) / 5 + 32);
            } else {
                displayTemp = temperatureApiValue; 
            }
        } else {
            displayTemp = "N/A";
            displayUnitChar = ""; 
        }

        const formattedTime = dateTimeString
            ? new Date(dateTimeString).toLocaleTimeString("en-US", {
                  hour: '2-digit',
                  minute: '2-digit'
              })
            : "N/A";
        
        const hourElement = document.createElement('div');
        hourElement.className = 'weather-hour-item';
        hourElement.innerHTML = `
            <div class="hour-time">${formattedTime}</div>
            <img src="${iconUrl}" alt="${iconPhrase}" class="hour-weather-icon" title="${iconPhrase}">
            <div class="hour-iconphrase">${iconPhrase}</div>
            <div class="hour-temp">${displayTemp}${displayTemp !== "N/A" ? '°' + displayUnitChar : ''}</div>
        `;
        return hourElement;
    }));

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
