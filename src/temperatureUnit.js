let currentUnit = 'C';
const tempSwitch = document.querySelector(".temp-switch");
const units = document.querySelectorAll(".unit");

export function initTemperatureToggle(onUnitChange) {
    tempSwitch.addEventListener('change', () => {
        units.forEach(unit => unit.classList.toggle('active'));
        currentUnit = currentUnit === 'C' ? 'F' : 'C';
        onUnitChange(currentUnit);
    });
}

export function getCurrentUnit() {
    return currentUnit;
}