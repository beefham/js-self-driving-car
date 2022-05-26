const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const netCanvas = document.getElementById("netCanvas");
netCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const netCtx = netCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3);

const startingPos = road.getLaneCenter(1);

const laneZero = road.getLaneCenter(0);
const laneOne = startingPos;
const laneTwo = road.getLaneCenter(2);
const laneThree = road.getLaneCenter(3);

const NUM_OF_CARS = 500;
const cars = generateCars(NUM_OF_CARS);

const learnRatio = 0.2;
let bestCar = cars[0];

if (localStorage.getItem("bestNetwork")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].network = JSON.parse(localStorage.getItem("bestNetwork"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].network, learnRatio);
    }
  }
}

const traffic = [
  new Car(laneZero, -100, 30, 50, "npc", 2),
  new Car(laneOne, -100, 30, 50, "npc", 2),
  new Car(laneZero, -400, 30, 50, "npc", 2),
  new Car(laneTwo, -400, 30, 50, "npc", 2),
  new Car(laneOne, -700, 30, 50, "npc", 2),
  new Car(laneTwo, -1000, 30, 50, "npc", 2),
  new Car(laneThree, -1000, 30, 50, "npc", 2),
];

animate();

function saveBestCar() {
  localStorage.setItem("bestNetwork", JSON.stringify(bestCar.network));
}

function discard() {
  localStorage.removeItem("bestNetwork");
}

function generateCars(numCars) {
  const cars = [];
  for (let i = 0; i < numCars; i++) {
    cars.push(new Car(startingPos, 100, 30, 50, "ai"));
  }
  return cars;
}

function animate() {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }

  const bestCar = cars.find(
    (car) => car.y == Math.min(...cars.map((car) => car.y))
  );

  carCanvas.height = window.innerHeight;
  netCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.8);

  road.draw(carCtx);

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "black");
  }

  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, "blue");
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);
  carCtx.restore();

  NetworkVisualiser.drawNetwork(netCtx, bestCar.network);

  requestAnimationFrame(animate);
}

function reset(hard) {
  traffic.forEach((car) => car.resetPos());
  cars.forEach((car) => {
    if (hard) {
      car.resetNetwork();
    }
    car.resetPos();
  });
}

function mutate() {
  traffic.forEach((car) => car.resetPos());
  if (localStorage.getItem("bestNetwork")) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].network = JSON.parse(localStorage.getItem("bestNetwork"));
      if (i != 0) {
        NeuralNetwork.mutate(cars[i].network, learnRatio);
      }
    }
  } else {
    cars.forEach((car) => car.resetNetwork());
  }
  cars.forEach((car) => car.resetPos());
}
