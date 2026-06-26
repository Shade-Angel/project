const { PlantCareManager } = require("../src/core/plant-manager");

const SIZES = [100, 500, 1000, 3000];
const REPEATS = 5;

function measureTimeMs(fn) {
    const start = process.hrtime.bigint();
    fn();
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000;
}

function generatePlants(count) {
    const names = ["Фикус", "Кактус", "Папоротник", "Орхидея", "Монстера", "Алоэ", "Сансевиерия"];
    const plants = [];
    for (let i = 0; i < count; i++) {
        const pastDays = Math.floor(Math.random() * 10);
        const careDate = new Date(Date.now() - pastDays * 86_400_000).toISOString().split("T")[0];

        plants.push({
            id: `plant_${i}`,
            name: `${names[i % names.length]} #${i}`,
            nextCareDate: careDate,
            complexity: Math.floor(Math.random() * 5) + 1,
            healthIndex: Math.floor(Math.random() * 100),
        });
    }
    return plants;
}

async function runPerformanceTests() {
    console.log("Запуск тестирования...\n");
    console.log("| N (растений) | Вставка (мс) | Поиск по ID (мс) | Очередь/Сортировка (мс) | BFS-маршрут (мс) |");
    console.log("|--------------|--------------|------------------|-------------------------|------------------|");

    for (const n of SIZES) {
        let tInsert = 0,
            tSearch = 0,
            tSort = 0,
            tBfs = 0;

        for (let run = 0; run < REPEATS; run++) {
            const manager = new PlantCareManager();
            const plants = generatePlants(n);

            tInsert += measureTimeMs(() => {
                plants.forEach((p) => manager.addPlant(p));
            });

            for (let i = 0; i < n - 1; i++) {
                manager.addRelation(plants[i].id, plants[i + 1].id, "care_sequence", 1);
            }

            const targetIdx = Math.floor(Math.random() * n);
            const targetId = plants[targetIdx].id;
            tSearch += measureTimeMs(() => {
                manager.plants.find(targetId);
            });

            tSort += measureTimeMs(() => {
                manager.getDailyTasks();
            });

            if (n >= 2) {
                const fromId = plants[0].id;
                const toId = plants[Math.min(n - 1, 15)].id;
                tBfs += measureTimeMs(() => {
                    manager.findCareRoute(fromId, toId);
                });
            }
        }

        const avgInsert = (tInsert / REPEATS).toFixed(2);
        const avgSearch = (tSearch / REPEATS).toFixed(3);
        const avgSort = (tSort / REPEATS).toFixed(2);
        const avgBfs = n >= 2 ? (tBfs / REPEATS).toFixed(2) : "—";

        console.log(
            `| ${String(n).padEnd(12)} | ${String(avgInsert).padEnd(12)} | ${String(avgSearch).padEnd(16)} | ${String(avgSort).padEnd(23)} | ${avgBfs.padEnd(16)} |`
        );
    }
}

runPerformanceTests().catch((err) => {
    console.error("Ошибка тестирования:", err);
    process.exit(1);
});

module.exports = { runPerformanceTests };
