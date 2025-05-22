export function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    if (options.classes) {
        const classesToAdd = Array.isArray(options.classes) ? options.classes : [options.classes];
        element.classList.add(...classesToAdd.filter(c => c));
    }

    if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
            element.setAttribute(key, value);
        }
    }

    if (options.textContent) {
        element.textContent = options.textContent;
    }

    if (options.children && options.children.length > 0) {
        options.children.forEach(child => {
            if (child instanceof HTMLElement || child instanceof Text) {
                element.appendChild(child);
            }
        });
    }

    if (options.dataset) {
        for (const [key, value] of Object.entries(options.dataset)) {
            element.dataset[key] = value;
        }
    }

    if (options.style) {
        for (const [key, value] of Object.entries(options.style)) {
            element.style[key] = value;
        }
    }

    if (options.on) {
        for (const [eventType, handler] of Object.entries(options.on)) {
            element.addEventListener(eventType, handler);
        }
    }

    return element;
}