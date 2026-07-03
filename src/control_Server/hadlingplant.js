const { validatePlant, validateRelation} = require('./validations');

module.exports = function handlers(manager, saveToFile, dataFile){
	return {
		getSchedule(req, res){
			try{
				const tasks = manager.getDailyTasks();
				res.json(tasks);
			}catch(e){
				res.status(500).json({error: e.message});
			}
		},

		getReport(req, res){
			try{
				const report = manager.generateReport();
				res.json(report);
			}catch(e){
				res.status(500).json({error: e.message});
			}
		},

		addPlant(req, res){
			try{
				const {error, value} = validatePlant(req.body);
				if(error){
					const message = error.details.map(d => d.message).join(' ; ');
					return res.status(400).json({error: message});
				}
				manager.addPlant(value);
				saveToFile(manager, dataFile);
				res.json({ok: true, plant: value});
			}catch(e){
				res.status(400).json({error: e.message});
			}
		},

		removePlant(req, res){
			try{
				const {id} = req.params;
				if(!id){
					return res.status(400).json({error: 'ID не указан'});
				}
				manager.removePlant(id);
				saveToFile(manager, dataFile);
				res.json({ok: true});
			}catch(e){
				res.status(400).json({error: e.message});
			}
		},

		addRelation(req, res){
			try{
				const {error, value} = validateRelation(req.body);
				if(error){
					const message = error.details.map(d => d.message).join(' ; ');
					return res.status(400).json({error: message});
				}
				const{id1, id2, type, weight} = value;
				manager.addRelation(id1, id2, type, weight);
				saveToFile(manager, dataFile);
				res.json({ok: true, plant: value});
			}catch(e){
				res.status(400).json({error: e.message});
			}
		},

		route(req, res){
			try{
				const {from, to} = req.query;
				if(!from || !to){
					return res.status(400).json({error: 'Параметры to и from отсутствуют'});
				}
				const route = manager.findCarreRoute(from, to);
				res.json(route);
			}catch(e){
				res.status(400).json({error: e.message});
			}
		},

		exportData(req, res) {
			try {
				const fs = require('fs');
				if (fs.existsSync(dataFile)) {
					res.download(dataFile, 'plant-data.json');
				} else {
					res.status(404).json({ error: 'Файл данных не найден' });
				}
			} catch (e) {
				res.status(500).json({ error: e.message });
			}
		},

		importData(req, res) {
			try {
				const newData = req.body;
				if (!newData.plants || !Array.isArray(newData.plants)) {
					return res.status(400).json({ error: 'Неверный формат данных: ожидается поле plants' });
				}
				const fs = require('fs');
				const tempFile = dataFile + '.temp';
				fs.writeFileSync(tempFile, JSON.stringify(newData, null, 2));
				fs.renameSync(tempFile, dataFile);

				const { loadFromFile } = require('../core/save');
				loadFromFile(manager, dataFile);
				res.json({ ok: true, message: 'Данные импортированы' });
			} catch (e) {
				res.status(400).json({ error: e.message });
			}
		}
	};        
};
