import { getCurrentUnit } from './temperatureUnit.js';

export function display12HourWeather(hourlyForecastsData) {
    const hourlyWeatherContainer = document.querySelector('.weather-12hours');

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

    hourlyForecastsData.forEach((hourData) => {
        const dateTimeString = hourData.DateTime;
        const iconPhrase = hourData.IconPhrase || "N/A"; 
        const weatherIcon = hourData.WeatherIcon; 
        
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
            ? new Date(dateTimeString).toLocaleTimeString("ru-RU", {
                  hour: '2-digit',
                  minute: '2-digit'
              })
            : "N/A";
        
        const iconNumberString = String(weatherIcon).padStart(2, '0'); 

        const hourElement = document.createElement('div');
        hourElement.className = 'weather-hour-item';
        hourElement.innerHTML = `
            <div class="hour-time">${formattedTime}</div>
            <img src="https://developer.accuweather.com/sites/default/files/${iconNumberString}-s.png" alt="${iconPhrase}" class="hour-weather-icon" title="${iconPhrase}">
            <div class="hour-iconphrase">${iconPhrase}</div>
            <div class="hour-temp">${displayTemp}${displayTemp !== "N/A" ? '°' + displayUnitChar : ''}</div>
        `;
        forecastList.appendChild(hourElement);
    });
}
