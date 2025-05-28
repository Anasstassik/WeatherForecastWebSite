import { getWeather, getWeatherIcon } from './api.js';
import { getCurrentUnit } from './utils/temperatureUnit.js';
import { eventBus } from '../lib/src/index.js';
import { createElement } from './domUtils.js'; 
import { undefinedCityKey, topCitiesData } from './constants/appConstants.js';

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

    const dayElement = createElement('div', {
        classes: 'top-city-forecast-day',
        children: [
            createElement('div', {
                classes: 'top-city-forecast-date',
                textContent: date.toLocaleDateString("en-GB", { weekday: "short" })
            }),
            createElement('img', {
                classes: 'top-city-forecast-icon',
                attributes: { src: iconUrl, alt: 'Weather' }
            }),
            createElement('div', {
                classes: 'top-city-forecast-temp',
                children: [
                    createElement('span', { classes: 'temp-max', textContent: `${maxTemp}°` }),
                    document.createTextNode(' / '),
                    createElement('span', { classes: 'temp-min', textContent: `${minTemp}°${unit}` })
                ]
            })
        ]
    });
    return dayElement;
}

async function createCityCard(city) {
    const cityImage = createElement('img', {
        classes: 'top-city-image',
        attributes: { src: `/images/top-cities/${city.imageName}`, alt: city.name }
    });

    const cityName = createElement('h3', {
        classes: 'top-city-name',
        textContent: city.name
    });

    const forecastContainer = createElement('div', {
        classes: ['top-city-weather-forecast', 'js-forecast-container']
    });

    const card = createElement('div', {
        classes: 'top-city-card',
        children: [cityImage, cityName, forecastContainer]
    });

    if (city.key === undefinedCityKey) {
        return card;
    }

    forecastContainer.appendChild(
        createElement('p', { classes: 'loading-text', textContent: 'Loading weather...' })
    );


    try {
        const weatherData = await getWeather(city.key);
        
        if (weatherData && weatherData.DailyForecasts && weatherData.DailyForecasts.length > 0) {
            forecastContainer.innerHTML = ''; 
            const currentUnit = getCurrentUnit();
            const forecastElementsPromises = weatherData.DailyForecasts.map(day => 
                createForecastDayElement(day, currentUnit)
            );
            const forecastElements = await Promise.all(forecastElementsPromises);
            forecastElements.forEach(el => forecastContainer.appendChild(el));
        } else {
            forecastContainer.innerHTML = '';
            forecastContainer.appendChild(
                createElement('p', { classes: 'error-text', textContent: 'Weather data unavailable.' })
            );
        }
    } catch (error) {
        console.error(`Error fetching weather for ${city.name}:`, error);
        forecastContainer.innerHTML = ''; 
        forecastContainer.appendChild(
            createElement('p', { classes: 'error-text', textContent: 'Failed to load weather.' })
        );
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

    for (const city of topCitiesData) {
        const cityCardElement = await createCityCard(city);
        gridContainer.appendChild(cityCardElement);
    }
}

export async function updateTopCitiesTemperature() {
    const gridContainer = document.querySelector('.js-top-cities-grid');
    if (!gridContainer) return;

    const currentUnit = getCurrentUnit();

    for (let i = 0; i < topCitiesData.length; i++) {
        const city = topCitiesData[i];
        if (city.key === undefinedCityKey) {
            continue; 
        }
        const cityCardElement = gridContainer.children[i];
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
            const forecastElementsPromises = weatherData.DailyForecasts.map(day => 
                createForecastDayElement(day, currentUnit)
            );
            const forecastElements = await Promise.all(forecastElementsPromises);
            forecastElements.forEach(el => forecastContainer.appendChild(el));
        }
    }
}

eventBus.on('unit-changed', () => {
    updateTopCitiesTemperature();
});
