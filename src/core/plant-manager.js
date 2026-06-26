"use strict";

const { HashTable } = require("../structures/hash_table");
const { AVLTree } = require("../structures/avl_tree");
const { Graph } = require("../structures/graph");
const { bfs } = require("../algorithm/bfs");
const { quickSort } = require("../algorithm/sort");

class PlantCareManager {
    constructor() {
        this.plants = new HashTable();
        this.byNextCareDate = new AVLTree();
        this.byComplexity = new AVLTree();
        this.compatGraph = new Graph(false);
        this.careSeqGraph = new Graph(true);
    }

    addPlant(plant) {
        if (this.plants.find(plant.id)) throw new Error("Растение уже существует");
        this.plants.insert(plant.id, plant);
        this.byNextCareDate.insert(plant.nextCareDate, plant.id);
        this.byComplexity.insert(plant.complexity, plant.id);
        this.compatGraph.addVertex(plant.id);
        this.careSeqGraph.addVertex(plant.id);
    }

    addRelation(id1, id2, type = "compatible", weight = 1) {
        if (type === "compatible" || type === "conflict") {
            this.compatGraph.addEdge(id1, id2, weight);
        } else if (type === "care_sequence") {
            this.careSeqGraph.addEdge(id1, id2, weight);
        }
    }

    getDailyTasks(today = new Date()) {
        const todayStr = today.toISOString().split("T")[0];
        const candidates = [];

        for (const [dateStr, id] of this.byNextCareDate.inOrder()) {
            if (dateStr <= todayStr) {
                const plant = this.plants.find(id);
                if (plant) candidates.push(plant);
            } else break;
        }

        if (candidates.length === 0) return [];

        const score = (p) => {
            const delayDays = Math.max(0, todayStr.localeCompare(p.nextCareDate) * -1);
            return delayDays * 0.5 + (1 / p.complexity) * 0.3 + p.healthIndex * 0.2;
        };

        return quickSort(candidates, (a, b) => score(b) - score(a));
    }

    findCareRoute(fromId, toId) {
        return bfs(this.careSeqGraph, fromId, toId);
    }

    checkCompatibility(plantId) {
        const neighbors = this.compatGraph.getNeighbors(plantId);
        const conflicts = [],
            compatibles = [];
        for (const { node: nid, weight } of neighbors) {
            if (weight < 0) conflicts.push(nid);
            else compatibles.push(nid);
        }
        return { conflicts, compatibles };
    }

    generateReport() {
        const allPlants = this.plants.values();
        const now = Date.now();
        const urgency = (p) => {
            const plantTime = new Date(p.nextCareDate + "T00:00:00").getTime();
            return Math.max(0, (now - plantTime) / 864e5);
        };
        return quickSort([...allPlants], (a, b) => urgency(b) - urgency(a));
    }
}

module.exports = { PlantCareManager };
