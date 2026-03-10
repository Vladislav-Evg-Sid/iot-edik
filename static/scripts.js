async function loadData() {

    const response = await fetch("/api/data");
    const data = await response.json();

    const table = document.getElementById("table-body");
    table.innerHTML = "";

    const sensors = {};

    data.forEach(row => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${row.id}</td>
        <td>${row.datetime}</td>
        <td>${row.temperature}</td>
        `;

        table.appendChild(tr);

        if (!sensors[row.id]) {
            sensors[row.id] = [];
        }

        sensors[row.id].push({
            x: row.datetime,
            y: parseFloat(row.temperature)
        });

    });

    drawChart(sensors);
}


function randomColor() {

    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    return `rgb(${r},${g},${b})`;
}


function drawChart(sensors) {

    const datasets = [];

    for (const sensor in sensors) {

        datasets.push({
            label: sensor,
            data: sensors[sensor],
            borderColor: randomColor(),
            fill: false,
            tension: 0.1
        });

    }

    const ctx = document.getElementById("chart");

    new Chart(ctx, {

        type: "line",

        data: {
            datasets: datasets
        },

        options: {

            parsing: false,

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

loadData();