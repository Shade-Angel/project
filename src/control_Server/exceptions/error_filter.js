function notFound(req, res, next){
	const error = new Error(`Маршрут ${req.method} ${req.url} не найден!`);
	error.statusCode = 404;
	next(error);
}

function errorHandler(err, req, res, _next){
	const statusCode = err.statusCode || 500;
	const message = err.message || 'Неизвестная ошибка';
	console.error(`Ошибка ${statusCode} -- ${message}`);
	if(err.stack){
		console.error(err.stack);
	}

	res.status(statusCode).json({error: message});
}

function cover(fun){
	return function(req, res, next){
		try{
			const result = fun(req, res, next);
			if(result && typeof result.catch === 'function'){
				result.catch(next);
			}
		} catch(e){
			next(e);
		}
	};
}

module.exports = { notFound, errorHandler, cover };