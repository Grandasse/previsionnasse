function build(datas) {
    document.querySelector('#city').innerHTML = city
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            label: 'Temperature',
            datasets: [
                {
                    label: 'AROME',
                    data: datas['arome'],
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                },
                {
                    label: 'ARPEGE',
                    data: datas['arpege'],
                    backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                },
                {
                    label: "WRF",
                    data: datas['wrf'],
                    backgroundColor: ['rgba(255, 206, 86, 0.2)'],
                    borderColor: ['rgba(255, 206, 86, 1)'],
                    borderWidth: 1
                },
                {
                    label: "ICON-EU",
                    data: datas['iconeu'],
                    backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)'],
                    borderWidth: 1
                },
                {
                    label: "ICON-D2",
                    data: datas['icond2'],
                    backgroundColor: ['rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgba(153, 102, 255, 1)'],
                    borderWidth: 1
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
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'yyyy-MM-dd HH:00'
                        },
                        tooltipFormat: 'yyyy-MM-dd HH:mm',
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    },
                },
            }
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
