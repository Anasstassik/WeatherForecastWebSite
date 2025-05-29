import { getWeatherIcon } from '../api.js';

export function convertTemperature(value, sourceUnit, targetUnit) {
    if (value === null || value === undefined || String(value).trim() === "" || String(value).toLowerCase() === "n/a") {
        return null;
    }
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
        return null;
    }

    if (targetUnit === 'C') {
        if (sourceUnit === 'F') {
            return Math.round(((numericValue - 32) * 5) / 9);
        } else if (sourceUnit === 'C') {
            return Math.round(numericValue);
        }
    } else if (targetUnit === 'F') {
        if (sourceUnit === 'C') {
            return Math.round((numericValue * 9) / 5 + 32);
        } else if (sourceUnit === 'F') {
            return Math.round(numericValue);
        }
    }
   
    console.warn(`Unexpected units for conversion: value=${value}, source=${sourceUnit}, target=${targetUnit}. Returning rounded original value.`);
    return Math.round(numericValue);
}

export async function processDailyForecastItem(dayData, displayUnit) {
    const date = new Date(dayData.Date);
    const sourceApiUnit = 'F'; 

    const minTemp = convertTemperature(dayData.Temperature.Minimum.Value, sourceApiUnit, displayUnit);
    const maxTemp = convertTemperature(dayData.Temperature.Maximum.Value, sourceApiUnit, displayUnit);

    const iconUrl = await getWeatherIcon(dayData.Day.Icon);

    return {
        dateObj: date, 
        dayShort: date.toLocaleDateString("en-GB", { weekday: "short" }),
        dateFull: date.toLocaleDateString("en-GB", { month: "long", day: "numeric" }),
        minTemp,
        maxTemp,
        iconUrl,
        displayUnit
    };
}

export async function processHourlyForecastItem(hourData, displayUnit) { 
    const apiTempValue = hourData.Temperature ? hourData.Temperature.Value : null;
    const sourceApiUnit = hourData.Temperature ? hourData.Temperature.Unit : "";

    const temp = convertTemperature(apiTempValue, sourceApiUnit, displayUnit);

    const iconNumberString = String(hourData.WeatherIcon); 
    const iconUrl = await getWeatherIcon(iconNumberString);
    const iconPhrase = hourData.IconPhrase || "N/A";

    const formattedTime = hourData.DateTime
        ? new Date(hourData.DateTime).toLocaleTimeString("en-US", {
              hour: '2-digit',
              minute: '2-digit'
          })
        : "N/A";

    return {
        time: formattedTime,
        temp,
        iconUrl,
        iconPhrase,
        displayUnit
    };
}