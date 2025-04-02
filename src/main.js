const cityName = "London";

const getCitites = async () => {
    const response = await fetch(`/api/cities?q=${cityName}`);
    const cities = await response.json();
    return cities[0];
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

getCitites().then((city) => {
    console.log(`Weather in ${city.LocalizedName}:`);
    return getWeather(city.Key);
});
