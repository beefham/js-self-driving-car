class Controls {
  constructor(controlType) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.backward = false;

    switch (controlType) {
      case "key":
        this.#addKeyboardListeners();
        break;
      case "npc":
        this.forward = true;
        break;
    }
  }

  #addKeyboardListeners() {
    document.onkeydown = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "ArrowDown":
          this.backward = true;
          break;
        case "ArrowUp":
          this.forward = true;
          break;
      }
    };
    document.onkeyup = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowDown":
          this.backward = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
      }
    };
  }
}
