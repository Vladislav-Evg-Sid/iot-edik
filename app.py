from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import csv
from datetime import datetime

app = FastAPI()

DATA_FILE = "data.csv"
SENSORS_FILE = "sensors.csv"

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# -------------------------
# CSV helpers
# -------------------------

def read_sensors():
    sensors = {}

    with open(SENSORS_FILE, "r") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            sensors[row["id"]] = row["name"]

    return sensors


def add_sensor_if_missing(sensor_id):

    sensors = read_sensors()

    if sensor_id not in sensors:
        with open(SENSORS_FILE, "a", newline="") as f:
            writer = csv.writer(f, delimiter=";")
            writer.writerow([sensor_id, sensor_id])


def update_sensor_name(sensor_id, new_name):

    rows = []

    with open(SENSORS_FILE, "r") as f:
        reader = csv.DictReader(f, delimiter=";")
        for row in reader:
            if row["id"] == sensor_id:
                row["name"] = new_name
            rows.append(row)

    with open(SENSORS_FILE, "w", newline="") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(["id", "name"])

        for r in rows:
            writer.writerow([r["id"], r["name"]])


def write_measurement(sensor_id, temperature):

    with open(DATA_FILE, "a", newline="") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow([
            sensor_id,
            datetime.now().isoformat(),
            temperature
        ])


def read_measurements():

    data = []

    with open(DATA_FILE, "r") as f:
        reader = csv.DictReader(f, delimiter=";")

        for row in reader:
            data.append(row)

    return data


# -------------------------
# Routes
# -------------------------

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/temperature")
async def receive_temperature(data: dict):

    sensor_id = data["id"]
    temperature = data["temperature"]

    add_sensor_if_missing(sensor_id)
    write_measurement(sensor_id, temperature)

    return {"status": "ok"}


@app.get("/api/data")
async def get_data():
    return read_measurements()


@app.get("/api/sensors")
async def get_sensors():
    return read_sensors()


@app.post("/api/sensors")
async def rename_sensor(data: dict):

    sensor_id = data["id"]
    name = data["name"]

    update_sensor_name(sensor_id, name)

    return {"status": "ok"}