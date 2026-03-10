from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import csv
from datetime import datetime

app = FastAPI()

DATA_FILE = "data.csv"

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


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


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/temperature")
async def receive_temperature(data: dict):

    sensor_id = data["id"]
    temperature = data["temperature"]

    write_measurement(sensor_id, temperature)

    return {"status": "ok"}


@app.get("/api/data")
async def get_data():
    return read_measurements()