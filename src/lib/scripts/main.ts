import Game from "$lib/game/game";

export default class Main {

    private main = document.querySelector("main.game") as HTMLElement;
    private seed: string = 'x_x';

    constructor() {
        this.startGame();
    }

    async startGame() {

        if (this.main !== null) {

            const game = new Game(this.main, this.seed);
            game.start();
        }
    }
}