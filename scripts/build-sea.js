const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Сборка всего кода и зависимостей в один файл \n \n');
if (!fs.existsSync('dist')) {
	fs.mkdirSync('dist');
}

execSync(
	'npx esbuild src/server.js --bundle --platform=node --target=node22 --format=cjs --outfile=dist/bundle.js',
	{ stdio: 'inherit' }
);

console.log('Создание нативного Single Executable Application \n \n');
const seaConfig = {
	main: 'dist/bundle.js',
	output: 'sea-prep.blob'
};
fs.writeFileSync('sea-config.json', JSON.stringify(seaConfig));

execSync('node --experimental-sea-config sea-config.json', { stdio: 'inherit' });

const targetExe = path.resolve('plant-care.exe');
fs.copyFileSync(process.execPath, targetExe);

execSync(
	`npx postject "${targetExe}" NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`,
	{ stdio: 'inherit' }
);

if (fs.existsSync('sea-config.json')) fs.unlinkSync('sea-config.json');
if (fs.existsSync('sea-prep.blob')) fs.unlinkSync('sea-prep.blob');

console.log('Сборка завершена! Файл: plant-care.exe');