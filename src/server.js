const express = require("express");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const { PlantCareManager } = require("./core/plant-manager");
const { loadFromFile, saveToFile } = require("./core/save");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

const publicPath = process.pkg ? path.join(process.cwd(), "public") : path.join(__dirname, "../public");

app.use(express.static(publicPath));

const manager = new PlantCareManager();
const file = path.join(__dirname, "../data.json");

const dataFile = process.pkg ? path.join(process.cwd(), "data.json") : path.join(__dirname, "../data.json");

loadFromFile(manager, file);

const saveOnExit = () => {
	saveToFile(manager, dataFile);
	console.log("Данные сохранены");
	process.exit(0);
};


process.on("SIGINT", saveOnExit);
process.on("SIGTERM", saveOnExit);
process.on("SIGQUIT", saveOnExit);

process.on("uncaughtException", (err) => {
	console.error("Ошибка:", err.message);
	saveToFile(manager, dataFile);
	process.exit(1);
});


app.post("/api/plants", (req, res) => {
	try {
		manager.addPlant(req.body);
		res.json({ ok: true });
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
});


app.post("/api/relations", (req, res) => {
	try {
		manager.addRelation(req.body.id1, req.body.id2, req.body.type, req.body.weight);
		res.json({ ok: true });
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
});


app.post("/api/import", (req, res) => {
	try {
		const newData = req.body;
		const tempFile = dataFile + ".temp";
		fs.writeFileSync(tempFile, JSON.stringify(newData, null, 2));

		fs.renameSync(tempFile, dataFile);
		loadFromFile(manager, dataFile);

		res.json({ ok: true, message: "Данные импортированы" });
	} catch (e) {
		res.status(400).json({ error: e.message });
	}
});


app.delete("/api/plants/:id", (req, res) => {
	console.log(`DELETE /api/plants/${req.params.id} received`);
	try{
		const id = req.params.id;
		manager.removePlant(id);
		saveToFile(manager, dataFile);
		res.json({ok: true});
	}catch(e){
		res.status(400).json({error: e.message});
	}
});


app.get("/api/schedule", (req, res) => {
	const tasks = manager.getDailyTasks();
	res.json(tasks);
});


app.get("/api/report", (req, res) => res.json(manager.generateReport()));


app.get("/api/route", (req, res) => {
	const { from, to } = req.query;
	res.json(manager.findCareRoute(from, to));
});


app.get("/api/export", (req, res) => {
	if (fs.existsSync(dataFile)) {
		res.download(dataFile, "plant-data.json");
	} else {
		res.status(404).json({ error: "Файл данных не найден" });
	}
});



app.get("*", (req, res) => {
	res.sendFile(path.join(publicPath, "index.html"));
});


if (process.argv.includes("--test")) {
	const { runPerformanceTests } = require("../test/test");
	console.log("");
	console.log("");
	runPerformanceTests()
		.then(() => {
			console.log("");
			console.log("Тестирование завершено!");
			console.log("");
			process.exit(0);
		})
		.catch((err) => {
			console.log("");
			console.error("Ошибка тестирования:", err);
			console.log("");
			process.exit(1);
		});
} else if (process.argv.includes("--demo")) {
	const PORT = process.env.PORT || 0;
	const server = app.listen(PORT, async () => {
		const actualPort = server.address().port;
		console.log(`Сервер запущен для демо на порту ${actualPort}`);
		try {
			const { runDemo } = require("../demo");
			await runDemo(actualPort);
			console.log("Демо завершено успешно.");
		} catch (err) {
			console.error("Ошибка в демо:", err);
		} finally {
			saveToFile(manager, dataFile);
			server.close(() => {
				process.exit(0);
			});
		}
	});
} else {
	const PORT = 3000;
	app.listen(PORT, () => {
		console.log("");
		console.log(`Web запущен: http://localhost:${PORT}`);
		console.log(`Данные: ${dataFile}`);

		setTimeout(() => {
			const openCmd =
				process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
			exec(`${openCmd} http://localhost:${PORT}`);
		}, 1000);
	});
}
