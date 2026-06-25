from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import random

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="threading"
)

players = {}
bullets = []

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("connect")
def connect():
    player_id = str(random.randint(1000, 999999))

    players[player_id] = {
        "x": random.randint(50, 750),
        "y": random.randint(50, 550)
    }

    emit("init", {
        "id": player_id,
        "players": players
    })

    socketio.emit("players_update", players)

@socketio.on("move")
def move(data):
    pid = data["id"]

    if pid not in players:
        return

    players[pid]["x"] = data["x"]
    players[pid]["y"] = data["y"]

    socketio.emit("players_update", players)

@socketio.on("shoot")
def shoot(data):
    bullets.append({
        "x": data["x"],
        "y": data["y"],
        "dx": data["dx"],
        "dy": data["dy"]
    })

    socketio.emit("bullets_update", bullets)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
