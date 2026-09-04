const express = require("express");
const path = require("path");
const { exec } = require("child_process");
const { PlantCareManager } = require("./core/plant-manager");
const { loadFromFile, saveToFile } = require("./core/save");
const createHandlers = require("./control_Server/hadlingplant");
const { notFound, errorHandler } = require("./control_Server/exceptions/error_filter");
const logger = require("./control_Server/exceptions/logger");

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
	logger.info(`${req.method} ${req.url}`);
	next();
});

const manager = new PlantCareManager();

let isSea = false;

try{
	const sea = require("node:sea");
	isSea = sea.isSea();
} catch(e){
	console.log(e);
}

const baseDir = isSea ? path.dirname(process.execPath) : path.join(__dirname, '..');

const publicPath = path.join(baseDir, 'public');
app.use(express.static(publicPath));

logger.info("Сервер запускается");

const dataFile = path.join(baseDir, 'data.json');

async function startServer() {
	await loadFromFile(manager, dataFile);
	const handlers = createHandlers(manager, saveToFile, dataFile);

	app.post("/api/plants", handlers.addPlant);
	app.post("/api/relations", handlers.addRelation);
	app.post("/api/import", handlers.importData);
	app.delete("/api/plants/:id", handlers.removePlant);
	app.get("/api/schedule", handlers.getSchedule);
	app.get("/api/report", handlers.getReport);
	app.get("/api/route", handlers.route);
	app.get("/api/export", handlers.exportData);

	app.get("*", (req, res, next) => {
		if (req.path.startsWith("/api/")) {
			return next();
		}
		res.sendFile(path.join(publicPath, "index.html"));
	});

	app.use(notFound);
	app.use(errorHandler);

	const saveOnExit = async () => {
		await saveToFile(manager, dataFile);
		logger.info("Данные сохранены");
		process.exit(0);
	};
	process.on("SIGINT", saveOnExit);
	process.on("SIGTERM", saveOnExit);
	process.on("SIGQUIT", saveOnExit);
	process.on("uncaughtException", async (err) => {
		logger.error(`Ошибка: ${err.message}`, { stack: err.stack });
		await saveToFile(manager, dataFile);
		process.exit(1);
	});

	if (process.argv.includes("--test")) {
		const { runPerformanceTests } = require("../test/test");
		logger.info("Запуск тестов производительности");
		try {
			await runPerformanceTests();
			logger.info("Тестирование завершено!");
			process.exit(0);
		} catch (err) {
			logger.error(`Ошибка тестирования: ${err.message}`);
			process.exit(1);
		}
	} else if (process.argv.includes("--demo")) {
		const PORT = process.env.PORT || 0;
		const server = app.listen(PORT, async () => {
			const actualPort = server.address().port;
			logger.info(`Сервер запущен для демо на порту ${actualPort}`);
			try {
				const { runDemo } = require("../demo");
				await runDemo(actualPort);
				logger.info("Демо завершено успешно.");
			} catch (err) {
				logger.error(`Ошибка в демо: ${err.message}`);
			} finally {
				await saveToFile(manager, dataFile);
				server.close(() => process.exit(0));
			}
		});
	} else {
		const PORT = process.env.PORT || 3000;
		app.listen(PORT, () => {
			logger.info(`Web запущен: http://localhost:${PORT}`);
			logger.info(`Данные: ${dataFile}`);
			setTimeout(() => {
				const openCmd =
					process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
				exec(`${openCmd} http://localhost:${PORT}`);
			}, 1000);
		});
	}
}

startServer().catch((err) => {
	logger.error(`Не удалось запустить сервер: ${err.message}`);
	process.exit(1);
});