const armColors = [
	0x00B4FF,
	0x22B573,
	0x9329FF
];

class Arm {

	static armIdCounter: number = 0;

	armIndex: number;
	sprite: Phaser.Group;
	balls: Phaser.Sprite[];
	game: Phaser.Game;
	tip: Phaser.Sprite;
	springs: p2.RotationalSpring[];
	hinges: Phaser.Physics.P2.RevoluteConstraint[];


	constructor(game: Phaser.Game, armIndex: number) {
		this.armIndex = armIndex;
		this.game = game;
		this.balls = [];
		this.springs = [];
		this.hinges = [];
		this.sprite = new Phaser.Group(this.game);

		const angle = Math.PI * 2 * (armIndex / armsTotal) ;
		const segmentLength = 15;
		const totalMass = 1;
		const segmentCount = 15;

		const tintColor:number = armColors[armIndex % armColors.length];

		for (var i = 0; i < segmentCount; i++) {
			let x = Math.cos(angle) * i * segmentLength + game.world.centerX;
			let y = Math.sin(angle) * i * segmentLength + game.world.centerY;
			var ball: Phaser.Sprite = this.game.add.sprite(x, y, "segment");
			ball.tint = Phaser.Color.interpolateColor(0xffffff, tintColor, segmentCount, i);
			ball.scale.set(0.4 / (1 + (i / (segmentCount - 1))*1.5 ));
			this.balls.push(ball);
		}
		this.game.physics.p2.enable(this.balls, SHOW_PHYSICS_DEBUG);
		this.tip = this.balls[this.balls.length - 1];

		var lastBall: Phaser.Sprite = null;
		this.balls.forEach(b => {
			b.body.mass = totalMass / segmentCount;
			b.body.collideWorldBounds = true;
			b.body.setCircle(b.width / 2, 0, 0, -angle);
			if (lastBall) {
				var hinge = this.game.physics.p2.createRevoluteConstraint(
					b, [0, 0],
					lastBall, [0, segmentLength], //[ b.x - lastBall.x, b.y - lastBall.y ],
					maxForce);
				hinge.setStiffness(tweaks.armLengthStiffness);
				hinge.setRelaxation(tweaks.armLengthRelaxation);
				this.hinges.push(hinge);

				var spring = this.game.physics.p2.createRotationalSpring(b, lastBall, 0, tweaks.stiffness, tweaks.damping);
				this.springs.push(spring);
			}
			lastBall = b;
		});

		stiffness.addListener((value) => {
			this.springs.forEach(s => {
				s.data.stiffness = value;
			});
		});
		damping.addListener((value) => {
			this.springs.forEach(s => {
				s.data.damping = value;
			});
		});
		armLengthStiffness.addListener(value => {
			this.hinges.forEach(h => {
				h.setStiffness(value);
			});
		});
		armLengthRelaxation.addListener(value => {
			this.hinges.forEach(h => {
				h.setRelaxation(value);
			});
		});
		this.tip.body.force.x = Math.random() - 0.5 * 2000;
		this.tip.body.force.y = Math.random() - 0.5 * 2000;
	}

	getBase() {
		return this.balls[0].body;
	}

	update() {
		var now = this.game.time.now / 1000;
		this.springs.forEach(s => s.data.restAngle = Math.sin(2 * Math.PI * now * (0.1+this.armIndex*0.047)) * 0.05);
	}

	attachTo(body: Phaser.Physics.P2.Body, rotation: number) {
		
		//this.game.physics.p2.createLockConstraint(body, this.getBase()); // a lock seems to work slightly better than the revolute
		 this.game.physics.p2.createRevoluteConstraint(body, [0,0], this.getBase(), [0,-50], maxForce);

		const USELESS = 0; // setting rest rotation in constructor doesn't work properly for some mysterious reason
		var rotationSpring = this.game.physics.p2.createRotationalSpring(body, this.getBase(), USELESS, 120, 5);
		rotationSpring.data.restAngle = rotation;
	}
}
