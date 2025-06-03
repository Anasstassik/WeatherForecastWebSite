import { getWeather } from '../api.js';
import { getCurrentUnit } from '../utils/temperatureUnit.js';
import { eventBus } from '../../lib/src/index.js';
import { createElement } from '../utils/domUtils.js'; 
import { undefinedCityKey, topCitiesData } from '../constants/appConstants.js';
import { processDailyForecastItem } from '../utils/weatherUtils.js';

async function createForecastDayElement(rawDayData, displayUnit) {
    const processedDay = await processDailyForecastItem(rawDayData, displayUnit);

    const dayElement = createElement('div', {
        classes: 'top-city-forecast-day',
        children: [
            createElement('div', { 
                classes: 'top-city-forecast-date',
                textContent: processedDay.dayShort 
            }),
            createElement('img', {
                classes: 'top-city-forecast-icon',
                attributes: { src: processedDay.iconUrl, alt: 'Weather' }
            }),
            createElement('div', {
                classes: 'top-city-forecast-temp',
                children: [
                    createElement('span', { classes: 'temp-max', textContent: `${processedDay.maxTemp}°` }),
                    document.createTextNode(' / '),
                    createElement('span', { classes: 'temp-min', textContent: `${processedDay.minTemp}°${processedDay.displayUnit}` })
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
    if (location.pathname === '/' || location.pathname === '/home') { 
        updateTopCitiesTemperature();
    }
});