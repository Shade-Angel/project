async function exportData() {
    try {
        const res = await fetch("/api/export");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `plant-data-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        alert("Данные экспортированы!");
    } catch (err) {
        alert("Ошибка экспорта: " + err.message);
    }
}

async function importData(input) {
    const file = input.files[0];
    if (!file) return;

    if (!confirm("Текущие данные будут заменены. Продолжить?")) {
        input.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const res = await fetch("/api/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                alert("Данные импортированы! Страница будет перезагружена...");
                location.reload();
            } else {
                const err = await res.json();
                alert("Ошибка импорта: " + err.error);
            }
        } catch (err) {
            alert("Ошибка чтения файла: " + err.message);
        }
    };
    reader.readAsText(file);
    input.value = "";
}
