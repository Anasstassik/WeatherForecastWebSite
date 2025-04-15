const tempSwitch = document.querySelector(".temp-switch");
const units = document.querySelectorAll(".unit");
let weather = null;

tempSwitch.addEventListener("change", () => {
    units.forEach(unit => unit.classList.toggle("active"));
});


const getCities = async (cityName) => {
    try {
        const response = await fetch(`/api/cities?q=${cityName}`);
        const cities = await response.json();
        return cities.slice(0, 5);
    } catch (error) {
        console.log('Error fetching cities :', error)
        return [];
    }
};

const getWeather = async (cityKey, cityName) => {
    try {
        const response = await fetch(`/api/weather/${cityKey}`);
        if (!response.ok) throw new Error('Network response was not ok');
        weather = await response.json();
    } catch (error) {
        console.error('Error fetching weather:', error);
        return;
    }

    const weatherContainer = document.querySelector('.weather-container');
    weatherContainer.style.display = 'block';
    
    let cityTitle = document.querySelector('.city-title');
    if (!cityTitle) {
        cityTitle = document.createElement('h2');
        cityTitle.className = 'city-title';
        weatherContainer.prepend(cityTitle);
    }
    cityTitle.textContent = `Weather in ${cityName}`;
  
    updateTemperature();
};

const cityInput = document.querySelector(".js-search-input");
const cityList = document.querySelector(".js-city-list");

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const handleInput = debounce(async () => {
    const query = cityInput.value.trim();
    cityList.innerHTML = "";

    if (query.length > 1) {
        const cities = await getCities(query);

        if (cities.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.classList.add("empty-message");
            emptyMessage.textContent = "No cities found";
            cityList.appendChild(emptyMessage);
        } else {
            cities.forEach(city => {
                const cityItem = document.createElement("div");
                cityItem.classList.add("cityList");
                cityItem.textContent = `${city.LocalizedName}, ${city.Country.LocalizedName}`;
                cityItem.dataset.key = city.Key;

                cityItem.addEventListener("click", async () => {
                    cityList.innerHTML = "";
                    await getWeather(city.Key, city.LocalizedName);
                  });
                cityList.appendChild(cityItem);
            });
        }
    } else {
        const weatherContainer = document.querySelector('.weather-container');
        weatherContainer.style.display = 'none';
    }
},400);

cityInput.addEventListener("input", handleInput);

let currentUnit = 'C';

function updateTemperature() {
    if (!weather) return;

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

tempSwitch.addEventListener('change', () => {
    units.forEach(unit => unit.classList.toggle('active'));
    
    currentUnit = currentUnit === 'C' ? 'F' : 'C';

    updateTemperature();
  });
