/// <reference path="../tsd/phaser.d.ts"/>

const maxForce = 2000; // who knows
const SHOW_PHYSICS_DEBUG = false;
const MOTION_FORCE = 2;
declare const dat: any;
const gui = new dat.GUI();
const armsTotal = 3;
const foodCount = 100;
const urchinCount = 50;
const shellCount = 75

var tweaks = {
	stiffness: 10,
	damping: 500,
	mouthMass: 10,
	tentacleForce: 200,
	armLengthStiffness: 30,
	armLengthRelaxation: 10
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

	title: Phaser.Sprite;

	mouth: Phaser.Sprite;
	armList: Arm[];

	keyList = [];

	allFood: Phaser.Group;
	urchinGroup: Phaser.Group; //Declare ALL the globals

	playerEnergy: PlayerEnergy;

	armsCollisionGroups: Phaser.Physics.P2.CollisionGroup[];

	constructor() {
		this.game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', {
			create: this.create, preload: this.preload, update: this.update
		});
	}
	preload() {
		this.game.load.image('background', 'assets/background-tile.png');
		this.game.load.image('segment', 'assets/ball.png');
		this.game.load.image('eyeball-base', 'assets/eyeball-base.png');
		this.game.load.image('eyeball-iris', 'assets/eyeball-iris.png');
		this.game.load.image('eyeball-highlight', 'assets/eyeball-highlight.png');
		this.game.load.image('mouth-closed', 'assets/mouth-closed.png');
		this.game.load.image('mouth-bite0', 'assets/mouth-bite0.png');
		this.game.load.image('mouth-bite1', 'assets/mouth-bite1.png');
		this.game.load.image('mouth-bite2', 'assets/mouth-bite2.png');

		this.game.load.image('food', 'assets/food.gif');
		this.game.load.image('shell', 'assets/shell.gif');
		this.game.load.image('energy', 'assets/energy.gif')
		//	this.game.load.image('segment', 'assets/segment.png');
		this.game.load.image('title', 'assets/title.png');
	}

	create() {

		this.game.add.tileSprite(0, 0, 1920, 1920, 'background');

		this.game.world.setBounds(0, 0, 1920, 1920);

		console.log(this.game.world.centerX, this.game.world.centerY);

		this.playerEnergy = new PlayerEnergy(this.game, 1000);

		this.mouth = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "segment");
		this.mouth.scale.set(0.8);

		// add eyes
		const eyeDistance = 50;
		const eyes:Eye[] = [];
		for(var i=0; i<3; i++) {
			// i eye captain
			let x = Math.sin( 2*Math.PI * (i/3) ) * eyeDistance;
			let y = Math.cos( 2*Math.PI * (i/3) ) * eyeDistance;
			console.log(`eye ${i}, ${x}:${y}`);
			let eye = new Eye(this.game, x, y);
			eye.attach(this.mouth);
			eyes.push(eye);
		}
		
		// add mouth-lips
		let mouthLips = this.game.make.sprite(0,0, "mouth-bite1");
		this.mouth.addChild(mouthLips);

		window["mouth"] = mouthLips; // for in-browser debug
		window["eyes"] = eyes;  // for in-browser debug

		setTimeout(() => {
			mouthLips.body.removeFromWorld();
			eyes.forEach(e => {
				e.base.body.removeFromWorld();
				e.iris.body.removeFromWorld();
				e.iris.position.set(0,0);
				e.highlight.body.removeFromWorld();
				e.highlight.position.set(0,0);
			});
		},0);
		
		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.camera.follow(this.mouth);

		// Enabled physics on mouth
		this.game.physics.p2.enable([this.mouth], SHOW_PHYSICS_DEBUG);
		this.game.physics.p2.setImpactEvents(true);

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

		// Collision groups
		var foodCollisionGroup = this.game.physics.p2.createCollisionGroup();
		var shellCollisionGroup = this.game.physics.p2.createCollisionGroup();
		var urchinCollisionGroup = this.game.physics.p2.createCollisionGroup();
		var mouthCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.armsCollisionGroups = [];

		this.game.physics.p2.updateBoundsCollisionGroup();


		for (let i = 0; i < armsTotal; i++) {
			this.armsCollisionGroups.push(this.game.physics.p2.createCollisionGroup());
		}

		// var foodHitArm = (playerBody, foodBody) => {
		// 	let sprite = foodBody.sprite;
		// 	sprite.kill();if (sprite.group){   sprite.group.remove(sprite);}else if (sprite.parent){   sprite.parent.removeChild(sprite);}
		// 	foodBody.destroy();
		// };

		var foodHitMouth = (playerBody, foodBody) => {
			let sprite = foodBody.sprite;
			sprite.kill(); if (sprite.group) { sprite.group.remove(sprite); } else if (sprite.parent) { sprite.parent.removeChild(sprite); }
			foodBody.destroy();

			this.playerEnergy.increaeEnergy(100);
		};

		var urchinHitPlayer = (playerBody, urchinBody) => {
			// Do reactionary things
			console.log("Hit urchin");
		};

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
			this.armList[a].balls.forEach(ball => {
				ball.body.setCollisionGroup(this.armsCollisionGroups[a]);
				ball.body.collides([foodCollisionGroup, shellCollisionGroup]);
				ball.body.collides(urchinCollisionGroup, urchinHitPlayer);

				for (let i = 0; i < armsTotal; i++) { // There must be a javascript way todo this - find later.
					if (i != a) {
						ball.body.collides(this.armsCollisionGroups[i]);
					}
				}
			});
		}

		this.mouth.body.setCollisionGroup(mouthCollisionGroup);
		this.mouth.body.collides(foodCollisionGroup, foodHitMouth)
		this.mouth.body.collides(urchinCollisionGroup, urchinHitPlayer);

		this.allFood = this.game.add.group();
		this.allFood.enableBody = true;
		this.allFood.physicsBodyType = Phaser.Physics.P2JS;

		for (var i = 0; i < foodCount; i++) {
			var food = this.allFood.create(this.game.world.randomX, this.game.world.randomY, 'food');
			food.body.setRectangle(20, 20);
			food.body.setCollisionGroup(foodCollisionGroup);
			food.body.collides(this.armsCollisionGroups.concat([foodCollisionGroup, shellCollisionGroup, urchinCollisionGroup]));
			food.scale.setTo(0.5, 0.5);
		}

		this.urchinGroup = this.game.add.group();
		this.urchinGroup.enableBody = true;
		this.urchinGroup.physicsBodyType = Phaser.Physics.P2JS;

		for (let i = 0; i < urchinCount; i++) {
			var urchin = this.urchinGroup.create(this.game.world.randomX, this.game.world.randomY, 'urchin');
			urchin.body.setRectangle(30, 30);
			urchin.body.setCollisionGroup(urchinCollisionGroup);
			urchin.body.collides(this.armsCollisionGroups.concat([foodCollisionGroup, shellCollisionGroup, urchinCollisionGroup]));
			urchin.scale.setTo(0.75, 0.75);
		}

		// Don't really need to worry about shells after creation

		var shellGroup = this.game.add.group();
		shellGroup.enableBody = true;
		shellGroup.physicsBodyType = Phaser.Physics.P2JS;

		for (let i = 0; i < shellCount; i++) {
			var shell = shellGroup.create(this.game.world.randomX, this.game.world.randomY, 'shell');
			shell.body.setRectangle(40, 40);
			shell.body.setCollisionGroup(shellCollisionGroup);
			shell.body.collides([foodCollisionGroup, shellCollisionGroup, mouthCollisionGroup, urchinCollisionGroup].concat(this.armsCollisionGroups));
		}

		// TITLESCREEN
		this.title = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "title");
		this.title.pivot.set(this.title.width / 2, this.title.height / 2);
		this.title.scale.set(0.8);
		this.title.fixedToCamera = true;

		// Sort out z-index of important items
		this.mouth.bringToTop();
		this.title.bringToTop();

		window["game"] = this;
	}

	update() {

		// Hide title screen after a while
		// Feel free to delete this or move it somewhere else somehow
		if (this.title && this.game.time.now > 1000) {
			this.title.alpha -= 0.05;
			if (this.title.alpha < 0) {
				this.game.world.removeChild(this.title);
			}
		}

		function anglise(tip: Phaser.Sprite, direction: number, force: number): Phaser.Point {
			let rotation = tip.rotation + direction;
			let x = Math.cos(rotation) * force;
			let y = Math.sin(rotation) * force;
			return new Phaser.Point(x, y);
		}

		function forceBody(tip: Phaser.Sprite, keys, forceAmt) {
			let xForce = 0;
			let yForce = 0;
			if (keys.left.isDown) {
				let result = anglise(tip, 0, forceAmt);
				xForce += result.x;
				yForce += result.y;
			}
			if (keys.right.isDown) {
				let result = anglise(tip, Math.PI, forceAmt);
				xForce += result.x;
				yForce += result.y;
			}

			if (keys.up.isDown) {
				let result = anglise(tip, Math.PI / 2, forceAmt * MOTION_FORCE);
				xForce += result.x;
				yForce += result.y;

			}
			if (keys.down.isDown) {
				let result = anglise(tip, Math.PI * 3 / 2, forceAmt * MOTION_FORCE);
				xForce += result.x;
				yForce += result.y;
			}
			tip.body.force.x = xForce;
			tip.body.force.y = yForce;
		}

		for (let a = 0; a < armsTotal; ++a) {
			forceBody(this.armList[a].tip, this.keyList[a], tweaks.tentacleForce);
		}

		this.playerEnergy.decreaseEnergy(1);
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