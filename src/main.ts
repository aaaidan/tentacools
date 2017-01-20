const maxForce = 2000; // who knows
const SHOW_PHYSICS_DEBUG = false;

class Arm {

	sprite: Phaser.Group;
	balls: Phaser.Sprite[];
	game: Phaser.Game;

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

		var lastBall:Phaser.Sprite = null;
		this.balls.forEach( b => {
			b.body.mass = totalMass / ballCount;
			b.body.collideWorldBounds = false;			
			if (lastBall) {
				this.game.physics.p2.createRevoluteConstraint( b, [0,0], lastBall, [0,20], maxForce );
				this.game.physics.p2.createRotationalSpring( b, lastBall, 0, 80, 4 );
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

/// <reference path="../tsd/phaser.d.ts"/>
class SimpleGame {
    game: Phaser.Game;
    mouth: Phaser.Sprite;
    arm1: Phaser.Sprite;
	arm2: Phaser.Sprite;
	arm3: Phaser.Sprite;

	cursors: Phaser.CursorKeys;
	cursors2: Phaser.CursorKeys;
	cursors3: Phaser.CursorKeys;

	j1: Phaser.Physics.P2.RevoluteConstraint;
	j2: Phaser.Physics.P2.RevoluteConstraint;
	j3: Phaser.Physics.P2.RevoluteConstraint;

	a1: Arm;

    constructor() {
        this.game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', {
            create: this.create, preload: this.preload, update: this.update, forEachArm: this.forEachArm
        });
    }
    preload() {
        this.game.load.image("decepticon", "assets/square.jpg");

		this.game.load.image('background','assets/debug-grid-1920x1920.png');


		this.game.load.image("ball1", "assets/ball-1.png");
		this.game.load.image("ball2", "assets/ball-2.png");
		this.game.load.image("ball3", "assets/ball-3.png");

		this.game.load.image("arm1", "assets/tentacool-01.png");
		this.game.load.image("arm2", "assets/tentacool-02.png");
		this.game.load.image("arm3", "assets/tentacool-03.png");
		this.game.load.image("mouth", "assets/mouth.png");
    }

	forEachArm( cb: (a:Phaser.Sprite) => void ) {
		cb(this.arm1);
		cb(this.arm2);
		cb(this.arm3);
	}

    create() {

    	this.game.add.tileSprite(0, 0, 1920, 1920, 'background');

    	this.game.world.setBounds(0, 0, 1920, 1920);		

        this.mouth = this.game.add.sprite(this.game.width/2, this.game.height/2, "mouth");
        this.arm1 = this.game.add.sprite(this.game.width/2, this.game.height * 0.1, "arm1");
		this.arm2 = this.game.add.sprite(this.game.width * 0.1, this.game.height * 0.8, "arm2");
		this.arm3 = this.game.add.sprite(this.game.width * 0.9, this.game.height * 0.8, "arm3");

		this.mouth.bringToTop();

		// this.mouth.scale.set(0.1);
		// this.arm1.scale.set(0.1);
		// this.arm2.scale.set(0.1);
		// this.arm3.scale.set(0.1);

        this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.camera.follow(this.mouth);

        // Enabled physics on our sprites
        this.game.physics.p2.enable([this.mouth, this.arm1, this.arm2, this.arm3], SHOW_PHYSICS_DEBUG);

		// setup behaviour of individual bits
		this.mouth.body.mass = 5;
		this.forEachArm( a => {
			a.body.collideWorldBounds = false;
			// a.body.clearShapes(); // remove the default rectangle
		});

        // Make our one body motionless
        // this.mouth.body.static = true;
        
        // Now create a sprite between our two bodies, parameters are rest length, stiffness and damping
        // Rest length is the length of the spring at rest ( where it's not under pressure )
        // Stiffness is the resistance to movement of the spring
        // Damping determines how fast the spring loses it's "boing"  Our low damping keeps our spring "boinging"
        // Boing is a word I made up to describe the up and down motion of a spring doing it's spring thing
        // var sp1 = this.game.physics.p2.createSpring(this.mouth, this.arm1, 100, 5, 0.2);
		// var sp2 = this.game.physics.p2.createSpring(this.mouth, this.arm2, 100, 5, 0.2);
		// var sp3 = this.game.physics.p2.createSpring(this.mouth, this.arm3, 100, 5, 0.2);

		var setupRevoluteConstraints = () => {
			this.j1 = this.game.physics.p2.createRevoluteConstraint( this.mouth, [0,0], this.arm1, [0,150], maxForce );
			this.j2 = this.game.physics.p2.createRevoluteConstraint( this.mouth, [0,0], this.arm2, [0,150], maxForce );
			this.j3 = this.game.physics.p2.createRevoluteConstraint( this.mouth, [0,0], this.arm3, [0,150], maxForce );

			this.j1.setLimits(
				2 * Math.PI / 3 * 0 - 0.2,
				2 * Math.PI / 3 * 0 + 0.2);
			this.j2.setLimits(
				2 * Math.PI / 3 * 1 - 0.2,
				2 * Math.PI / 3 * 1 + 0.2);
			this.j3.setLimits(
				2 * Math.PI / 3 * 2 - 0.2,
				2 * Math.PI / 3 * 2 + 0.2);
		}
		setupRevoluteConstraints();
		
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

		var setupNoodlyAppendage = (imageName, rotation) => {
			this.a1 = new Arm(this.game, imageName);
			// this.a1.sprite.position.set( 100,100 );
			this.game.world.add(this.a1.sprite);
			this.a1.attachTo(this.mouth.body, rotation);
		}
		setupNoodlyAppendage("ball1", 2*Math.PI * (0/3) );
		setupNoodlyAppendage("ball2", 2*Math.PI * (1/3) );
		setupNoodlyAppendage("ball3", 2*Math.PI * (2/3) );
		
		
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

		forceBody(this.arm1, this.cursors, FORCE);
		forceBody(this.arm2, this.cursors2, FORCE);
		forceBody(this.arm3, this.cursors3, FORCE);

	}
}

window.onload = () => {
    var game = new SimpleGame();
};