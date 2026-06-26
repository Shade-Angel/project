"use strict";
const fs = require("fs");
const path = require("path");

function saveToFile(manager, filePath = "./data.json") {
  const data = {
    plants: manager.plants.values(),
    relations: [],
    lastSaved: new Date().toISOString()
  };

  const extractCompatEdges = () => {
    const edges = [];
    const seen = new Set();
    
    for (const [u, neighbors] of manager.compatGraph.adjacency.entries()) {
      for (const { node: v, weight } of neighbors) {
        const edgeKey = [u, v].sort().join('->');
        
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey);
          edges.push({ 
            id1: u, 
            id2: v, 
            type: weight < 0 ? "conflict" : "compatible", 
            weight 
          });
        }
      }
    }
    return edges;
  };

  const extractCareSeqEdges = () => {
    const edges = [];
    
    for (const [u, neighbors] of manager.careSeqGraph.adjacency.entries()) {
      for (const { node: v, weight } of neighbors) {
        edges.push({ 
          id1: u, 
          id2: v, 
          type: "care_sequence", 
          weight 
        });
      }
    }
    return edges;
  };

  data.relations.push(...extractCompatEdges());
  data.relations.push(...extractCareSeqEdges());

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Данные сохранены в ${filePath}`);
  } catch (err) {
    console.error("Ошибка сохранения:", err.message);
  }
}

function loadFromFile(manager, filePath = "./data.json") {
  if (!fs.existsSync(filePath)) {
    console.log("Файл данных не найден. Запуск с чистого листа.");
    return;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    if (data.plants && Array.isArray(data.plants)) {
      let loadedCount = 0;
      for (const plant of data.plants) {
        try {
          manager.addPlant(plant);
          loadedCount++;
        } catch (e) {
          console.warn(`Пропущено растение ${plant.id}: ${e.message}`);
        }
      }
      console.log(`Загружено ${loadedCount} растений`);
    }

    if (data.relations && Array.isArray(data.relations)) {
      let relationsCount = 0;
      for (const rel of data.relations) {
        try {
          manager.addRelation(rel.id1, rel.id2, rel.type, rel.weight);
          relationsCount++;
        } catch (e) {
          console.warn(`Пропущена связь ${rel.id1}-${rel.id2}: ${e.message}`);
        }
      }
      console.log(`Восстановлено ${relationsCount} связей`);
    }

    console.log(`Данные загружены из ${filePath}`);
    
    if (data.lastSaved) {
      console.log(`Последнее сохранение: ${new Date(data.lastSaved).toLocaleString('ru-RU')}`);
    }
    
  } catch (err) {
    console.error("Ошибка чтения файла:", err.message);
    console.log("Файл будет создан заново при первом сохранении");
  }
}


function backupFile(filePath = "./data.json") {
  if (!fs.existsSync(filePath)) return;
  
  const backupPath = filePath.replace('.json', `.backup.${Date.now()}.json`);
  try {
    fs.copyFileSync(filePath, backupPath);
    console.log(`️ Резервная копия создана: ${backupPath}`);
  } catch (err) {
    console.error("Не удалось создать резервную копию:", err.message);
  }
}

module.exports = { saveToFile, loadFromFile, backupFile };