class Car {
  constructor(x, y, width, height, controlType, maxSpeed = 3) {
    this.x = x;
    this.y = y;
    this.initX = x;
    this.initY = y;
    this.width = width;
    this.height = height;
    this.polygon = this.#createPolygon();

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.03;
    this.angle = 0;

    this.damaged = false;

    this.useBrain = controlType == "ai";
    if (controlType != "npc") {
      this.sensor = new Sensor(this);
      this.network = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }
    this.controls = new Controls(controlType);
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map((sense) =>
        sense == null ? 0 : 1 - sense.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets, this.network);

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.backward = outputs[3];
      }
    }
  }

  resetPos() {
    this.x = this.initX;
    this.y = this.initY;
    this.speed = 0;
    this.angle = 0;
    this.damaged = false;
  }

  resetNetwork() {
    this.network = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
  }

  #createPolygon() {
    const points = [];
    const radius = Math.hypot(this.width / 2, this.height / 2); // length from centre to one corner of the rectangle
    const alpha = Math.atan2(this.width, this.height); // angle formed by radius to top right corner

    points.push({
      x: this.x - Math.sin(this.angle - alpha) * radius,
      y: this.y - Math.cos(this.angle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * radius,
      y: this.y - Math.cos(this.angle + alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius,
    });

    return points;
  }

  #assessDamage(borders, traffic) {
    for (let i = 0; i < borders.length; i++) {
      if (polysIntersect(this.polygon, borders[i])) {
        return true;
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.backward) {
      this.speed -= this.acceleration;
    }
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed) {
      this.speed = -this.maxSpeed;
    }
    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += 0.02 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.02 * flip;
      }
    }

    this.x = this.x - Math.sin(this.angle) * this.speed;
    this.y = this.y - Math.cos(this.angle) * this.speed;
  }

  draw(context, color, drawSensor = false) {
    if (this.damaged) {
      context.fillStyle = "gray";
    } else {
      context.fillStyle = color;
    }
    context.beginPath();
    context.moveTo(this.polygon[0].x, this.polygon[0].y);

    for (let i = 1; i < this.polygon.length; i++) {
      context.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    context.fill();

    if (this.sensor && drawSensor) {
      this.sensor.draw(context);
    }
  }
}
