import requests
from flask import Flask,  request,  make_response, abort
from flask_cors import CORS
import json
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

def getCityFromUrl(url):
    return url.split('/')[-1:][0].split('.')[0]

def generateUrls(prompt, urls):
    id_city = prompt.split('/')[4]
    city = getCityFromUrl(prompt)
    algos = ['wrf-1h', 'arome-1h', 'arpege-1h', 'iconeu', 'icond2']
    for algo in algos:
        url = {}
        url["code"] = algo.split('-')[0]
        url["url"] = "https://www.meteociel.fr/previsions-" + algo + "/" + id_city + "/" + city+".htm"
        urls.append(url)
    return urls

def read_rows(rows):
    result = []
    day = 0
    for row in rows:
        if len(row('td')) == 11:
            day = row('td')[0].text
            info={}
            info["day"] = day
            info["time"] = row('td')[1].text
            info["temp"] = row('td')[2].text
            result.append(info)
        if len(row('td')) == 10:
            info={}
            info["day"] = day
            info["time"] = row('td')[0].text
            info["temp"] = row('td')[1].text
            result.append(info)
    return result

@app.route("/")
def home():
    return "hi"

@app.route("/test", methods=['GET', 'POST'])
def test():
    if request.method == 'GET':
        d = {"res":"GET works"}
        r = make_response(json.dumps(d))
        r.headers['Content-Type'] = "application/json"
        return r
    if request.method == 'POST' :
        d = request.get_json()
        response = make_response(json.dumps(d))
        response.headers['Content-Type'] = "application/json"
        response.headers['Access-Control-Allow-Origin'] = "*"
        response.headers['Content-Security-Policy'] = "localhost"
        return response

@app.route('/me', methods=['GET', 'POST'])
def login():
    urls = []
    city = ""
    if request.method == 'GET':
        return "Nope"
    if request.method == 'POST':
        response = []
        base = request.get_json()['base']
        generateUrls(base, urls)
        
        for url in urls:
            u = url.get('url')
            name = url.get('code')
            try:
                req = requests.get(u, 'html.parser')
            except:
                abort(501)
            parsed_html = BeautifulSoup(req.text, features="html.parser")
            table = parsed_html.body('table')[6]
            rows = table('tr')
            data = {}
            data["set"] = read_rows(rows)
            data["debug"] = rows
            data["algo"] = name
            #data["city"] = getCityFromUrl(u)
            #json.dumps(data, indent=2))
            response.append(data)

        #return response
        data = {}
        data["city"] = getCityFromUrl(u)
        data["data"] = response
        resp = make_response(json.dumps(data, indent=2))
        resp.headers['Content-Type'] = "application/json"
        resp.headers['Access-Control-Allow-Origin'] = "*"
        resp.headers['Content-Security-Policy'] = "localhost"
        return resp


@app.errorhandler(404)
def not_found(error):
    abort(404)
    
if __name__ == "__main__":
    app.run(host='localhost', debug = True, port = 8080)
