"use strict";

class Graph {
	constructor(directed = false) {
		this.directed = directed;
		this.adjacency = new Map();
	}

	addVertex(v) {
		if (!this.adjacency.has(v)) {this.adjacency.set(v, []);}
	}

	removeVertex(v){
		if(!this.adjacency.has(v)){
			return;
		} else {
			for(const [u, neighbors] of this.adjacency.entries()){
				this.adjacency.set(u, neighbors.filter(edge => edge.node !== v));
			}
			this.adjacency.delete(v);
		}
	}

	addEdge(u, v, weight = 1) {
		this.addVertex(u);
		this.addVertex(v);
		this.adjacency.get(u).push({ node: v, weight });
		if (!this.directed) {this.adjacency.get(v).push({ node: u, weight });}
	}

	removeEdge(u, v) {
		const remove = (arr, target) => arr.filter((e) => e.node !== target);
		if (this.adjacency.has(u)) {this.adjacency.set(u, remove(this.adjacency.get(u), v));}
		if (!this.directed && this.adjacency.has(v)) {this.adjacency.set(v, remove(this.adjacency.get(v), u));}
	}

	getNeighbors(v) {
		return this.adjacency.get(v) || [];
	}

	hasVertex(v) {
		return this.adjacency.has(v);
	}
	getVertices() {
		return Array.from(this.adjacency.keys());
	}
}

module.exports = { Graph };
