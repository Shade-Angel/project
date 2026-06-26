"use strict";

class HashTable {
    constructor(initialCapacity = 101) {
        this.capacity = this._nextPrime(initialCapacity);
        this.table = new Array(this.capacity).fill(null);
        this.size = 0;
        this.loadFactorThreshold = 0.7;
    }

    _isPrime(n) {
        if (n < 2) return false;
        for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
        return true;
    }

    _nextPrime(n) {
        while (!this._isPrime(n)) n++;
        return n;
    }

    _hash1(key) {
        let h = 0;
        const s = String(key);
        for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
        return Math.abs(h) % this.capacity;
    }

    _hash2(key) {
        let h = 0;
        const s = String(key);
        for (let i = 0; i < s.length; i++) h += s.charCodeAt(i);
        return 1 + (h % (this.capacity - 2));
    }

    _resize() {
        const oldTable = this.table;
        this.capacity = this._nextPrime(this.capacity * 2 + 1);
        this.table = new Array(this.capacity).fill(null);
        this.size = 0;
        for (const cell of oldTable) {
            if (cell && !cell.deleted) this.insert(cell.key, cell.value);
        }
    }

    insert(key, value) {
        if (this.size / this.capacity >= this.loadFactorThreshold) this._resize();

        let i = 0;
        const h1 = this._hash1(key);
        const h2 = this._hash2(key);

        while (i < this.capacity) {
            const idx = (h1 + i * h2) % this.capacity;
            const cell = this.table[idx];

            if (cell === null || cell.deleted) {
                this.table[idx] = { key, value, deleted: false };
                this.size++;
                return true;
            }
            if (cell.key === key) {
                cell.value = value;
                return true;
            }
            i++;
        }
        return false;
    }

    find(key) {
        let i = 0;
        const h1 = this._hash1(key);
        const h2 = this._hash2(key);

        while (i < this.capacity) {
            const idx = (h1 + i * h2) % this.capacity;
            const cell = this.table[idx];
            if (cell === null) break;
            if (cell.key === key && !cell.deleted) return cell.value;
            i++;
        }
        return undefined;
    }

    delete(key) {
        let i = 0;
        const h1 = this._hash1(key);
        const h2 = this._hash2(key);

        while (i < this.capacity) {
            const idx = (h1 + i * h2) % this.capacity;
            const cell = this.table[idx];
            if (cell === null) break;
            if (cell.key === key && !cell.deleted) {
                cell.deleted = true;
                this.size--;
                return true;
            }
            i++;
        }
        return false;
    }

    values() {
        return this.table.filter((c) => c && !c.deleted).map((c) => c.value);
    }

    keys() {
        return this.table.filter((c) => c && !c.deleted).map((c) => c.key);
    }
}

module.exports = { HashTable };
