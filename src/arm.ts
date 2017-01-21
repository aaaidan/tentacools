const ARM_TOTAL: number = 3;

class Arm {

	static armIdCounter: number = 0;

	id: number;
	sprite: Phaser.Group;
	balls: Phaser.Sprite[];
	game: Phaser.Game;
	tip: Phaser.Sprite;
	springs: any[];
	hinges: Phaser.Physics.P2.RevoluteConstraint[];


	constructor(game: Phaser.Game, armIndex: number) {
		this.game = game;
		this.balls = [];
		this.springs = [];
		this.hinges = [];
		this.sprite = new Phaser.Group(this.game);

		const angle = Math.PI * 2 * (armIndex / ARM_TOTAL);
		const segmentLength = 10;
		const totalMass = 1;
		const segmentCount = 15;

		for (var i = 0; i < segmentCount; i++) {
			let x = Math.cos(angle) * i * segmentLength + game.world.centerX;
			let y = Math.sin(angle) * i * segmentLength + game.world.centerY;
			var ball: Phaser.Sprite = this.game.add.sprite(x, y, "segment");
			ball.tint = armIndex / ARM_TOTAL * 0x00ffff + 1 /armIndex / ARM_TOTAL * 0xff0000;
			ball.scale.set(1 / (1 + i / (segmentCount - 1)));
			this.balls.push(ball);
		}
		this.game.physics.p2.enable(this.balls, SHOW_PHYSICS_DEBUG);
		this.tip = this.balls[this.balls.length - 1];

		var lastBall: Phaser.Sprite = null;
		this.balls.forEach(b => {
			b.body.mass = totalMass / segmentCount;
			b.body.collideWorldBounds = true;

		if (lastBall) {
				var hinge = this.game.physics.p2.createRevoluteConstraint(b, [0, 0], lastBall, [0, 20], maxForce);
				// hinge.setStiffness(armLengthStiffness);
				// hinge.setRelaxation(armLengthRelaxation);
				this.hinges.push(hinge);

				var spring = this.game.physics.p2.createRotationalSpring(b, lastBall, 0, tweaks.stiffness, tweaks.damping);
				this.springs.push(spring);
			}
			lastBall = b;
		});

		stiffness.addListener((value) => {
			this.springs.forEach(s => {
				s.data.stiffness = value;
				console.log("stiff", value, this.id);
			});
		});
		damping.addListener((value) => {
			this.springs.forEach(s => {
				s.data.damping = value;
				console.log("damp", value, this.id);
			});
		});
		armLengthStiffness.addListener(value => {
			this.hinges.forEach(h => {
				h.setStiffness(value);
			})
		});
		armLengthRelaxation.addListener(value => {
			this.hinges.forEach(h => {
				h.setRelaxation(value);
			})
		});
	}

	getBase() {
		return this.balls[0].body;
	}

	attachTo(body: Phaser.Physics.P2.Body, rotation: number) {
		this.game.physics.p2.createRevoluteConstraint(body, [0, 0], this.getBase(), [0, 0], maxForce);
		const USELESS = 0; // setting rest rotation in constructor doesn't work properly for some mysterious reason
		var rotationSpring = this.game.physics.p2.createRotationalSpring(body, this.getBase(), USELESS, 120, 5);
		rotationSpring.data.restAngle = rotation;
	}
}
