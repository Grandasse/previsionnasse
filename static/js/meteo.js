function build(datas) {
    document.querySelector('#city').innerHTML = city
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        data: {
            label: 'Temperature',
            datasets: [
                {
                    type: 'line',
                    label: 'AROME',
                    data: datas['arome'],
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                    yAxisID: "y",
                },
                {
                    type: 'line',
                    label: 'ARPEGE',
                    data: datas['arpege'],
                    backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 1,
                    yAxisID: "y",
                },
                {
                    type: 'line',
                    label: "WRF",
                    data: datas['wrf'],
                    backgroundColor: ['rgba(255, 206, 86, 0.2)'],
                    borderColor: ['rgba(255, 206, 86, 1)'],
                    borderWidth: 1,
                    yAxisID: "y",
                },
                {
                    type: 'line',
                    label: "ICON-EU",
                    data: datas['iconeu'],
                    backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)'],
                    borderWidth: 1,
                    yAxisID: "y",
                },
                {
                    type: 'line',
                    label: "ICON-D2",
                    data: datas['icond2'],
                    backgroundColor: ['rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgba(153, 102, 255, 1)'],
                    borderWidth: 1,
                    yAxisID: "y",
                },
                {
                    type: 'bar',
                    label: 'arome-pluie',
                    data: datas['arome'],
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                    yAxisID: "y1",
                },
                {
                    type: 'bar',
                    label: 'arpege-pluie',
                    data: datas['arpege'],
                    backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 1,
                    yAxisID: "y1",
                },
                {
                    type: 'bar',
                    label: "wrf-pluie",
                    data: datas['wrf'],
                    backgroundColor: ['rgba(255, 206, 86, 0.2)'],
                    borderColor: ['rgba(255, 206, 86, 1)'],
                    borderWidth: 1,
                    yAxisID: "y1",
                },
                {
                    type: 'bar',
                    label: "icon-eu-pluie",
                    data: datas['iconeu'],
                    backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)'],
                    borderWidth: 1,
                    yAxisID: "y1",
                },
                {
                    type: 'bar',
                    label: "icon-d2-pluie",
                    data: datas['icond2'],
                    backgroundColor: ['rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgba(153, 102, 255, 1)'],
                    borderWidth: 1,
                    yAxisID: "y1",
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Température (°c)'
                    }
                },
                y1: {
                    beginAtZero: false,
                    title: {
                        text: 'Précipitations (mm)',
                        display: false,
                    },
                    position: 'right',
                    suggestedMax:10,
                    suggestedMin:0,
                },
                x: {
                    type: 'timeseries',
                    time: {
                        unit: 'hour',
                        tooltipFormat: 'yyyy-MM-dd HH:mm',
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    // Need to have the first day in x axis 
                    ticks: {
                        source: 'data',
                        maxRotation: 0,
                        autoSkip: false,
                        callback: function (value, index, values) {
                            var date = new Date(value);
                            var date_string = [];

                            var date_hour = date.toLocaleTimeString([], { hour: "numeric" });
                            var date_day = date.toLocaleDateString('fr-FR', { weekday: 'long', day: "numeric", month: "numeric" })

                            // add vertical seperator for new day
                            if (date.getHours() === 0) {
                                date_string.push('|');
                                date_string.push('|');
                            }
                            // add the hour every 4 hours
                            else if (date.getHours() % 4 === 0) {
                                date_string.push(date_hour);
                            }
                            // Else add a new line
                            else {
                                date_string.push('\n');
                            }
                            // Add decoration for every hour except the first
                            if (date.getHours() !== 0) {
                                date_string.push('_');
                            }
                            // add the date in the middle of the day
                            if (date.getHours() === 12) {
                                date_string.push('\n');
                                date_string.push(date_day);
                            }
                            return date_string;
                        }
                    },
                },
            },
            // show all values in tooltip
            interaction: {
                mode: 'x'
            },
        }
    });
}
let datas = []
let city = ""
let isError = false;
let myChart;
const spinner = document.querySelector(".container");

function handleError(isError) {
    const el = document.querySelector('.error')
    if (isError) {
        el.classList.remove('hide')
        el.classList.add('show')

    } else {
        el.classList.add('hide')
        el.classList.remove('show')
    }
}

function showSpinner(show) {
    if (show) {
        spinner.style.display = "flex";
    } else {
        spinner.style.display = "none";
    }
}

async function postJsonData() {
    showSpinner(true)
    if (myChart) myChart.destroy()
    handleError(false)
    let input = document.querySelector('#link').value !== "" ? document.querySelector('#link').value : "https://www.meteociel.fr/previsions/10979/toulouse.htm"
    let data = { base: input };
    const response = await fetch("/weather_datas", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).catch(e => {
        console.log(e)
        handleError(true)
    });

    const actualResponse = await response.json();
    if (actualResponse) {
        localStorage.setItem("meteo", JSON.stringify(actualResponse))
        datas = actualResponse.data
        city = actualResponse.city
        build(datas)
    } else {
        handleError(true)
    }
    showSpinner(false)
}
function loadMeteo() {
    const d = JSON.parse(localStorage.getItem("meteo"))
    if (d) {
        datas = d.data
        city = d.city
        build(datas)
    }
}
loadMeteo()
