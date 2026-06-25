const socket = io();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;


let myId = null;

let players = {};

let bullets = [];


let keys = {};

let mouse = {
    x: 0,
    y: 0
};


let me = {
    x: 400,
    y: 300,
    speed: 5
};


// dostaneme svoje ID
socket.on("your_id", id => {

    myId = id;

});



// aktualizácia hráčov
socket.on("players", data => {

    players = data;


    if(players[myId]){

        me.x = players[myId].x;
        me.y = players[myId].y;

    }

});



// nová strela
socket.on("bullet", bullet => {

    bullets.push(bullet);

});





// klávesy

document.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

});


document.addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;

});





// myš

canvas.addEventListener("mousemove", e => {

    const rect = canvas.getBoundingClientRect();

    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

});





// streľba

canvas.addEventListener("click", () => {


    let dx = mouse.x - me.x;
    let dy = mouse.y - me.y;


    let length = Math.sqrt(dx*dx + dy*dy);


    dx /= length;
    dy /= length;



    socket.emit("shoot", {


        x: me.x,
        y: me.y,

        dx: dx,
        dy: dy

    });


});






function update(){


    if(keys["w"])
        me.y -= me.speed;


    if(keys["s"])
        me.y += me.speed;


    if(keys["a"])
        me.x -= me.speed;


    if(keys["d"])
        me.x += me.speed;



    socket.emit("move", {


        x: me.x,
        y: me.y


    });





    bullets.forEach(b => {


        b.x += b.dx * 10;

        b.y += b.dy * 10;


    });



    // odstránenie starých guliek

    bullets = bullets.filter(b =>

        b.x > 0 &&
        b.x < canvas.width &&
        b.y > 0 &&
        b.y < canvas.height

    );


}





function draw(){


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    // hráči

    for(let id in players){


        let p = players[id];


        ctx.fillStyle = p.color;


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            20,
            0,
            Math.PI*2
        );


        ctx.fill();



        if(id === myId){

            ctx.fillStyle="white";

            ctx.fillText(
                "YOU",
                p.x-15,
                p.y-30
            );

        }


    }





    // strely

    bullets.forEach(b => {


        ctx.fillStyle="yellow";


        ctx.beginPath();


        ctx.arc(
            b.x,
            b.y,
            5,
            0,
            Math.PI*2
        );


        ctx.fill();



    });



}




function loop(){

    update();

    draw();

    requestAnimationFrame(loop);

}


loop();
