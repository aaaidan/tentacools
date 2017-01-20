const maxForce = 20000; // who knows

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

    constructor() {
        this.game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', {
            create: this.create, preload: this.preload, update: this.update
        });
    }
    preload() {
        this.game.load.image("decepticon", "square.jpg");
    }
    create() {
        this.mouth = this.game.add.sprite(this.game.width/2, this.game.height/2, "decepticon");
        this.arm1 = this.game.add.sprite(this.game.width/2, this.game.height * 0.1, "decepticon");
		this.arm2 = this.game.add.sprite(this.game.width * 0.1, this.game.height * 0.8, "decepticon");
		this.arm3 = this.game.add.sprite(this.game.width * 0.9, this.game.height * 0.8, "decepticon");

        this.game.physics.startSystem(Phaser.Physics.P2JS);

        // Enabled physics on our sprites
        this.game.physics.p2.enable([this.mouth, this.arm1, this.arm2, this.arm3]);

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

		this.j1 = this.game.physics.p2.createRevoluteConstraint( this.mouth, [0,0], this.arm1, [0,150], maxForce );
		this.j2 = this.game.physics.p2.createRevoluteConstraint( this.mouth, [0,0], this.arm2, [0,150], maxForce );
		this.j3 = this.game.physics.p2.createRevoluteConstraint( this.mouth, [0,0], this.arm3, [0,150], maxForce );

		this.j1.setLimits(0 - 0.2, 0 + 0.2);
		this.j2.setLimits(2*Math.PI / 3 - 0.2, 2 * Math.PI / 3 + 0.2);
		this.j3.setLimits(2*Math.PI / 3 * 2 - 0.2, 2*Math.PI / 3 * 2 + 0.2);
		// this.j2.setLimits(-0.2, 0.2);
		// this.j3.setLimits(-0.2, 0.2);

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

	update() {
		const FORCE = 300;

		function moveBody(arm, keys) {
			if (keys.left.isDown)
			{
				arm.body.force.x = -FORCE;
			}
			else if (keys.right.isDown)
			{
				arm.body.force.x = FORCE;
			}

			if (keys.up.isDown)
			{
				arm.body.force.y = -FORCE;
			}
			else if (keys.down.isDown)
			{
				arm.body.force.y = FORCE;
			}
		} 

		moveBody(this.arm1, this.cursors);
		moveBody(this.arm2, this.cursors2);
		moveBody(this.arm3, this.cursors3);

		
		// if (this.cursors.left.isDown)
		// {
		// 	this.arm2.body.moveLeft(400);
		// }
		// else if (this.cursors.right.isDown)
		// {
		// 	this.arm2.body.moveRight(400);
		// }

		// if (this.cursors.up.isDown)
		// {
		// 	this.arm2.body.moveUp(400);
		// }
		// else if (this.game.input.
		// {
		// 	this.arm2.body.moveDown(400);
		// }

	}
}

window.onload = () => {
    var game = new SimpleGame();
};