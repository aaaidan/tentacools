/// <reference path="../tsd/phaser.d.ts"/>

const maxForce = 2000; // who knows
const SHOW_PHYSICS_DEBUG = false;
const gui = new dat.GUI();

class Arm {

	sprite: Phaser.Group;
	balls: Phaser.Sprite[];
	game: Phaser.Game;
	tip: Phaser.Sprite;
	springs: any[];

	constructor(game:Phaser.Game, spriteName:String) {
		this.game = game;
		this.balls = [];
		this.sprite = new Phaser.Group(this.game);

		const segmentLength = 10;
		const totalMass = 1;
		const ballCount = 10;
		for (var i=0; i<ballCount; i++) {
			var ball:Phaser.Sprite = this.game.add.sprite(0, i * segmentLength, spriteName);
			ball.scale.set( 1 / (1 + i/(ballCount-1)) );
			this.balls.push( ball );
		}
		this.game.physics.p2.enable( this.balls, SHOW_PHYSICS_DEBUG );
		this.tip = this.balls[this.balls.length-1];

		var lastBall:Phaser.Sprite = null;
		this.balls.forEach( b => {
			b.body.mass = totalMass / ballCount;
			b.body.collideWorldBounds = false;			
			if (lastBall) {
				this.game.physics.p2.createRevoluteConstraint( b, [0,0], lastBall, [0,20], maxForce );
				var spring = this.game.physics.p2.createRotationalSpring( b, lastBall, 0, 80, 15 );
				this.springs.push(spring);
			}
			lastBall = b;
		});
	}

	getBase() {
		return this.balls[0].body;
	}

	attachTo(body:Phaser.Physics.P2.Body, rotation:number) {
		this.game.physics.p2.createRevoluteConstraint( body, [0,0], this.getBase(), [0,0], maxForce );
		const USELESS = 0; // setting rest rotation in constructor doesn't work properly for some mysterious reason
		var rotationSpring = this.game.physics.p2.createRotationalSpring( body, this.getBase(), USELESS, 120, 5 );
		rotationSpring.data.restAngle = rotation;
	}
}

class SimpleGame {
    game: Phaser.Game;
    mouth: Phaser.Sprite;

	cursors: Phaser.CursorKeys;
	cursors2: Phaser.CursorKeys;
	cursors3: Phaser.CursorKeys;

	j1: Phaser.Physics.P2.RevoluteConstraint;
	j2: Phaser.Physics.P2.RevoluteConstraint;
	j3: Phaser.Physics.P2.RevoluteConstraint;

	a1: Arm;
	a2: Arm;
	a3: Arm;

    constructor() {
        this.game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', {
            create: this.create, preload: this.preload, update: this.update, forEachArm: this.forEachArm
        });
    }
    preload() {
		// this.game.load.image("ball1", "assets/ball-1.png");
		// this.game.load.image("ball2", "assets/ball-2.png");
		// this.game.load.image("ball3", "assets/ball-3.png");

		// this.game.load.image("mouth", "assets/mouth.png");
    }

    create() {
        this.mouth = this.game.add.sprite(this.game.width/2, this.game.height/2, "mouth");
		this.mouth.bringToTop();

		// this.mouth.scale.set(0.1);
		// this.arm1.scale.set(0.1);
		// this.arm2.scale.set(0.1);
		// this.arm3.scale.set(0.1);

        this.game.physics.startSystem(Phaser.Physics.P2JS);

        // Enabled physics on mouth
        this.game.physics.p2.enable([this.mouth], SHOW_PHYSICS_DEBUG);

		// setup behaviour of individual bits
		this.mouth.body.mass = 5;
		
		var setupCursors = () => {
			this.cursors = this.game.input.keyboard.createCursorKeys();
			this.cursors2 = {
				left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
				right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
				up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
				down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
			}
			this.cursors3 = {
				left: this.game.input.keyboard.addKey(Phaser.Keyboard.J),
				right: this.game.input.keyboard.addKey(Phaser.Keyboard.L),
				up: this.game.input.keyboard.addKey(Phaser.Keyboard.I),
				down: this.game.input.keyboard.addKey(Phaser.Keyboard.K),
			}
		}
		setupCursors();

		var createNoodlyAppendage = (imageName, rotation) => {
			var arm = new Arm(this.game, imageName);
			this.game.world.add(arm.sprite);
			arm.attachTo(this.mouth.body, rotation);
			return arm;
		}
		this.a1 = createNoodlyAppendage("ball1", 2*Math.PI * (0/3) );
		this.a2 = createNoodlyAppendage("ball2", 2*Math.PI * (1/3) );
		this.a3 = createNoodlyAppendage("ball3", 2*Math.PI * (2/3) );
		
		this.mouth.body.rotateRight(3000); // temp hack, counter inertial twisting of initialisation of appendages

		window["game"] = this;
    }

	update() {
		const FORCE = 300;
		const ROTATE_FORCE = 10;

		function forceBody(arm, keys, forceAmt) {
			if (keys.left.isDown)
			{
				arm.body.force.x = -forceAmt;
				// arm.body.rotateLeft(forceAmt)
			}
			else if (keys.right.isDown)
			{
				arm.body.force.x = forceAmt;
				// arm.body.rotateRight(forceAmt);
			}
			
			if (keys.up.isDown)
			{
				arm.body.force.y = -forceAmt;
			}
			else if (keys.down.isDown)
			{
				arm.body.force.y = forceAmt;
			}
			
		} 

		forceBody(this.a1.tip, this.cursors, FORCE);
		forceBody(this.a2.tip, this.cursors2, FORCE);
		forceBody(this.a3.tip, this.cursors3, FORCE);

	}
}

window.onload = () => {
    var game = new SimpleGame();
};