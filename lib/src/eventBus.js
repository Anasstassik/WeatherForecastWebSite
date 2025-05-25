export class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = new Set();
        }
        this.listeners[event].add(callback);
        return () => this.off(event, callback); 
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].delete(callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

export const eventBus = new EventBus();
