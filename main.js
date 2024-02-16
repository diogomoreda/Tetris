import { Markup } from './src/class-markup'
import { PartFactory } from './src/part-factory';


const Configuration = {
    pixelSize: 32,      // the pixel size, in pixels =)
    gridSize: [21, 12], // rows, cols - the grid size include the left/bottom/right borders, that are filled with 1s to detect part border collisions
    frequency: 3,       // determines the game refresh rate, by the number of requestAnimationFrame() events elapsed. each event calls the #frame method
    keyframes: 5,       // determines the part motion rate, by the number of #frame events elapsed
    minFrameTime: 40    // the minimum ammount of time that must ellapse between each consecutive frame(in milliseconds). This can be calculated based on a desired framerate: minFrameTime = 1000mS / FramesPerSecond. eg: minFrameTime = 1000mS / 25fps <=> 40 mS
};


class Tetris {

    // Blueprint:
    #state;         // INT: indicating the program current state: 0=intro, 1=game play, 2=game over.
    #play;          // BOOL: indicating the game running state. True=game is running. False=the game is paused (only valid for #state==1).
    #model;         // bit[][]: the grid, a pixel matrix containing 0s and 1s.
    #part;          // PART: placeholder for the current part instance.
    #frameCount;    // INT: a frame counter. decremented every animation frame. when ellappsed, a keyframe method is called and the counter is restored
    #keyframeCount; // INT: a keyframe counter.
    #lastFrame;     // INT: to store the epoch of the last frame, to aid ensuring a minimum amount of time betwen frames.
    #frameId;       // STRING: to hold the id of the requestAnimationFrame, so we can cancel it when required.
    #keyLock;       // BOOL: to lock part instance swap action, and prevent key auto repeat.
    
    #board;         // HTMLReference: to the element that holds the game UI.
    #intro;         // HTMLReference: to the start screen element. This contains game instructions.
    #outro;         // HTMLReference: to the 'game over' screen element.

    #keysPressed = {        // keeps track of the keys pressed on the keyboard
        Enter: false,       // 13 - pause/resume game play
        Escape: false,      // 27 - pause/resume game play
        Space: false,       // 32 - rotates the part
        ArrowLeft: false,   // 37 - moves the current part to the left
        ArrowUp: false,     // 38 - rotates the part
        ArrowRight: false,  // 39 - moves the current part to the right
        ArrowDown: false,   // 40 - moves the current part downwards
    };

    constructor () {
        this.#board = Markup.board();
        this.#intro = Markup.intro();
        this.#outro = Markup.outro();
        document.body.appendChild(this.#board);
        document.addEventListener('keydown', this.#keydown.bind(this));
        document.addEventListener('keyup', this.#keyup.bind(this));
        this.#init();
    }

    #keydown(e) {
        let keyCode = null;
        if (e.code) {
            if (this.#keysPressed[e.code] || (this.#keysPressed[e.code] === false)) {
                this.#keysPressed[e.code] = true;
                keyCode = e.code;
            }
        } 
        else if (e.key) {
            if (this.#keysPressed[e.key] || (this.#keysPressed[e.key] === false)) {
                this.#keysPressed[e.key] = true;
                keyCode = e.key;
            }
        }
        if (this.#state == 0 || this.#state == 2) {
            if (keyCode == 'Enter' || keyCode == 'Space') {
                this.#initGame();
            }
        } 
        else if (this.#state == 1) {
            if (keyCode == 'Enter' || keyCode == 'Escape') {
                this.#play = !this.#play;
                if (this.#play) this.#frameId = window.requestAnimationFrame(this.#frame.bind(this));
            }
        }
        e.preventDefault();
        e.stopPropagation();
    }

    #keyup(e) {
        let keyCode = null;
        if (e.code) {
            if (this.#keysPressed[e.code]) {
                this.#keysPressed[e.code] = false;
                keyCode = e.code;
            }
        } 
        else if (e.key) {
            if (this.#keysPressed[e.key]) {
                this.#keysPressed[e.key] = false;
                keyCode = e.key;
            }
        }
        if (this.#state == 1) {
            if (keyCode == 'Space' || keyCode == 'ArrowUp') {
                this.#keyLock = false;
            }
        }
        e.preventDefault();
        e.stopPropagation();
    }

    #initModel() {
        this.#model = [];
        for (let row=0; row<Configuration.gridSize[0]; row++) 
            this.#model[row] = this.#initRow(row == Configuration.gridSize[0] - 1);
    }

    #initRow(fill) {
        let newRow = [];
        for (let col=0; col<Configuration.gridSize[1]; col++)
            newRow[col] = +(col == 0 || col == Configuration.gridSize[1] - 1 || fill);
        return newRow;
    }

    #init() {
        this.#state = 0;
        this.#play = false;
        this.#board.appendChild(this.#intro);
    }

    #initGame() {
        this.#state = 1;
        this.#keyLock = false;
        this.#play = true;
        this.#frameCount = Configuration.frequency;
        this.#keyframeCount = Configuration.keyframes;
        this.#part = null;
        if (this.#board.contains(this.#intro)) this.#board.removeChild(this.#intro);
        if (this.#board.contains(this.#outro))this.#board.removeChild(this.#outro);
        this.#initModel();
        this.#renderModel();
        this.#frameId = window.requestAnimationFrame(this.#frame.bind(this));
    }

    #endGame() {
        this.#state = 2;
        this.#play = false;
        window.cancelAnimationFrame(this.#frameId);
        this.#board.appendChild(this.#outro);
    }

    #frame() {
        // ensure that at least minFrameTime mS have ellapsed since the last call to this method. if not, return to escape the action
        let now = new Date().getTime();
        if (this.#lastFrame && (now - this.#lastFrame < Configuration.minFrameTime)) {
            this.#frameId = window.requestAnimationFrame(this.#frame.bind(this));
            return;
        }
        this.#lastFrame = now;
        // decrement the frame counters and call frame methods when counters ellapse
        this.#frameCount--;
        if (!this.#frameCount) {
            this.#frameCount = Configuration.frequency;
            // call the keyframe method
            this.#keyframe();
            this.#keyframeCount--;
            if (!this.#keyframeCount) {
                this.#keyframeCount = Configuration.keyframes;
                // call the main frame method. if returns true(finish game flag), escape the routine here, to prevent further model rendering and animationFrame requests;
                if (this.#mainframe()) return;
            }
            this.#renderModel();
        }
        if (this.#play) this.#frameId = window.requestAnimationFrame(this.#frame.bind(this));
    }

    #keyframe() {
        if (!this.#part) {
            this.#part = PartFactory.create();
        } else {
            if (this.#part.y >= 0) {
                // rotate part
                if (this.#keysPressed.ArrowUp || this.#keysPressed.Space) {
                    if (!this.#keyLock) {
                        this.#keyLock = true;
                        if (this.#part) this.#part.swapInstance();
                        if (this.#testPartCollision()) this.#part.swapInstance(true);
                    }
                }
                // move part to the LEFT
                if (this.#keysPressed.ArrowLeft) {
                    this.#part.x--;
                    if (this.#testPartCollision()) this.#part.x++;
                }
                // move part to the RIGHT
                if (this.#keysPressed.ArrowRight) {
                    this.#part.x++;
                    if (this.#testPartCollision()) this.#part.x--;
                }
            }
            // move part DOWN
            if (this.#keysPressed.ArrowDown) {
                this.#part.y++;
                if (this.#testPartCollision()) this.#part.y--;
            }
        }
    }

    #mainframe() {
        let finish = false;
        this.#part.y++;
        if (this.#testPartCollision()) {
            this.#part.y--;
            if (this.#part.y < 0) finish = true;
            this.#aggregatePart();
            this.#removeCompleteRows();
            if (finish) this.#endGame();
        }
        return finish;
    }

    #testPartCollision() {
        for (let row=0; row<4; row++) {
            let y = this.#part.y + row;
            if (y < 0 || y > Configuration.gridSize[0] - 1) continue;
            for (let col=0; col<4; col++) {
                let x = this.#part.x + col;
                if (x < 0 || x > Configuration.gridSize[1] - 1) continue;
                if (this.#model[y][x] & this.#part.model[row][col]) return true;
            }
        }
        return false;
    }

    #aggregatePart() {
        for (let row=0; row<4; row++) {
            let y = this.#part.y + row;
            if (y < 0 || y > Configuration.gridSize[0] - 1) continue;
            for (let col=0; col<4; col++) {
                let x = this.#part.x + col;
                if (x < 0 || x > Configuration.gridSize[1] - 1) continue;
                this.#model[y][x] = this.#model[y][x] | this.#part.model[row][col];
            }
        }
        this.#part = null;
    }

    #removeCompleteRows() {
        var completeRows = [];
        for (let row=this.#model.length-2; row>=0; row--) { // skip verifing the last row, as this works as a border
            let complete = true;
            for (let col=0; col<this.#model[row].length; col++) {
                if (!this.#model[row][col]) {
                    complete = false;
                    break;
                }
            }
            if (complete) completeRows.push(row);
        }
        for (let i=0; i<completeRows.length; i++) 
            this.#model.splice(completeRows[i], 1);
        for (let i=0; i<completeRows.length; i++)
            this.#model.unshift(this.#initRow());
    }

    #renderModel() {
        this.#board.innerHTML = '';
        for (let row=0; row<this.#model.length; row++) {
            for (let col=0; col<this.#model[row].length; col++) {
                if (this.#model[row][col]) {
                    this.#board.appendChild(Markup.pixel(col, row));
                }
            }
        }
        if (!this.#part) return;
        for (let row=0; row<4; row++) {
            for (let col=0; col<4; col++) {
                if (this.#part.model[row][col]) {
                    this.#board.appendChild(Markup.pixel(this.#part.x + col, this.#part.y + row)); 
                }
            }
        }
    }

}


// instantiate the Tetris class to start
const tetris = new Tetris();

export { Configuration }