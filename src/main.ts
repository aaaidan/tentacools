/// <reference path="../tsd/phaser.d.ts"/>

const maxForce = 2000; // who knows
const SHOW_PHYSICS_DEBUG = true || true;

declare const dat: any;
const gui = new dat.GUI();
const armsTotal = 3;
const foodCount = 200;

var tweaks = {
	stiffness: 10,
	damping: 500,
	mouthMass: 30,
	tentacleForce: 300,
	armLengthStiffness: 30,
	armLengthRelaxation: 10  // 35?
}

function extendGuiParameterToSupportMultipleListeners(guiParam) {
	guiParam.___changeCallbacks___ = [];
	guiParam.addListener = (function (callback) {
		this.___changeCallbacks___.push(callback);
	}).bind(guiParam);
	guiParam.onChange((function (val) {
		this.___changeCallbacks___.forEach(cb => cb(val));
	}).bind(guiParam));
}

var stiffness = gui.add(tweaks, 'stiffness', 1, 50);
extendGuiParameterToSupportMultipleListeners(stiffness);

var damping = gui.add(tweaks, 'damping', 1, 500);
extendGuiParameterToSupportMultipleListeners(damping);

var mouthMass = gui.add(tweaks, 'mouthMass', 1, 500);

var tentacleForce = gui.add(tweaks, 'tentacleForce', 10, 500);

var armLengthStiffness = gui.add(tweaks, 'armLengthStiffness', 1, 50);
extendGuiParameterToSupportMultipleListeners(armLengthStiffness);

var armLengthRelaxation = gui.add(tweaks, 'armLengthRelaxation', 1, 50);
extendGuiParameterToSupportMultipleListeners(armLengthRelaxation);

class SimpleGame {
	game: Phaser.Game;
	mouth: Phaser.Sprite;

	armList: Arm[];
	keyList = [];

	constructor() {
		this.game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', {
			create: this.create, preload: this.preload, update: this.update
		});
	}
	preload() {
		this.game.load.image('background', 'assets/debug-grid-1920x1920.png');
	//	this.game.load.image('segment', 'assets/segment.png');
	}

	create() {

		this.game.add.tileSprite(0, 0, 1920, 1920, 'background');

		this.game.world.setBounds(0, 0, 1920, 1920);

		console.log(this.game.world.centerX, this.game.world.centerY);

		this.mouth = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "mouth");
		this.mouth.bringToTop();

		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.camera.follow(this.mouth);

		// Enabled physics on mouth
		this.game.physics.p2.enable([this.mouth], SHOW_PHYSICS_DEBUG);

		// setup behaviour of individual bits

		this.mouth.body.mass = tweaks.mouthMass;
		mouthMass.onChange(value => this.mouth.body.mass = value);
		this.keyList = [];
		var setupCursors = () => {
			this.keyList[0] = this.game.input.keyboard.createCursorKeys();
			this.keyList[1] = {
				left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
				right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
				up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
				down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
			}
			this.keyList[2] = {
				left: this.game.input.keyboard.addKey(Phaser.Keyboard.J),
				right: this.game.input.keyboard.addKey(Phaser.Keyboard.L),
				up: this.game.input.keyboard.addKey(Phaser.Keyboard.I),
				down: this.game.input.keyboard.addKey(Phaser.Keyboard.K),
			}
			this.keyList[3] = {
				left: this.game.input.keyboard.addKey(Phaser.Keyboard.J),
				right: this.game.input.keyboard.addKey(Phaser.Keyboard.L),
				up: this.game.input.keyboard.addKey(Phaser.Keyboard.I),
				down: this.game.input.keyboard.addKey(Phaser.Keyboard.K),
			}
			this.keyList[4] = {
				left: this.game.input.keyboard.addKey(Phaser.Keyboard.F),
				right: this.game.input.keyboard.addKey(Phaser.Keyboard.H),
				up: this.game.input.keyboard.addKey(Phaser.Keyboard.T),
				down: this.game.input.keyboard.addKey(Phaser.Keyboard.G),
			}
			this.keyList[5] = {
				left: this.game.input.keyboard.addKey(Phaser.Keyboard.Z),
				right: this.game.input.keyboard.addKey(Phaser.Keyboard.V),
				up: this.game.input.keyboard.addKey(Phaser.Keyboard.X),
				down: this.game.input.keyboard.addKey(Phaser.Keyboard.C),
			}
		}
		setupCursors();

		var createNoodlyAppendage = (armIndex) => {
			var arm = new Arm(this.game, armIndex);
			this.game.world.add(arm.sprite);
			let appendageRotation = 2 * Math.PI * (armIndex / armsTotal);
			arm.attachTo(this.mouth.body, appendageRotation);
			return arm;
		}
		this.armList = [];
		for (let a = 0; a < armsTotal; ++a) {
			this.armList[a] = createNoodlyAppendage(a);
		}

		// this.mouth.body.static = true;
		//this.mouth.body.rotateRight(3000); // temp hack, counter inertial twisting of initialisation of appendages

		// Collision stuff
		this.game.physics.p2.setImpactEvents(true);

		var foodCollisionGroup = this.game.physics.p2.createCollisionGroup();
		var starfishCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.game.physics.p2.updateBoundsCollisionGroup();
		
		var allFood = this.game.add.group();
		allFood.enableBody = true;
		allFood.physicsBodyType = Phaser.Physics.P2JS;

		for (var i = 0; i < foodCount; i++)
		{
			var food = allFood.create(this.game.world.randomX, this.game.world.randomY, 'food');
			food.body.setRectangle(40, 40);
			food.body.setCollisionGroup(foodCollisionGroup);

			food.body.collides([foodCollisionGroup, starfishCollisionGroup]);
		}

		var foodHit = (playerBody, foodBody) => {
			foodBody.sprite.alpha -= 0.1;
		};

		this.armList.forEach(arm => {
			arm.balls.forEach(ball => {
				ball.body.setCollisionGroup(starfishCollisionGroup);
				ball.body.collides(foodCollisionGroup, foodHit);
			});
		});
		//End collision stuff

		window["game"] = this;
	}

	update() {
		function forceBody(arm, keys, forceAmt) {
			if (keys.left.isDown) {
				arm.body.force.x = -forceAmt;
				// arm.body.rotateLeft(forceAmt)
			}
			else if (keys.right.isDown) {
				arm.body.force.x = forceAmt;
				// arm.body.rotateRight(forceAmt);
			}

			if (keys.up.isDown) {
				arm.body.force.y = -forceAmt;
			}
			else if (keys.down.isDown) {
				arm.body.force.y = forceAmt;
			}

		}

		for (let a = 0; a < armsTotal; ++a) {
			forceBody(this.armList[a].tip, this.keyList[a], tweaks.tentacleForce);
		}
	}
}

window.onload = () => {
	var game = new SimpleGame();
};

function armDraw() {
	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { create: create });

	function create() {

		var graphics = game.add.graphics(100, 100);
		var length = 100;
		let total = 5;
		for (let count = 0; count < total; ++count) {
			graphics.lineStyle(5, 0x33FF00);
			graphics.moveTo(0, 0);
			let angle = Math.PI * 2 * (count / total);
			let x = Math.cos(angle) * length;
			let y = Math.sin(angle) * length;
			//	console.log(x,y, angle);
			graphics.lineTo(x, y);
		}

	}
}