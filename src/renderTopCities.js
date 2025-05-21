import { getWeather, getWeatherIcon } from './api.js';
import { getCurrentUnit } from './temperatureUnit.js';
import { eventBus } from './eventBus.js';

const undef_key = '294021';

const TOP_CITIES = [
    { name: 'New York', key: '349727', imageName: 'new-york.jpg' },
    { name: 'London', key: '328328', imageName: 'london.jpeg' },
    { name: 'Tokyo', key: '226396', imageName: 'tokyo.jpeg' },
    { name: 'Undefined', key: undef_key, imageName: 'moscow.jpg' },
    { name: 'Delhi', key: '202396', imageName: 'delhi.jpg' },
    { name: 'Sydney', key: '22889', imageName: 'sydney.jpg' },
    { name: 'Istanbul', key: '318251', imageName: 'istanbul.jpg' },
    { name: 'Paris', key: '623', imageName: 'paris.jpg' },
    { name: 'Toronto', key: '55488', imageName: 'toronto.jpg' },
    { name: 'São Paulo', key: '45881', imageName: 'sao-paulo.jpg' },
    { name: 'Kyiv', key: '324505', imageName: 'kyiv.jpg' },
    { name: 'Lviv', key: '324561', imageName: 'lviv.png' },
];

async function createForecastDayElement(dayData, unit) {
    const date = new Date(dayData.Date);
    let minTemp, maxTemp;

    if (unit === 'C') {
        minTemp = Math.round(((dayData.Temperature.Minimum.Value - 32) * 5) / 9);
        maxTemp = Math.round(((dayData.Temperature.Maximum.Value - 32) * 5) / 9);
    } else {
        minTemp = Math.round(dayData.Temperature.Minimum.Value);
        maxTemp = Math.round(dayData.Temperature.Maximum.Value);
    }

    const iconUrl = await getWeatherIcon(dayData.Day.Icon);

    const dayElement = document.createElement('div');
    dayElement.className = 'top-city-forecast-day';
    dayElement.innerHTML = `
        <div class="top-city-forecast-date">${date.toLocaleDateString("en-GB", { weekday: "short" })}</div>
        <img src="${iconUrl}" alt="Weather" class="top-city-forecast-icon"/>
        <div class="top-city-forecast-temp">
            <span class="temp-max">${maxTemp}°</span> / <span class="temp-min">${minTemp}°${unit}</span>
        </div>
    `;
    return dayElement;
}

async function createCityCard(city) {
    const card = document.createElement('div');
    card.className = 'top-city-card';

    card.innerHTML = `
        <img src="/images/top-cities/${city.imageName}" alt="${city.name}" class="top-city-image">
        <h3 class="top-city-name">${city.name}</h3>
        <div class="top-city-weather-forecast js-forecast-container">
            <p class="loading-text">Loading weather...</p>
        </div>
    `;
    const forecastContainer = card.querySelector('.js-forecast-container');

    if (city.key === undef_key) {
        forecastContainer.innerHTML = '';
        return card;
    }

    forecastContainer.innerHTML = '<p class="loading-text">Loading weather...</p>';

    try {
        const weatherData = await getWeather(city.key);
        
        if (weatherData && weatherData.DailyForecasts && weatherData.DailyForecasts.length > 0) {
            forecastContainer.innerHTML = ''; 
            const currentUnit = getCurrentUnit();
            const forecastElements = await Promise.all(
                weatherData.DailyForecasts.map(day => createForecastDayElement(day, currentUnit))
            );
            forecastElements.forEach(el => forecastContainer.appendChild(el));
        } else {
            forecastContainer.innerHTML = '<p class="error-text">Weather data unavailable.</p>';
        }
    } catch (error) {
        console.error(`Error fetching weather for ${city.name}:`, error);
        forecastContainer.innerHTML = '<p class="error-text">Failed to load weather.</p>';
    }
    return card;
}

export async function initTopCities() {
    const gridContainer = document.querySelector('.js-top-cities-grid');
    if (!gridContainer) {
        console.error('Top cities grid container not found!');
        return;
    }
    gridContainer.innerHTML = ''; 

    for (const city of TOP_CITIES) {
        const cityCardElement = await createCityCard(city);
        gridContainer.appendChild(cityCardElement);
    }
}

export async function updateTopCitiesTemperature() {
    const gridContainer = document.querySelector('.js-top-cities-grid');
    if (!gridContainer) return;

    const currentUnit = getCurrentUnit();

    for (let i = 0; i < TOP_CITIES.length; i++) {
        const city = TOP_CITIES[i];
        if (city.key === undef_key) {
            continue; 
        }
        const cityCardElement = gridContainer.children[i]
        if (!cityCardElement) continue;

        const forecastContainer = cityCardElement.querySelector('.js-forecast-container');
        if (!forecastContainer || 
            forecastContainer.querySelector('.loading-text') || 
            forecastContainer.querySelector('.error-text') ||
            forecastContainer.innerHTML.trim() === '') { 
            continue;
        }
        
        const weatherData = await getWeather(city.key); 
        if (weatherData && weatherData.DailyForecasts && weatherData.DailyForecasts.length > 0) {
            forecastContainer.innerHTML = '';
            const forecastElements = await Promise.all(
                weatherData.DailyForecasts.map(day => createForecastDayElement(day, currentUnit))
            );
            forecastElements.forEach(el => forecastContainer.appendChild(el));
        }
    }
}

eventBus.on('unit-changed', () => {
    updateTopCitiesTemperature();
});
