import Game from "./game.js";
import { ICoord, IRect, IHitboxOffset, loadImage, areRectanglesColliding } from "./util.js";

export default class Copter {
	game: Game;
	x: number;
	y: number;
	width: number;
	height: number;
	xv: number;
	yv: number;
	g: number;
	power: number;
	climbing: boolean;
	hitbox: IRect;
	hitBoxOffset: IHitboxOffset;
	img: HTMLImageElement;
	smokeImg: HTMLImageElement;
	smoke: ICoord[];
	distance: number;
	best: number;
	startTime: number;

	constructor(game: Game) {
		this.game = game;
		this.g = 3500;
		this.power = 6500;
		this.hitBoxOffset = { left: 10, right: 10, top: 5, bottom: 5 };
		this.loadAssets();
	}

	init() {
		this.x = this.game.width / 4;
		this.y = this.game.height / 2;
		this.xv = 700;
		this.yv = 0;
		this.width = 124;
		this.height = 57;
		this.climbing = false;
		this.smoke = [];
		this.best = this.distance && this.distance > this.best ? this.distance : this.best || 0;
		this.distance = 0;
		this.startTime = undefined;
	}

	loadAssets() {
		this.img = loadImage("/img/copter.png");
		this.smokeImg = loadImage("/img/smoke.png");
	}

	update(step: number) {
		if (this.game.paused) return;

		if (this.startTime === undefined) this.startTime = Date.now();
		this.distance = Math.floor((Date.now() - this.startTime) / 30);

		// update position
		this.yv += this.g * step;
		if (this.climbing) this.yv -= this.power * step;
		this.y += this.yv * step;

		// update hitbox position
		this.hitbox = {
			x: this.x + this.hitBoxOffset.left,
			y: this.y + this.hitBoxOffset.top,
			width: this.width - this.hitBoxOffset.left - this.hitBoxOffset.right,
			height: this.height - this.hitBoxOffset.top - this.hitBoxOffset.bottom
		};

		// enforce maximum vertical speeds
		if (this.yv < -500) this.yv = -500;
		if (this.yv > 650) this.yv = 650;

		// check for collision with tunnel
		for (const segment of this.game.terrain.tunnel) {
			const segmentTopRect: IRect = { x: segment.x, y: 0, width: segment.length, height: segment.topDepth };
			if (areRectanglesColliding(this.hitbox, segmentTopRect)) {
				this.game.isOver = true;
			}

			const segmentBotRect: IRect = { x: segment.x, y: this.game.height - segment.botDepth, width: segment.length, height: segment.botDepth };
			if (areRectanglesColliding(this.hitbox, segmentBotRect)) {
				this.game.isOver = true;
			}
		}

		// check for collision with blocks
		for (const block of this.game.terrain.blocks) {
			if (areRectanglesColliding(this.hitbox, block)) {
				this.game.isOver = true;
			}
		}

		this.updateSmoke(step);
	}

	updateSmoke(step: number) {
		// add new smoke puff
		if (this.smoke.length === 0 || this.x - this.smoke[this.smoke.length - 1].x >= 40) {
			this.smoke.push({ x: this.x - this.smokeImg.width + 4, y: this.y + 6 });
		}

		// remove smoke puff if it is offscreen
		if (this.smoke[0].x < -this.smokeImg.width) {
			this.smoke.shift();
		}

		// update position
		for (const s of this.smoke) {
			s.x -= this.xv * step;
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		if (this.climbing && !this.game.paused && !this.game.isOver) {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(-5 * Math.PI / 180);
			ctx.drawImage(this.img, 0, 0);
			ctx.restore();
		} else {
			ctx.drawImage(this.img, this.x, this.y);
		}
	}

	drawSmoke(ctx: CanvasRenderingContext2D) {
		for (const s of this.smoke) {
			ctx.drawImage(this.smokeImg, s.x, s.y);
		}
	}
}
