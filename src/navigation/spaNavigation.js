const homeWrapper = document.querySelector('.home-page-wrapper');
const weatherContainer = document.querySelector('.weather-container');
const hourlySummary = document.getElementById('hourly-summary-section');
const dailySummary = document.getElementById('daily-summary-section');
const backToHomeBtn = document.querySelector('.back-to-home-btn');
const topCitiesSection = document.querySelector('.top-cities-section');
const cityList = document.querySelector('.js-city-list');

export function showHomePage() {
  homeWrapper.style.display = 'block';
  weatherContainer.style.display = 'none';
  hourlySummary.style.display = 'none';
  dailySummary.style.display = 'none';
  backToHomeBtn.style.display = 'none';
  topCitiesSection.style.display = 'block';
  cityList.classList.add('hidden');
}

export function showWeatherPage() {
  homeWrapper.style.display = 'none';
  weatherContainer.style.display = 'block';
  hourlySummary.style.display = 'block';
  dailySummary.style.display = 'block';
  backToHomeBtn.style.display = 'inline-block';
  topCitiesSection.style.display = 'none';
  cityList.classList.add('hidden');
}
