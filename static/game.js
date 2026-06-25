const socket = io();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let myId = null;
let players = {};
let bullets = [];

socket.on("init", data => {
    myId = data.id;
    players = data.players;
});

socket.on("players_update", data => {
    players = data;
});

socket.on("bullets_update", data => {
    bullets = data;
});

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key] = true;
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

canvas.addEventListener("click", e => {

    if (!players[myId]) return;

    const rect = canvas.getBoundingClientRect();

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const px = players[myId].x;
    const py = players[myId].y;

    const dx = mx - px;
    const dy = my - py;

    socket.emit("shoot", {
        x: px,
        y: py,
        dx: dx,
        dy: dy
    });
});

function update() {

    if (!players[myId]) return;

    let p = players[myId];

    if (keys["w"]) p.y -= 4;
    if (keys["s"]) p.y += 4;
    if (keys["a"]) p.x -= 4;
    if (keys["d"]) p.x += 4;

    socket.emit("move", {
        id: myId,
        x: p.x,
        y: p.y
    });
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in players) {

        const p = players[id];

        ctx.fillStyle =
            id === myId ? "lime" : "red";

        ctx.fillRect(
            p.x - 15,
            p.y - 15,
            30,
            30
        );
    }

    bullets.forEach(b => {

        b.x += b.dx * 0.02;
        b.y += b.dy * 0.02;

        ctx.fillStyle = "yellow";

        ctx.beginPath();
        ctx.arc(
            b.x,
            b.y,
            5,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();