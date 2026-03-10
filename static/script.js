let chart = null;

async function loadData() {

    const dataResponse = await fetch("/api/data");
    const data = await dataResponse.json();

    const sensorResponse = await fetch("/api/sensors");
    const sensorNames = await sensorResponse.json();

    const sensors = {};

    data.forEach(row => {

        if (!sensors[row.id]) {
            sensors[row.id] = [];
        }

        sensors[row.id].push({
            x: new Date(row.datetime),
            y: parseFloat(row.temperature)
        });

    });

    drawChart(sensors, sensorNames);
}


function randomColor() {

    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    return `rgb(${r},${g},${b})`;
}


function drawChart(sensors, sensorNames) {

    const datasets = [];

    for (const sensor in sensors) {

        const name = sensorNames[sensor] || sensor;

        datasets.push({
            label: name,
            data: sensors[sensor],
            borderColor: randomColor(),
            fill: false,
            tension: 0.1
        });

    }

    const ctx = document.getElementById("chart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "line",

        data: {
            datasets: datasets
        },

        options: {

            scales: {

                x: {
                    type: "time",
                    time: {
                        unit: "minute"
                    }
                },

                y: {
                    title: {
                        display: true,
                        text: "Temperature °C"
                    }
                }

            }

        }

    });
}

async function loadSensors() {

    const response = await fetch("/api/sensors");
    const sensors = await response.json();

    const table = document.getElementById("sensor-table");
    table.innerHTML = "";

    for (const id in sensors) {

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${id}</td>
        <td>
            <input id="name-${id}" value="${sensors[id]}">
        </td>
        <td>
            <button onclick="saveSensor('${id}')">Save</button>
        </td>
        `;

        table.appendChild(tr);
    }
}


async function saveSensor(id) {

    const name = document.getElementById(`name-${id}`).value;

    await fetch("/api/sensors", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id,
            name: name
        })
    });

}

loadSensors();

loadData();