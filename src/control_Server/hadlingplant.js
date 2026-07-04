const { cover } = require('./exceptions/error_filter');
const { validatePlant, validateRelation} = require('./validations');

module.exports = function handlers(manager, saveToFile, dataFile){
	return {
		getSchedule: cover((req, res, _next) => {
			const tasks = manager.getDailyTasks();
			res.json(tasks);
		}),

		getReport: cover((req, res, _next) => {
			const report = manager.generateReport();
			res.json(report);			
		}),

		addPlant: cover((req, res, next) => {
			const {error, value} = validatePlant(req.body);
			if(error){
				const err = new Error(error.details.map(d => d.message).join(' ; '));
				err.statusCode = 400;
				return next(err);
			}
			manager.addPlant(value);
			saveToFile(manager, dataFile);
			res.json({ok: true, plant: value});
		}),

		removePlant: cover((req, res, next) => {
			const {id} = req.params;
			if(!id){
				const err = new Error('ID не указан');
				err.statusCode = 400;
				return next(err);
			}
			manager.removePlant(id);
			saveToFile(manager, dataFile);
			res.json({ok: true});
		}),

		addRelation: cover((req, res, next) => {
			const {error, value} = validateRelation(req.body);
			if(error){
				const err = new Error(error.details.map(d => d.message).join(' ; '));
				err.statusCode = 400;
				return next(err);
			}
			const{id1, id2, type, weight} = value;
			manager.addRelation(id1, id2, type, weight);
			saveToFile(manager, dataFile);
			res.json({ok: true, relation: value});
		}),

		route: cover((req, res, next) => {
			const {from, to} = req.query;
			if(!from || !to){
				const err = new Error('Параметры to и from отсутствуют');
				err.statusCode = 400;
				return next(err);
			}
			const route = manager.findCareRoute(from, to);
			res.json(route);
		}),

		exportData: cover((req, res, next) => {
			const fs = require('fs');
			if (fs.existsSync(dataFile)) {
				res.download(dataFile, 'data.json');
			} else {
				const err = new Error('Файл данных не найден');
				err.statusCode = 404;
				return next(err);
			}
		}),

		importData: cover((req, res, next) => {
			const newData = req.body;
			if (!newData.plants || !Array.isArray(newData.plants)) {
				const err = new Error('Неверный формат данных: ожидается поле plants');
				err.statusCode = 400;
				return next(err);
			}
			for (const plant of newData.plants) {
				const { error } = validatePlant(plant);
				if (error) {
					const err = new Error(
						`Ошибка в импортируемых данных: ${error.details.map((d) => d.message).join(" ; ")}`
					);
					err.statusCode = 400;
					return next(err);
				}
			}
			const fs = require('fs');
			const tempFile = dataFile + '.temp';
			fs.writeFileSync(tempFile, JSON.stringify(newData, null, 2));
			fs.renameSync(tempFile, dataFile);

			const { loadFromFile } = require('../core/save');
			loadFromFile(manager, dataFile);
			res.json({ ok: true, message: 'Данные импортированы' });

		})
	};        
};
