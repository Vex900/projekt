from flask import Flask, render_template, request
from flask_socketio import SocketIO
import uuid

app = Flask(__name__)

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
def player_connect():

    player_id = request.sid

    players[player_id] = {
        "id": player_id,
        "x": 400,
        "y": 300,
        "color": "#" + uuid.uuid4().hex[:6]
    }

    # pošli hráčovi jeho ID
    socketio.emit(
        "your_id",
        player_id,
        to=player_id
    )

    # pošli všetkých hráčov
    socketio.emit(
        "players",
        players
    )


@socketio.on("move")
def move(data):

    player_id = request.sid

    if player_id in players:

        players[player_id]["x"] = data["x"]
        players[player_id]["y"] = data["y"]

        socketio.emit(
            "players",
            players
        )


@socketio.on("shoot")
def shoot(data):

    player_id = request.sid

    # strela patrí iba hráčovi ktorý klikol
    bullet = {

        "id": str(uuid.uuid4()),

        "owner": player_id,

        "x": data["x"],
        "y": data["y"],

        "dx": data["dx"],
        "dy": data["dy"]

    }


    bullets.append(bullet)


    socketio.emit(
        "bullet",
        bullet
    )


@socketio.on("disconnect")
def disconnect():

    player_id = request.sid

    if player_id in players:
        del players[player_id]


    socketio.emit(
        "players",
        players
    )



if __name__ == "__main__":

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000
    )
