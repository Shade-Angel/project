function bfs(graph, start, target) {
    if (!graph.hasVertex(start) || !graph.hasVertex(target)) return null;
    if (start === target) return [start];

    const queue = [[start]];
    const visited = new Set([start]);

    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];

        for (const edge of graph.getNeighbors(current)) {
            if (!visited.has(edge.node)) {
                visited.add(edge.node);
                const newPath = [...path, edge.node];
                if (edge.node === target) return newPath;
                queue.push(newPath);
            }
        }
    }
    return null;
}

module.exports = { bfs };
