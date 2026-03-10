async function loadData() {

    const response = await fetch("/api/data");
    const data = await response.json();

    const table = document.getElementById("table-body");

    table.innerHTML = "";

    const labels = [];
    const temps = [];

    data.forEach(row => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
        <td>${row.id}</td>
        <td>${row.datetime}</td>
        <td>${row.temperature}</td>
        `;

        table.appendChild(tr);

        labels.push(row.datetime);
        temps.push(row.temperature);
    });

    drawChart(labels, temps);
}


function drawChart(labels, temps) {

    const ctx = document.getElementById("chart");

    new Chart(ctx, {
        type: "line",

        data: {
            labels: labels,
            datasets: [{
                label: "Temperature",
                data: temps
            }]
        }
    });
}

loadData();