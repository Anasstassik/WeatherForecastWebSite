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

const cacheWeather = createCacheDecorator();

export const getWeather = cacheWeather(async (cityKey) => {
    try{
        const response = await fetch(`/api/weather/${cityKey}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather:', error);
        return null;
    }
});
