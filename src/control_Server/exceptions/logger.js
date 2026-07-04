const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, '../../..');
const logRoot = process.pkg ? process.cwd() : projectRoot;
const logDirName = path.join(logRoot, 'logs');
if (!fs.existsSync(logDirName)) {
	fs.mkdirSync(logDirName, { recursive: true });
}

const now = new Date();
const dateStr =
	now.getFullYear() +
	"-" +
	String(now.getMonth() + 1).padStart(2, "0") +
	"-" +
	String(now.getDate()).padStart(2, "0") +
	"_" +
	String(now.getHours()).padStart(2, "0") +
	"-" +
	String(now.getMinutes()).padStart(2, "0") +
	"-" +
	String(now.getSeconds()).padStart(2, "0");
const logFileName = `app_${dateStr}.log`;
const logFile = path.join(logDirName, logFileName);
const stream = fs.createWriteStream(logFile, { flags: "a" });

function rotateLogs(maxFiles = 10) {
	fs.readdir(logDirName, (err, files) => {
		if (err) {
			return;
		}
		const logFiles = files
			.filter((f) => f.startsWith("app_") && f.endsWith(".log"))
			.map((f) => ({ name: f, path: path.join(logDirName, f) }));

		logFiles.sort((a, b) => fs.statSync(a.path).mtime - fs.statSync(b.path).mtime);
		while (logFiles.length > maxFiles) {
			const oldest = logFiles.shift();
			fs.unlink(oldest.path, (err) => {
				if (err) {console.error(`Не удалось удалить старый лог ${oldest.name}:`, err.message);}
			});
		}
	});
}

rotateLogs(10);

function log(level, message, meta = null) {
	const time = new Date().toISOString().replace("T", " ").slice(0, 19);
	let format = `| ${time} | ${level.toUpperCase()} | -- ${message} \n`;
	if (meta) {
		format += ` ${JSON.stringify(meta)}`;
	}
	console.log(format);
	stream.write(format);
}

module.exports = {
	info: (message, meta) => log("info", message, meta),
	warn: (message, meta) => log("warn", message, meta),
	error: (message, meta) => log("error", message, meta),
	debug: (message, meta) => log("debug", message, meta),
};
