import requests, json, re

from flask import (
    Flask,
    request,
    make_response,
    abort,
    send_from_directory,
    render_template,
)

from bs4 import BeautifulSoup

from urllib.parse import urlparse

from datetime import datetime, time, timedelta

app = Flask(__name__)

WEATHER_MODELS = ["wrf-1h", "arome-1h", "arpege-1h", "iconeu", "icond2"]


def get_timestamp_from_day(day):
    # So, it's a bit tricky, we try to convert relative date information
    # like "Mar18" into timestamps, it should be easier to graph.

    # We get timestamp from yesterday (because I don't know what happen at midnight)
    # And considere that all retrieve datas are after that point in time
    # We add one day to this reference date until the timestamp day number match the number in "Mar18"
    day_number = int(re.search(r"\d{0,2}$", day).group())
    limit_iteration = 14
    # yesterday
    ref_timestamp = datetime.combine(datetime.today(), time.min) - timedelta(days=1)
    timestamp_founded = False

    for i in range(limit_iteration):
        if ref_timestamp.day != day_number:
            ref_timestamp = ref_timestamp + timedelta(days=1)
        else:
            timestamp_founded = True
            break

    if not timestamp_founded:
        print("Warning: Unknown timestamp for {}".format(day))
        # In doubt return today
        ref_timestamp = datetime.combine(datetime.today(), time.min)

    return ref_timestamp


def get_timestamp_from_hours(ref_timestamp, delta):
    hours, minutes = map(int, delta.split(":"))
    point_timestamp = ref_timestamp + timedelta(hours=hours, minutes=minutes)
    # Convert s to ms (js use ms)
    return point_timestamp.timestamp() * 1000


def convert_rows_to_datapoints(rows):
    datapoints = []
    ref_timestamp = None

    for row in rows:
        if len(row("td")) == 11:
            # Retrieve
            ref_timestamp = get_timestamp_from_day(row("td")[0].text)
            timestamp = get_timestamp_from_hours(ref_timestamp, row("td")[1].text)
            pluie = row("td")[7].text.split(" ")[0]
            point = {
                "x": timestamp,
                "y": row("td")[2].text.split(" ")[0],
                "pluie": {
                    "x": timestamp,
                    "y": "" if pluie == "--" else pluie,
                },
            }
            datapoints.append(point)
        elif len(row("td")) == 10:
            if ref_timestamp == None:
                print("Warning: unknown day, using today.")
                ref_timestamp = datetime.combine(datetime.today(), time.min)
            timestamp = get_timestamp_from_hours(ref_timestamp, row("td")[0].text)
            pluie = row("td")[6].text.split(" ")[0]
            point = {
                "x": timestamp,
                "y": row("td")[1].text.split(" ")[0],
                "pluie": {
                    "x": timestamp,
                    "y": "" if pluie == "--" else pluie,
                },
            }
            datapoints.append(point)
    return datapoints


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/weather_datas", methods=["POST"])
def get_weather_prediction():
    mc_url = urlparse(request.get_json()["base"])
    mc_city_code, mc_city_name = mc_url.path.split(".")[0].split("/")[2:]

    data = {"city": mc_city_name, "data": {}}

    for weather_model in WEATHER_MODELS:
        model_name = weather_model.split("-")[0]
        model_url = (
            "https://www.meteociel.fr/previsions-"
            + weather_model
            + "/"
            + mc_city_code
            + "/"
            + mc_city_name
            + ".htm"
        )

        # Try retrieving models datas
        try:
            req = requests.get(model_url, "html.parser")
        except:
            # Could add something to skip the weather model that have an issue
            abort(501)

        # Parsing html
        parsed_html = BeautifulSoup(req.text, features="html.parser")
        table = parsed_html.body("table")[6]
        rows = table("tr")

        # Formating datas
        data["data"][model_name] = convert_rows_to_datapoints(rows)

    # return response
    resp = make_response(json.dumps(data, indent=2))
    resp.headers["Content-Type"] = "application/json"
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Content-Security-Policy"] = "localhost"
    return resp


@app.route("/statics/<path:name>")
def serv_static(name):
    return send_from_directory("statics", name)


@app.route("/favicon.ico")
def serv_favico():
    abort(404)


@app.errorhandler(404)
def not_found(error):
    abort(404)


if __name__ == "__main__":
    app.run(host="localhost", debug=True, port=8080)
