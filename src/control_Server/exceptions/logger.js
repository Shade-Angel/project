const fs = require('fs');
const path = require('path');

const logDirName = path.join(__dirname, '../logs');
if(!fs.existsSync(logDirName)){
	fs.mkdirSync(logDirName, {recursive: true});
}

const logFile = path.join(logDirName, 'app.log');
const stream = fs.createWriteStream(logFile, {flags: 'a'});

function log(level, message, meta = null){
	const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
	let format = `| ${time} | ${level.toUpperCase()} | -- ${message} \n`;
	if(meta){
		format += ` ${JSON.stringify(meta)}`;
	}
	console.log(format);
	stream.write(format);
}

module.exports = {
	info: (message, meta) => log('info', message, meta),
	warn: (message, meta) => log('warn', message, meta),
	error: (message, meta) => log('error', message, meta),
	debug: (message, meta) => log('debug', message, meta),
};