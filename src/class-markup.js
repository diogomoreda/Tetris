import { Configuration } from './../main'

class Markup {

    static board() {
        let board = document.createElement('div');
        board.className = 'tetris';
        board.style.cssText = `
            box-sizing: content-box; 
            position: relative; 
            width: ${Configuration.gridSize[1] * Configuration.pixelSize}px; 
            height: ${Configuration.gridSize[0] * Configuration.pixelSize}px; 
            border: 1px solid #fff;
            margin: 0 auto;`
        return board;
    }

    static pixel(x, y) {
        let pixel = document.createElement('div');
        pixel.style.cssText = `
            position: absolute; 
            width: ${Configuration.pixelSize}px; 
            height: ${Configuration.pixelSize}px; 
            top: ${y * Configuration.pixelSize}px; 
            left: ${x * Configuration.pixelSize}px; 
            background-color: #999999;`;
        return pixel;
    }

    static intro() {
        let intro = document.createElement('section');
        intro.className = 'intro';
        intro.innerHTML = `
            <div>
                <h1>TETRIS</h1>
            </div>
            <div>
                <span>press the Space key to start</span>
            </div>
            <div>
                <ul>
                    <li>
                        <strong>Left Arrow</strong>
                        <span>move pieces towards the left</span>
                    </li>
                    <li>
                        <strong>Right Arrow</strong>
                        <span>move pieces towards the right</span>
                    </li>
                    <li>
                        <strong>Down Arrow</strong>
                        <span>accelerate pieces downwards descent</span>
                    </li>
                    <li>
                        <strong>Up Arrow / Space bar</strong>
                        <span>rotate pieces</span>
                    </li>
                    <li>
                        <strong>Enter key / Escape</strong>
                        <span>Pause / Resume game</span>
                    </li>
            </div>
        `;
        return intro;
    }

    static outro() {
        let outro = document.createElement('section');
        outro.className = 'outro';
        outro.innerHTML = `
            <div>
                <h2>GAME OVER</h2>
            </div>
            <div>
                <strong>press the Space key to restart</strong>
            </div>
        `;
        return outro;
    }
}


export { Markup } 