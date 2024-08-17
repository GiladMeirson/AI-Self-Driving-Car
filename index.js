const canvas = document.getElementById('can');
const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.width = (innerWidth/2);
canvas.width = innerWidth/2;
canvas.height = innerHeight;
const ctx = canvas.getContext('2d');
const networkCtx = networkCanvas.getContext('2d');

const laneCount = 8;
const road = new Road(canvas.width/2,canvas.width*0.9,laneCount);
const N=300
const mutateRate = 0.2;

const cars = generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem('bestBrain')){
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'));
        if (i!=0) {
            NeuralNetwork.mutate(cars[i].brain,mutateRate);
        }
    }
}


// const traffic = [
//     new Car(road.getLaneCenter(1), -100, 30, 50,'DUMMY',2),
//     new Car(road.getLaneCenter(0), -300, 30, 50,'DUMMY',2),
//     new Car(road.getLaneCenter(2), -300, 30, 50,'DUMMY',2),

//     new Car(road.getLaneCenter(1), -500, 30, 50,'DUMMY',2),
//     new Car(road.getLaneCenter(0), -700, 30, 50,'DUMMY',2),
//     new Car(road.getLaneCenter(2), -700, 30, 50,'DUMMY',2),

//     new Car(road.getLaneCenter(0), -800, 30, 50,'DUMMY',2),
//     new Car(road.getLaneCenter(2), -890, 30, 50,'DUMMY',2),
//     new Car(road.getLaneCenter(1), -1050, 30, 50,'DUMMY',2),
    
// ];

const traffic = generateTraffic(laneCount);



animate();

// function generateTraffic(laneCount) {
//     const traffic = [];
//     const carsCount = Math.round(Math.random()*50 +100);
//     for (let i = 0; i < carsCount; i++) {

//         const laneNum = Math.round(Math.random()*(laneCount-1));

//         const diffDistance = Math.random()>=0.5?-100:-200;

//         traffic.push( new Car(road.getLaneCenter(laneNum), -100+diffDistance*i, 30, 50,'DUMMY',2))
        
//     }
//     return traffic;
// }

function generateTraffic(laneCount) {
    const traffic = [];
    const carsCount = Math.round(Math.random() * 50 + 100); // Reduce the number of cars
    const minDistance = 200; // Increase the minimum distance between cars

    // Add cars to each lane with larger gaps
    for (let laneNum = 0; laneNum < laneCount; laneNum++) {
        let lastY = -100;
        for (let i = 0; i < carsCount / laneCount; i++) {
            const diffDistance = Math.random() >= 0.5 ? -minDistance : -minDistance * 2;
            lastY += diffDistance;
            traffic.push(new Car(road.getLaneCenter(laneNum), lastY, 30, 50, 'DUMMY', 2));
        }
    }

    // Randomly add more cars to increase density slightly
    for (let i = 0; i < carsCount / 2; i++) {
        const laneNum = Math.floor(Math.random() * laneCount);
        const diffDistance = Math.random() >= 0.5 ? -minDistance : -minDistance * 2;
        const lastCar = traffic.filter(car => car.lane === laneNum).pop();
        const newY = lastCar ? lastCar.y + diffDistance : -100 + diffDistance * i;

        traffic.push(new Car(road.getLaneCenter(laneNum), newY, 30, 50, 'DUMMY', 2));
    }

    return traffic;
}



function save(){
    localStorage.setItem('bestBrain',JSON.stringify(bestCar.brain));
    $.notify("brain saved successfully", "success");
}
function discard(){
    localStorage.removeItem('bestBrain');
    $.notify("brain removed successfully", "success");
}


function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        const lane = Math.round(Math.random()*(laneCount-1));
        cars.push(new Car(road.getLaneCenter(lane), 100, 30, 50,'AI'));
    }
    return cars;

}

function animate(time){
    canvas.height = innerHeight;
    networkCanvas.height = innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders,[]);
        
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders,traffic);
    }

    bestCar = cars.find(c=>c.y==Math.min(...cars.map(c=>c.y)));

    document.getElementById('bestcartitle').innerHTML=`Distance of the best car : ${Math.round((bestCar.y * -1)+100)}`;

    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height*0.7);

    road.draw(ctx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(ctx,'red');
    }

    ctx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(ctx,'blue');
    }
    ctx.globalAlpha = 1;
    bestCar.draw(ctx,'blue',true);


    ctx.restore();

    networkCtx.lineDashOffset = -time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}