const val = require("joi");

const plantSchema = val.object({
	id: val.string().required().messages({
		"any.required": "Нужно ввести ID растения",
		"string.empty": "ID не может быть пустым",
	}),
	name: val.string().required().messages({
		"any.required": "Название растения должно быть введено",
		"string.empty": "Название не может быть пустым",
	}),
	nextCareDate: val.date().iso().required().messages({
		"data.base": "Нужно ввести дату",
		"date.format": "Дата должна быть введена в правильном формате",
		"string.empty": "Дата не может быть пустой",
	}),
	complexity: val.number().integer().min(1).max(5).default(3),
	healthIndex: val.number().integer().min(0).max(100).default(80)
});

const relationSchema = val.object({
	id1: val.string().required(),
	id2: val.string().required(),
	type: val.string().valid('compatible', 'conflict', 'care_sequence').required(),
	weight: val.number().default(1)
});

function validatePlant(data){
	return plantSchema.validate(data, {abortEarly: false});
}

function validateRelation(data){
	return relationSchema.validate(data, {abortEarly: false});
}

module.exports = { validatePlant, validateRelation};