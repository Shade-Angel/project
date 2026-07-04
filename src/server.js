const express = require("express");
const path = require("path");
const { exec } = require("child_process");
const { PlantCareManager } = require("./core/plant-manager");
const { loadFromFile, saveToFile } = require("./core/save");

const createHandlers = require('./control_Server/hadlingplant');
const { notFound, errorHandler } = require("./control_Server/exceptions/error_filter");
const logger = require("./control_Server/exceptions/logger");

const app = express();
app.use(express.json({limit: '1mb'}));

app.use((req, res, next) => {
	logger.info(`${req.method} ${req.url}`);
	next();
});

const manager = new PlantCareManager();

const publicPath = process.pkg ? path.join(process.cwd(), "public") : path.join(__dirname, "../public");
app.use(express.static(publicPath));

logger.info('Сервер запустился');

const dataFile = process.pkg ? path.join(process.cwd(), "data.json") : path.join(__dirname, "../data.json");

loadFromFile(manager, dataFile);

const handlers = createHandlers(manager, saveToFile, dataFile);

const saveOnExit = () => {
	saveToFile(manager, dataFile);
	logger.info("Данные сохранены");
	process.exit(0);
};


process.on("SIGINT", saveOnExit);
process.on("SIGTERM", saveOnExit);
process.on("SIGQUIT", saveOnExit);

process.on("uncaughtException", (err) => {
	logger.error(`Ошибка: ${err.message}`, {stack: err.stack});
	saveToFile(manager, dataFile);
	process.exit(1);
});


app.post("/api/plants", handlers.addPlant);


app.post("/api/relations", handlers.addRelation);


app.post("/api/import", handlers.importData);

app.delete("/api/plants/:id", handlers.removePlant);

app.get("/api/schedule", handlers.getSchedule);

app.get("/api/report", handlers.getReport);

app.get("/api/route", handlers.route);

app.get("/api/export", handlers.exportData);

app.get("*", (req, res) => {
	res.sendFile(path.join(publicPath, "index.html"));
});


app.use(notFound);
app.use(errorHandler);

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
		logger.info(`Web запущен: http://localhost:${PORT}`);
		logger.info(`Данные: ${dataFile}`);

		setTimeout(() => {
			const openCmd =
				process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
			exec(`${openCmd} http://localhost:${PORT}`);
		}, 1000);
	});
}
