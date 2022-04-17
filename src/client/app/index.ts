import "../css/style.css";

import { Game } from "./game";
import { InputHandler } from "./input";
import { now } from "./util";
import { WindowHandler } from "./window";

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

window.addEventListener("load", async () => {
	// @ts-ignore
	if (!navigator.serviceWorker.controller) {
		// @ts-ignore
		await navigator.serviceWorker.register("sw.js");
		console.log("new service worker registeredz");
	} else console.log("active service worker found");

	canvas.style.display = "block";
});

const game = new Game();
new InputHandler(canvas, game);
new WindowHandler(canvas, game);
game.init();

let current: number,
	delta: number,
	last: number = now();

const frame = () => {
	current = now();
	delta = (current - last) / 1000;
	requestAnimationFrame(frame);
	game.update(delta);
	game.draw(ctx);
	last = current;
};

requestAnimationFrame(frame);
