/// <reference path="../tsd/phaser.d.ts"/>

const maxForce = 2000; // who knows
const SHOW_PHYSICS_DEBUG = false;

declare const dat:any;
const gui = new dat.GUI();

var tweaks = {
	stiffness: 80,
	damping: 500
}

function extendGuiParameterToSupportMultipleListeners(guiParam) {
	guiParam.___changeCallbacks___ = [];
	guiParam.addListener = (function(callback) {
		this.___changeCallbacks___.push(callback);
	}).bind(guiParam);
	guiParam.onChange((function(val) {
		this.___changeCallbacks___.forEach(cb => cb(val) );
	}).bind(guiParam));
}

var stiffness = gui.add(tweaks, 'stiffness', 10, 200);
extendGuiParameterToSupportMultipleListeners(stiffness);

var damping = gui.add(tweaks, 'damping', 1, 500);
extendGuiParameterToSupportMultipleListeners(damping);

class Arm {

	static armIdCounter: number = 0;

	id: number;
	sprite: Phaser.Group;
	balls: Phaser.Sprite[];
	game: Phaser.Game;
	tip: Phaser.Sprite;
	springs: any[];

	constructor(game:Phaser.Game, spriteName:String) {
		this.id = Arm.armIdCounter++;

		this.game = game;
		this.balls = [];
		this.springs = [];
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
				var spring = this.game.physics.p2.createRotationalSpring( b, lastBall, 0, tweaks.stiffness, tweaks.damping );
				this.springs.push(spring);
			}
			lastBall = b;
		});

		stiffness.addListener((value) => {
			this.springs.forEach( s => {
				s.data.stiffness = value;
				console.log("stiff", value, this.id);
			});
		});
		damping.addListener((value) => {
			this.springs.forEach( s => {
				s.data.damping = value;
				console.log("damp", value, this.id);
			});
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
            create: this.create, preload: this.preload, update: this.update
        });
    }
    preload() {
		this.game.load.image('background','assets/debug-grid-1920x1920.png');
    }

    create() {

    	this.game.add.tileSprite(0, 0, 1920, 1920, 'background');

    	this.game.world.setBounds(0, 0, 1920, 1920);		

        this.mouth = this.game.add.sprite(this.game.width/2, this.game.height/2, "mouth");
		this.mouth.bringToTop();

		// this.mouth.scale.set(0.1);
		// this.arm1.scale.set(0.1);
		// this.arm2.scale.set(0.1);
		// this.arm3.scale.set(0.1);

        this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.camera.follow(this.mouth);

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