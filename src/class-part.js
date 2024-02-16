class Part {

    #instances;
    #instanceIndex;

    constructor(instances) {
        this.#instances = instances;
        this.#instanceIndex = Math.floor(Math.random() * this.#instances.length);
        this.model = this.#instances[this.#instanceIndex];
        this.x = 4 + Math.floor(Math.random() * 2);
        this.y = -4;
    }

    swapInstance(reverseDirection) {
        if (reverseDirection) {
            this.#instanceIndex--;
            if (this.#instanceIndex < 0) this.#instanceIndex = this.#instances.length - 1;
        }
        else {
            this.#instanceIndex = (this.#instanceIndex + 1) % this.#instances.length;
        }
        this.model = this.#instances[this.#instanceIndex];
    }

}

export { Part }