const api = async (url, opts = {}) => {
	const response = await fetch(url, {
		headers: { "Content-Type": "application/json" },
		...opts,
	});
	if (!response.ok) {
		let errorMsg;
		try {
			const errData = await response.json();
			errorMsg = errData.error || response.statusText;
		} catch {
			errorMsg = response.statusText;
		}
		throw new Error(errorMsg || `Ошибка ${response.status}`);
	}
	return await response.json();
};

async function addPlant() {
	const id = document.getElementById("id").value.trim();
	const name = document.getElementById("name").value.trim();
	const nextCareDate = document.getElementById("nextCareDate").value;
	const complexity = parseInt(document.getElementById("complexity").value) || 3;
	const health = parseInt(document.getElementById("health").value) || 80;
	const msgDiv = document.getElementById("addMessage");

	if (!id || !name) {
		msgDiv.innerHTML = '<div class="error">ID и название обязательны</div>';
		return;
	}

	try {
		const body = {
			id: id,
			name: name,
			nextCareDate: nextCareDate || new Date().toISOString().split("T")[0],
			complexity: complexity,
			healthIndex: health,
		};

		await api("/api/plants", {
			method: "POST",
			body: JSON.stringify(body),
		});

		msgDiv.innerHTML = '<div class="success">Растение "' + name + '" успешно добавлено!</div>';

		document.getElementById("id").value = "";
		document.getElementById("name").value = "";
		document.getElementById("nextCareDate").value = "";
		document.getElementById("complexity").value = "";
		document.getElementById("health").value = "";

		loadSchedule();
	} catch (e) {
		msgDiv.innerHTML = '<div class="error">Ошибка: ' + e.message + "</div>";
	}
}

async function loadSchedule() {
	try {
		const plants = await api("/api/schedule");
		const list = document.getElementById("schedule");

		if (!plants || plants.length === 0) {
			list.innerHTML = "<li>Нет срочных задач на сегодня</li>";
			return;
		}

		list.innerHTML = plants
			.map((p, i) => {
				const isUrgent = p.healthIndex < 50;
				return `<li class="${isUrgent ? "urgent" : ""}">
            <strong>${i + 1}. ${p.name || p.id}</strong>
            ID: ${p.id}<br>
            Дата ухода: ${p.nextCareDate}<br>
            Сложность: ${p.complexity}/5 | Здоровье: ${p.healthIndex}%
			<div class="deleteIcon" onclick="deletePlants('${p.id}')">X</div>
          </li>`;
			})
			.join("");
	} catch (e) {
		document.getElementById("schedule").innerHTML = '<li class="error">Ошибка загрузки: ' + e.message + "</li>";
	}
}

async function deletePlants(id){
	setTimeout(() => {}, 1000);
	try{
		const response = await fetch(`/api/plants/${id}`, {
			method: 'DELETE',
			headers: {"Content-Type": "application/json"}
		});

		if(!response.ok){
			const err = await response.json();
			throw new Error(err.error || 'Ошибка удаления!');
		}
		loadSchedule();
	}catch(e){
		alert(e.message);
	}	
}

async function loadReport() {
	try {
		const plants = await api("/api/report");
		const list = document.getElementById("report");

		if (!plants || plants.length === 0) {
			list.innerHTML = "<li>Нет данных для отчёта</li>";
			return;
		}

		const now = Date.now();
		list.innerHTML = plants
			.map((p, i) => {
				const careDate = new Date(p.nextCareDate).getTime();
				const daysLate = Math.max(0, Math.round((now - careDate) / 86400000));
				const name = p.name || p.id || "Без названия";

				return `<li>
            <strong>${i + 1}. ${name}</strong> (ID: ${p.id})<br>
            Срочность: ${daysLate} дн. | 
            Сложность: ${p.complexity} | 
            Здоровье: ${p.healthIndex}%
          </li>`;
			})
			.join("");
	} catch (e) {
		document.getElementById("report").innerHTML =
			'<li class="error">Ошибка формирования отчёта: ' + e.message + "</li>";
	}
}

window.onload = () => {
	loadSchedule();
};
