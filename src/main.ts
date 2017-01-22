/// <reference path="../tsd/phaser.d.ts"/>

const maxForce = 2000; // who knows
const SHOW_PHYSICS_DEBUG = false;
const MOTION_FORCE = 2;
const RECOIL_FORCE = 20;
const RECOIL_DURATION_MS = 150;

declare const dat: any;
// const gui = new dat.GUI();
const armsTotal = 3;
const foodCount = 100;
const urchinCount = 5;
const shellCount = 7;
const maxFoodToWin = 3;

var tweaks = {
	stiffness: 30,
	damping: 500,
	playerBodyMass: 10,
	mouthMass: 5,
	tentacleForce: 140,
	armLengthStiffness: 40,
	armLengthRelaxation: 30,
	cameraScale: 1
}

// function extendGuiParameterToSupportMultipleListeners(guiParam) {
// 	guiParam.___changeCallbacks___ = [];
// 	guiParam.addListener = (function (callback) {
// 		this.___changeCallbacks___.push(callback);
// 	}).bind(guiParam);
// 	guiParam.onChange((function (val) {
// 		this.___changeCallbacks___.forEach(cb => cb(val));
// 	}).bind(guiParam));
// }

// var stiffness = gui.add(tweaks, 'stiffness', 1, 50);
// extendGuiParameterToSupportMultipleListeners(stiffness);

// var damping = gui.add(tweaks, 'damping', 1, 500);
// extendGuiParameterToSupportMultipleListeners(damping);

// var mouthMass = gui.add(tweaks, 'mouthMass', 1, 100);

// var tentacleForce = gui.add(tweaks, 'tentacleForce', 10, 500);

// var armLengthStiffness = gui.add(tweaks, 'armLengthStiffness', 1, 50);
// extendGuiParameterToSupportMultipleListeners(armLengthStiffness);

// var armLengthRelaxation = gui.add(tweaks, 'armLengthRelaxation', 1, 50);
// extendGuiParameterToSupportMultipleListeners(armLengthRelaxation);

// var cameraScale = gui.add(tweaks, 'cameraScale', 0.5, 3);



function setPivotCenter(image: Phaser.Image) {
	image.pivot.set(image.width / 2, image.height / 2);
}

class SimpleGame {
	game: Phaser.Game;

	title: Phaser.Sprite;
	success: Phaser.Sprite;
	controls: Phaser.Sprite;
	instructions: Phaser.Sprite;

	mouthGod: Phaser.Sprite;
	mouthGodEatAnimation: Phaser.Animation;
	mouthLips: Phaser.Image;
	eyes: Eye[];

	playerBody: Phaser.Sprite;
	armList: Arm[];

	crab: Crab;

	keyList = [];

	allFood: Phaser.Group;
	urchinGroup: Phaser.Group; //Declare ALL the globals
	urchinReaction: boolean;

	armsCollisionGroups: Phaser.Physics.P2.CollisionGroup[];
	mouthCoillisionGroup: Phaser.Physics.P2.CollisionGroup;

	foodEatenCount: number;

	constructor() {
		this.game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', {
			create: this.create, preload: this.preload, update: this.update
		});
	}
	preload() {
		this.game.load.image('background', 'assets/background-tile.png'); // assets/background-tile-space-theme.png
		this.game.load.image('segment', 'assets/ball.png');
		this.game.load.image('eyeball-base', 'assets/eyeball-base.png');
		this.game.load.image('eyeball-iris', 'assets/eyeball-iris.png');
		this.game.load.image('eyeball-highlight', 'assets/eyeball-highlight.png');
		this.game.load.image('mouth-closed', 'assets/mouth_closed.png');
		this.game.load.image('mouth-closed2', 'assets/mouth_closed2.png');
		this.game.load.image('mouth-bite0.0', 'assets/mouth_bite0.0.png');
		this.game.load.image('mouth-bite0.5', 'assets/mouth_bite0.5.png');
		this.game.load.image('mouth-bite1.0', 'assets/mouth_bite1.0.png');
		this.game.load.image('mouth-bite1.5', 'assets/mouth_bite1.5.png');
		this.game.load.image('mouth-bite2', 'assets/mouth_bite2.0.png');

		this.game.load.image('food', 'assets/boigah.png');
		this.game.load.image('shell', 'assets/shell.png');
		this.game.load.image('energy', 'assets/energy.gif');
		this.game.load.image('urchin', 'assets/urchin.png');
		this.game.load.image('food-gib1', 'assets/boigah-gib-29.png');
		this.game.load.image('food-gib2', 'assets/boigah-gib-30.png');
		this.game.load.image('food-gib3', 'assets/boigah-gib-31.png');
		this.game.load.image('food-gib4', 'assets/boigah-gib-32.png');
		this.game.load.image('food-gib5', 'assets/boigah-gib-33.png');
		this.game.load.image('food-gib6', 'assets/boigah-gib-34.png');
		this.game.load.image('food-gib7', 'assets/boigah-gib-35.png');
		this.game.load.image('food-gib8', 'assets/boigah-gib-36.png');
		this.game.load.image('food-gib9', 'assets/boigah-gib-37.png');

		this.game.load.image('screen-feedme1', 'assets/screen-feedme_1.png');
		this.game.load.image('screen-feedme2', 'assets/screen-feedme_2.png');
		this.game.load.image('screen-feedme3', 'assets/screen-feedme_3.png');
		this.game.load.image('screen-feedme4', 'assets/screen-feedme_4.png');

		this.game.load.image('doodad01', 'assets/background-doodad-01.png');
		this.game.load.image('doodad02', 'assets/background-doodad-02.png');
		this.game.load.image('doodad03', 'assets/background-doodad-03.png');
		this.game.load.image('doodad04', 'assets/background-doodad-04.png');
		this.game.load.image('doodad05', 'assets/background-doodad-05.png');
		this.game.load.image('doodad06', 'assets/background-doodad-06.png');
		this.game.load.image('doodad07', 'assets/background-doodad-07.png');
		this.game.load.image('doodad08', 'assets/background-doodad-08.png');
		
		this.game.load.spritesheet('mouth', 'assets/mouth-spritesheet.png', 173, 178);

		this.game.load.image('title', 'assets/title.png');

		this.game.load.image('success', 'assets/screen_success-alt.png');
		this.game.load.image('controls', 'assets/screen_controls.png');
		this.game.load.image('instructions', 'assets/screen_instructions.png');

	}

	create() {

		this.game.add.tileSprite(0, 0, 1920, 1920, 'background');

		this.game.world.setBounds(0, 0, 1920, 1920);

		console.log(this.game.world.centerX, this.game.world.centerY);

		let spawnOffset = 300;

		this.mouthGod = this.game.add.sprite(spawnOffset, spawnOffset, 'mouth', 1);

		this.mouthGodEatAnimation = this.mouthGod.animations.add('eat');

		let playerBodyScale = 0.65;
		let playerSpawnOffset = 150;
		this.playerBody = this.game.add.sprite(this.mouthGod.x + playerSpawnOffset, this.mouthGod.y + playerSpawnOffset, "segment");
		this.playerBody.scale.set(playerBodyScale); 


		this.foodEatenCount = 0;
		//add eyes
		// const eyeDistance = 1;
		// this.eyes = [];
		// for (var i = 0; i < 3; i++) {
		// 	// i eye captain
		// 	let x = Math.sin(2 * Math.PI * (i / 3) + 2 * Math.PI / 6) * eyeDistance;
		// 	let y = Math.cos(2 * Math.PI * (i / 3) + 2 * Math.PI / 6) * eyeDistance;
		// 	console.log(`eye ${i}, ${x}:${y}`);
		// 	let eye = new Eye(this.game, x, y);
		// 	eye.attach(this.mouthGod);
		// 	this.eyes.push(eye);
		// }

		// add mouth-lips
		// this.mouthLips = this.game.make.image(0, 0, "mouth-bite1");
		// setPivotCenter(this.mouthLips);
		// this.mouthGod.addChild(this.mouthLips);

		// window["mouth"] = this.mouthLips; // for in-browser debug
		// window["eyes"] = this.eyes;  // for in-browser debug

		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.camera.follow(this.playerBody);

		// cameraScale.onChange(scale => {
		// 	this.game.camera.scale.setTo(scale);
		// });

		// Enabled physics on mouth
		this.game.physics.p2.enable([this.playerBody, this.mouthGod], SHOW_PHYSICS_DEBUG);
		this.game.physics.p2.setImpactEvents(true);

		// setup behaviour of individual bits

		this.playerBody.body.mass = tweaks.playerBodyMass;
		this.playerBody.body.setCircle((this.playerBody.width / 2) * playerBodyScale);

		this.mouthGod.body.mass = 1000;;
		// this.mouthGod.body.setRectangle(this.mouthGod.width * 2, 90 * 2);
		this.mouthGod.body.immovable = true;
		this.mouthGod.body.moves = false;
		// mouthMass.onChange(value => this.playerBody.body.mass = value);
	
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
				left: this.game.input.keyboard.addKey(Phaser.Keyboard.F),
				right: this.game.input.keyboard.addKey(Phaser.Keyboard.H),
				up: this.game.input.keyboard.addKey(Phaser.Keyboard.T),
				down: this.game.input.keyboard.addKey(Phaser.Keyboard.G),
			}
			this.keyList[4] = {
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
		var playerBodyCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.armsCollisionGroups = [];
		this.mouthCoillisionGroup = this.game.physics.p2.createCollisionGroup();

		this.game.physics.p2.updateBoundsCollisionGroup();

		for (let i = 0; i < armsTotal; i++) {
			this.armsCollisionGroups.push(this.game.physics.p2.createCollisionGroup());
		}

		//Enemy
		this.crab = new Crab(this.game, this.game.world.centerX-200, this.game.world.centerY-200, this.playerBody);
		this.crab.base.body.setCollisionGroup(urchinCollisionGroup);
		this.crab.base.body.collides(this.armsCollisionGroups.concat([foodCollisionGroup, shellCollisionGroup, urchinCollisionGroup]));

		var foodHitMouth = (playerBody, foodBody) => {
			let sprite = foodBody.sprite;
			
			this.mouthGodEatAnimation.stop();
			this.mouthGodEatAnimation.play(18);

			sprite.kill(); if (sprite.group) { sprite.group.remove(sprite); } else if (sprite.parent) { sprite.parent.removeChild(sprite); }
			foodBody.destroy();

			this.foodEatenCount++;
		};

		this.urchinReaction = false;
		var urchinHitPlayer = (playerBody, urchinBody) => {
			this.urchinReaction = true;
			setTimeout(() => {
				this.urchinReaction = false;
			}, RECOIL_DURATION_MS);
		};

		var createNoodlyAppendage = (armIndex) => {
			var arm = new Arm(this.game, armIndex, this.playerBody.x, this.playerBody.y);
			this.game.world.add(arm.sprite);
			let appendageRotation = 2 * Math.PI * (armIndex / armsTotal);
			arm.attachTo(this.playerBody.body, appendageRotation);
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

		var randomDoodad = () => {
			return "doodad0" + (Math.floor(Math.random()*8) + 1);
		}
		for (var i=0; i<20; i++) {
			this.game.add.image(this.game.world.randomX, this.game.world.randomY, randomDoodad());
		}

		this.playerBody.body.setCollisionGroup(playerBodyCollisionGroup);
		this.playerBody.body.collides([foodCollisionGroup, shellCollisionGroup]);
		this.playerBody.body.collides(urchinCollisionGroup, urchinHitPlayer);


		this.mouthGod.body.setCollisionGroup(this.mouthCoillisionGroup);
		this.mouthGod.body.collides([shellCollisionGroup, urchinCollisionGroup]);
		this.mouthGod.body.collides(foodCollisionGroup, foodHitMouth);

		this.allFood = this.game.add.group();
		this.allFood.enableBody = true;
		this.allFood.physicsBodyType = Phaser.Physics.P2JS;

		for (var i = 0; i < foodCount; i++) {
			var food = this.allFood.create(this.game.world.randomX, this.game.world.randomY, 'food');
			food.scale.setTo(0.2, 0.2);
			food.body.setCircle(food.width / 2 * 0.8, 0, 0, 0);
			food.body.setCollisionGroup(foodCollisionGroup);
			food.body.collides(this.armsCollisionGroups.concat([playerBodyCollisionGroup, foodCollisionGroup, shellCollisionGroup, urchinCollisionGroup, this.mouthCoillisionGroup]));
		}

		this.urchinGroup = this.game.add.group();
		this.urchinGroup.enableBody = true;
		this.urchinGroup.physicsBodyType = Phaser.Physics.P2JS;

		for (let i = 0; i < urchinCount; i++) {
			var urchin = this.urchinGroup.create(this.game.world.randomX, this.game.world.randomY, 'urchin');
			urchin.scale.setTo(0.2);
			urchin.body.setCircle(urchin.width / 2 * 0.8, 0, 0, 0);
			urchin.body.setCollisionGroup(urchinCollisionGroup);
			urchin.body.collides(this.armsCollisionGroups.concat([playerBodyCollisionGroup, foodCollisionGroup, shellCollisionGroup, urchinCollisionGroup, this.mouthCoillisionGroup]));
		}

		// Don't really need to worry about shells after creation

		var shellGroup = this.game.add.group();
		shellGroup.enableBody = true;
		shellGroup.physicsBodyType = Phaser.Physics.P2JS;
 
		for (let i = 0; i < shellCount; i++) {
			var shell = shellGroup.create(this.game.world.randomX, this.game.world.randomY, 'shell');
			shell.scale.setTo(0.55);
			shell.body.setCircle(shell.width / 2 * 0.8, 0, 0, 0);
			shell.body.setCollisionGroup(shellCollisionGroup);
			shell.body.collides([foodCollisionGroup, shellCollisionGroup, playerBodyCollisionGroup, urchinCollisionGroup, this.mouthCoillisionGroup].concat(this.armsCollisionGroups));
		}

		// TITLESCREEN
		this.title = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "title");
		this.title.pivot.set(this.title.width / 2, this.title.height / 2);
		this.title.scale.set(0.8);
		this.title.fixedToCamera = true;

		// instructions
		this.instructions = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "instructions");
		this.instructions.pivot.set(this.instructions.width / 2, this.instructions.height / 2);
		this.instructions.scale.set(0.8);
		this.instructions.alpha = 0;

		// controls
		this.controls = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "controls");
		this.controls.pivot.set(this.controls.width / 2, this.controls.height / 2);
		this.controls.scale.set(0.8);
		this.controls.alpha = 0;

		// Sort out z-index of important items
		this.playerBody.bringToTop();
		this.title.bringToTop();

		window["game"] = this;
	}

	update() {

		// Hide title screen after a while
		// Feel free to delete this or move it somewhere else somehow
		if (this.title && this.game.time.now > 3000) {
			this.title.alpha -= 0.05;
			if (this.title.alpha < 0) {
				this.game.world.removeChild(this.title);
				
				this.title = null;
				this.instructions.alpha = 1;
				this.instructions.fixedToCamera = true;
				this.instructions.bringToTop();
			}
		}

		if (!this.title && this.instructions && this.game.time.now > 7000) {
			this.instructions.alpha -= 0.05;
			if (this.instructions.alpha < 0) {
				this.game.world.removeChild(this.instructions)
				this.instructions = null;
				this.controls.alpha = 1;
				this.controls.fixedToCamera = true;
				this.controls.bringToTop();
			}
		}

		if (!this.instructions && this.controls && this.game.time.now > 12000) {
			this.controls.alpha -= 0.05;
			if (this.controls.alpha < 0) {
				this.game.world.removeChild(this.controls);
				this.controls = null;
			}
		}

		if (this.foodEatenCount >= maxFoodToWin) {
			console.log("You have won");
		}

		function anglise(tip: Phaser.Sprite, direction: number, force: number): Phaser.Point {
			let rotation = tip.rotation + direction;
			let x = Math.cos(rotation) * force;
			let y = Math.sin(rotation) * force;
			return new Phaser.Point(x, y);
		}

		var forceBody = (tip: Phaser.Sprite, keys, forceAmt) => {
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
			if (this.urchinReaction) {
				let result = anglise(tip, Math.PI * 3 / 2, forceAmt * RECOIL_FORCE);
				xForce += result.x;
				yForce += result.y;
			}
			tip.body.force.x = xForce;
			tip.body.force.y = yForce;
		}

		for (let a = 0; a < armsTotal; ++a) {
			forceBody(this.armList[a].tip, this.keyList[a], tweaks.tentacleForce);
		}

		// this.mouthLips.rotation = -this.mouthLips.parent.rotation; // always up
		// this.eyes.forEach(e => e.update());
		this.armList.forEach(arm => arm.update() );
		this.crab.update();

		if (this.mouthGodEatAnimation.isFinished) {
			this.mouthGodEatAnimation.play(1);
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