const tempSwitch = document.querySelector(".temp-switch");
const units = document.querySelectorAll(".unit");

tempSwitch.addEventListener("change", () => {
    units.forEach(unit => unit.classList.toggle("active"));
});


const getCities = async (cityName) => {
    const response = await fetch(`/api/cities?q=${cityName}`);
    const cities = await response.json();
    return cities.slice(0, 5);
};

const getWeather = async (cityKey) => {
    const response = await fetch(`/api/weather/${cityKey}`);
    const weather = await response.json();

    weather.DailyForecasts.forEach((day) => {
        const date = new Date(day.Date);
        const options = {
            weekday: "long",
            month: "long",
            day: "numeric",
        };
        const minTempC = Math.round(
            ((day.Temperature.Minimum.Value - 32) * 5) / 9
        );
        const maxTempC = Math.round(
            ((day.Temperature.Maximum.Value - 32) * 5) / 9
        );

        console.log(
            `${date.toLocaleDateString(
                "en-GB",
                options
            )}: ${minTempC}°C - ${maxTempC}°C`
        );
    });
    return weather;
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
                    console.log(`Weather in ${city.LocalizedName}:`);
                    cityList.innerHTML = "";
                    await getWeather(city.Key);
                });
                cityList.appendChild(cityItem);
            });
        }
    }
},400);

cityInput.addEventListener("input", handleInput);
