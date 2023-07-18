const longestData = function(x) {
    x.sort((a, b) => {b.length-a.length})
    return x[x.length]
}

function alignData(d, start, ref) {
    let diff = start < ref ? parseInt(start, 10) + 24 : parseInt(start,10);
    for (let i = diff; i > ref; i--) {
        d.unshift(null)
    }
    return d
}

function getEarlyer(d) {
    d.forEach(x => {
        let heure = x.set[0].time.substr(0,2)
        let jour = x.set[0].day.substr(3,2)
        if(jour < tot.day) {
            tot.day = jour
            if(heure < tot.hour) {
                tot.hour = heure
            }
        }
    })
}

function getDataFromDataset (dataset, name, ref) {
    if (ref) {
        const iconData = dataset.find(x => x.algo==name).set
        return alignData(iconData.map(x => x.temp.substr(0,2)), iconData[0].time.substr(0,2), ref)
    }
    return dataset.find(x => x.algo == name).set.map(x => x.temp.substr(0, 2))
}
function getLabelFromData (data, name) {
    let result = []
    data.find(x => x.algo ==name).set.map((x, i) => {
        if(i==0 || x.time.substr(0,2) == "00"){
            result.push([x.day, x.time.substr(0,2)+"h"])
        } else {
            result.push(x.time.substr(0,2)+"h")
        }
    })
    return result;
}

function build(datas, longuest) {
    document.querySelector('#city').innerHTML=city
    const ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: getLabelFromData(datas, longuest.name),
            datasets: [
                {
                    label: 'AROME',
                    data: getDataFromDataset(datas, "arome", tot.hour),
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                },
                {
                    label: 'ARPEGE',
                    data: getDataFromDataset(datas, 'arpege', tot.hour),
                    backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                },
                {
                    label: "WRF",
                    data: getDataFromDataset(datas, 'wrf', tot.hour),
                    backgroundColor: ['rgba(255, 206, 86, 0.2)'],
                    borderColor: ['rgba(255, 206, 86, 1)'],
                    borderWidth: 1
                },
                {
                    label: "ICON-EU",
                    data: getDataFromDataset(datas, 'iconeu', tot.hour),
                    backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)'],
                    borderWidth: 1
                },
                {
                    label: "ICON-D2",
                    data: getDataFromDataset(datas, 'icond2', tot.hour),
                    backgroundColor: ['rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgba(153, 102, 255, 1)'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false
                },
                x: {
                    ticks: {
                        color: "#000",
                        // callback: function(val, index) {
                        //     console.log(getLabelFromData(datas, "iconeu")[index], index, this.getLabelForValue(val))
                        //     return index % 2 === 0 ? this.getLabelForValue(val): '';
                        //   }
                    },
                    autoSkip: false
                }
            }
        }
    });
}
let datas = []
let longuest = {name:"",len:0}
let city = ""
let tot = {day:Infinity,hour:Infinity}
let isError = false;
let myChart

function findLonguest(d) {
    d.data.forEach(x => {
        if (x.set.length > longuest.len){
            longuest.len = x.set.length
            longuest.name = x.algo
        }
    })
}

function handleError (isError) {
    const el = document.querySelector('.error')
    if (isError) {
        el.classList.remove('hide')
        el.classList.add('show')

    } else {
        el.classList.add('hide')
        el.classList.remove('show')
    }
}
async function postJsonData() {
    if (myChart) myChart.destroy()
    handleError(false)
    let input = document.querySelector('#link').value !== "" ? document.querySelector('#link').value : "https://www.meteociel.fr/previsions-arome-1h/10979/toulouse.htm"
    let data = {base: input};
    const response = await fetch("http://grandass.eu:8080/me", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).catch(e=>{
        console.log(e)
        handleError(true)
    });
    
    const actualResponse = await response.json();
    if(actualResponse) {
        localStorage.setItem("meteo", JSON.stringify(actualResponse))
        datas = actualResponse.data
        city = actualResponse.city
        findLonguest(actualResponse)
        getEarlyer(datas)
        console.log(actualResponse, tot, longuest)
        build(datas, longuest)
    } else {
        handleError(true)
    }
}
function loadMeteo() {
    const d = JSON.parse(localStorage.getItem("meteo"))
    if(d){
        datas = d.data
        city = d.city
        findLonguest(d)
        getEarlyer(datas)
        build(datas, longuest)
    }
}
loadMeteo()