export class BiDirectionalPriorityQueue {
    constructor() {
        this._items = new Map();
        this._sorted = [];
        this._nextId = 0;
    }

    enqueue(item, priority) {
        if (typeof priority !== 'number' || isNaN(priority)) {
            console.warn('Invalid priority. Element not added.', item, priority);
            return;
        }

        const entry = { id: this._nextId++, item, priority };
        this._items.set(entry.id, entry);
        let left =  0;
        let right = this._sorted.length;
        while (left - right) {
            const mid = Math.floor((left + right) / 2);
            if (this._sorted[mid].priority < priority) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        this._sorted.splice(left, 0, entry)
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
