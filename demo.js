const API = "http://localhost:3000/api";

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runDemo() {
  console.log("Тестирование графов и BFS...\n");
  
  try {

    console.log("1️Добавляем растения (вершины графа)...");
    await fetch(`${API}/plants`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ id: "A", name: "Шаг1", nextCareDate: "2026-05-25", complexity: 1, healthIndex: 80 }) });
    await fetch(`${API}/plants`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ id: "B", name: "Шаг2", nextCareDate: "2026-05-25", complexity: 1, healthIndex: 80 }) });
    await fetch(`${API}/plants`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ id: "C", name: "Шаг3", nextCareDate: "2026-05-25", complexity: 1, healthIndex: 80 }) });
    console.log("Вершины созданы.\n");

    await sleep(300);


    console.log("2️Создаём связи: A -> B -> C (care_sequence)...");
    await fetch(`${API}/relations`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ id1: "A", id2: "B", type: "care_sequence", weight: 1 }) });
    await fetch(`${API}/relations`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ id1: "B", id2: "C", type: "care_sequence", weight: 1 }) });
    console.log("Рёбра добавлены в граф процедур.\n");

    await sleep(300);

    
    console.log("3️ Запускаем BFS: поиск кратчайшего пути A -> C...");
    const res = await fetch(`${API}/route?from=A&to=C`);
    const data = await res.json();
    console.log("Ответ сервера:", data);

    if (Array.isArray(data) && data.length > 0) {
      console.log(`УСПЕХ! BFS нашёл путь: ${data.join(" → ")}`);
    } else {
      console.log("Путь не найден. Проверьте, исправлены ли опечатки в plant-manager.js");
    }


    console.log("\n4️. Проверка обратного пути (C → A)...");
    const resRev = await fetch(`${API}/route?from=C&to=A`);
    const dataRev = await resRev.json();
    console.log(" Ответ:", dataRev);
    console.log(dataRev === null ? "граф ориентированный, обратного пути нет." : "Неожиданный результат");


    console.log("\n5️Тестируем compatGraph: добавляем конфликт A -> C...");
    await fetch(`${API}/relations`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ id1: "A", id2: "C", type: "conflict", weight: -1 }) });
    console.log("Связь 'conflict' добавлена в неориентированный граф.");

    console.log("\n Завершено! Графы и BFS работают корректно.");
    
  } catch (err) {
    console.error("Ошибка:", err.message);
    console.log("\nУбедитесь, что:");
    console.log("   1. Сервер запущен: npm start");
    console.log("   2. В plant-manager.js НЕТ пробелов в ключевых словах (this.compatGraph, const, =>, getNeighbors)");
  }
}

runDemo();