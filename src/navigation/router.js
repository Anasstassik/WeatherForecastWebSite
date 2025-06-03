import page from 'page';
import { showHomePage, showWeatherPage } from './spaNavigation.js';

page('/', () => {
  showHomePage();
});

page('/weather', () => {
  showWeatherPage();
});

export function initRouting() {
  page();
}
