import { createCacheDecorator } from '../cache-decorator-lib/src/index.js';

export const getCities = async (cityName) => {
    try {
        const response = await fetch(`/api/cities?q=${cityName}`);
        const cities = await response.json();
        return cities.slice(0, 5);
    } catch (error) {
        console.log('Error fetching cities :', error);
        return [];
    }
};

export async function getWeatherIcon(iconCode) {
    const paddedCode = iconCode.toString().padStart(2, '0');
    return `https://developer.accuweather.com/sites/default/files/${paddedCode}-s.png`;
}
const fiveDayCache = createCacheDecorator();
const twelveHourCache = createCacheDecorator();

export const getWeather = fiveDayCache(async (cityKey) => { 
    try{
        const response = await fetch(`/api/weather/${cityKey}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
});

export const get12Weather = twelveHourCache(async (cityKey) => { 
    try{
        const response = await fetch(`/api/12weather/${cityKey}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching 12weather:', error);
        return null;
    }
});
