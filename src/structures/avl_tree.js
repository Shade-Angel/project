"use strict";

class AVLNode {
    constructor(key, value) {
        this.key = key;
        this.values = [value];
        this.left = this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    _height(node) {
        return node ? node.height : 0;
    }
    _balanceFactor(node) {
        return node ? this._height(node.left) - this._height(node.right) : 0;
    }

    _rotateRight(y) {
        const x = y.left;
        const T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = Math.max(this._height(y.left), this._height(y.right)) + 1;
        x.height = Math.max(this._height(x.left), this._height(x.right)) + 1;
        return x;
    }

    _rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = Math.max(this._height(x.left), this._height(x.right)) + 1;
        y.height = Math.max(this._height(y.left), this._height(y.right)) + 1;
        return y;
    }

    insert(key, value) {
        this.root = this._insertRec(this.root, key, value);
    }

    _insertRec(node, key, value) {
        if (!node) return new AVLNode(key, value);
        if (key < node.key) node.left = this._insertRec(node.left, key, value);
        else if (key > node.key) node.right = this._insertRec(node.right, key, value);
        else {
            node.values.push(value);
            return node;
        } 

        node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
        const balance = this._balanceFactor(node);

        if (balance > 1 && key < node.left.key) return this._rotateRight(node);

        if (balance < -1 && key > node.right.key) return this._rotateLeft(node);

        if (balance > 1 && key > node.left.key) {
            node.left = this._rotateLeft(node.left);
            return this._rotateRight(node);
        }

        if (balance < -1 && key < node.right.key) {
            node.right = this._rotateRight(node.right);
            return this._rotateLeft(node);
        }

        return node;
    }

    inOrder() {
        const result = [];
        this._inOrderRec(this.root, result);
        return result;
    }

    _inOrderRec(node, arr) {
        if (!node) return;
        this._inOrderRec(node.left, arr);
        node.values.forEach((v) => arr.push([node.key, v]));
        this._inOrderRec(node.right, arr);
    }
}

module.exports = { AVLTree };
