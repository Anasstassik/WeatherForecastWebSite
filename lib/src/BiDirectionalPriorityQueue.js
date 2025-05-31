export class BiDirectionalPriorityQueue {
    constructor() {
        this._items = new Map();
        this._sorted = [];
        this._nextId = 0;
    }

    enqueue(item, priority) {
        if (typeof priority !== 'number' || isNaN(priority)) {
            console.warn('Невірний пріоритет. Елемент не додано.', item, priority);
            return;
        }

        const entry = { id: this._nextId++, item, priority };
        this._items.set(entry.id, entry);
        this._sorted.push(entry);
        this._sorted.sort((a, b) => a.priority - b.priority);
    }

    _removeById(id) {
        const entry = this._items.get(id);
        if (!entry) return null;
        this._items.delete(id);
        this._sorted = this._sorted.filter(e => e.id !== id);
        return entry.item;
    }

    peek({ highest = false, lowest = false } = {}) {
        if (this._sorted.length === 0) return null;
        if (highest) return this._sorted.at(-1);
        if (lowest) return this._sorted[0];
        return null;
    }


    dequeue({ highest = false, lowest = false } = {}) {
        if (this._sorted.length === 0) return null;
        const target = highest ? this._sorted.at(-1) : this._sorted[0];
        return this._removeById(target.id);
    }

    isEmpty() {
        return this._items.size === 0;
    }

    size() {
        return this._items.size;
    }

    clear() {
        this._items.clear();
        this._sorted = [];
    }
}
