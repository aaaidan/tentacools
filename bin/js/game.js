var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var maxForce = 2000; // who knows
var SHOW_PHYSICS_DEBUG = false;
var Arm = (function () {
    function Arm(game, spriteName) {
        var _this = this;
        this.game = game;
        this.balls = [];
        this.sprite = new Phaser.Group(this.game);
        var segmentLength = 10;
        var totalMass = 1;
        var ballCount = 10;
        for (var i = 0; i < ballCount; i++) {
            var ball = this.game.add.sprite(0, i * segmentLength, spriteName);
            ball.scale.set(1 / (1 + i / (ballCount - 1)));
            this.balls.push(ball);
        }
        this.game.physics.p2.enable(this.balls, SHOW_PHYSICS_DEBUG);
        var lastBall = null;
        this.balls.forEach(function (b) {
            b.body.mass = totalMass / ballCount;
            b.body.collideWorldBounds = false;
            if (lastBall) {
                _this.game.physics.p2.createRevoluteConstraint(b, [0, 0], lastBall, [0, 20], maxForce);
                _this.game.physics.p2.createRotationalSpring(b, lastBall, 0, 80, 4);
            }
            lastBall = b;
        });
    }
    Arm.prototype.getBase = function () {
        return this.balls[0].body;
    };
    Arm.prototype.attachTo = function (body, rotation) {
        this.game.physics.p2.createRevoluteConstraint(body, [0, 0], this.getBase(), [0, 0], maxForce);
        var USELESS = 0; // setting rest rotation in constructor doesn't work properly for some mysterious reason
        var rotationSpring = this.game.physics.p2.createRotationalSpring(body, this.getBase(), USELESS, 120, 5);
        rotationSpring.data.restAngle = rotation;
    };
    return Arm;
}());
/// <reference path="../tsd/phaser.d.ts"/>
var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', {
            create: this.create, preload: this.preload, update: this.update, forEachArm: this.forEachArm
        });
    }
    SimpleGame.prototype.preload = function () {
        this.game.load.image("decepticon", "assets/square.jpg");
        this.game.load.image("ball1", "assets/ball-1.png");
        this.game.load.image("ball2", "assets/ball-2.png");
        this.game.load.image("ball3", "assets/ball-3.png");
        this.game.load.image("arm1", "assets/tentacool-01.png");
        this.game.load.image("arm2", "assets/tentacool-02.png");
        this.game.load.image("arm3", "assets/tentacool-03.png");
        this.game.load.image("mouth", "assets/mouth.png");
    };
    SimpleGame.prototype.forEachArm = function (cb) {
        cb(this.arm1);
        cb(this.arm2);
        cb(this.arm3);
    };
    SimpleGame.prototype.create = function () {
        var _this = this;
        this.mouth = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "mouth");
        this.arm1 = this.game.add.sprite(this.game.width / 2, this.game.height * 0.1, "arm1");
        this.arm2 = this.game.add.sprite(this.game.width * 0.1, this.game.height * 0.8, "arm2");
        this.arm3 = this.game.add.sprite(this.game.width * 0.9, this.game.height * 0.8, "arm3");
        this.mouth.bringToTop();
        // this.mouth.scale.set(0.1);
        // this.arm1.scale.set(0.1);
        // this.arm2.scale.set(0.1);
        // this.arm3.scale.set(0.1);
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        // Enabled physics on our sprites
        this.game.physics.p2.enable([this.mouth, this.arm1, this.arm2, this.arm3], SHOW_PHYSICS_DEBUG);
        // setup behaviour of individual bits
        this.mouth.body.mass = 5;
        this.forEachArm(function (a) {
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
        var setupRevoluteConstraints = function () {
            _this.j1 = _this.game.physics.p2.createRevoluteConstraint(_this.mouth, [0, 0], _this.arm1, [0, 150], maxForce);
            _this.j2 = _this.game.physics.p2.createRevoluteConstraint(_this.mouth, [0, 0], _this.arm2, [0, 150], maxForce);
            _this.j3 = _this.game.physics.p2.createRevoluteConstraint(_this.mouth, [0, 0], _this.arm3, [0, 150], maxForce);
            _this.j1.setLimits(2 * Math.PI / 3 * 0 - 0.2, 2 * Math.PI / 3 * 0 + 0.2);
            _this.j2.setLimits(2 * Math.PI / 3 * 1 - 0.2, 2 * Math.PI / 3 * 1 + 0.2);
            _this.j3.setLimits(2 * Math.PI / 3 * 2 - 0.2, 2 * Math.PI / 3 * 2 + 0.2);
        };
        setupRevoluteConstraints();
        var setupCursors = function () {
            _this.cursors = _this.game.input.keyboard.createCursorKeys();
            _this.cursors2 = {
                left: _this.game.input.keyboard.addKey(Phaser.Keyboard.A),
                right: _this.game.input.keyboard.addKey(Phaser.Keyboard.D),
                up: _this.game.input.keyboard.addKey(Phaser.Keyboard.W),
                down: _this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            };
            _this.cursors3 = {
                left: _this.game.input.keyboard.addKey(Phaser.Keyboard.J),
                right: _this.game.input.keyboard.addKey(Phaser.Keyboard.L),
                up: _this.game.input.keyboard.addKey(Phaser.Keyboard.I),
                down: _this.game.input.keyboard.addKey(Phaser.Keyboard.K),
            };
        };
        setupCursors();
        var setupNoodlyAppendage = function (imageName, rotation) {
            _this.a1 = new Arm(_this.game, imageName);
            // this.a1.sprite.position.set( 100,100 );
            _this.game.world.add(_this.a1.sprite);
            _this.a1.attachTo(_this.mouth.body, rotation);
        };
        setupNoodlyAppendage("ball1", 2 * Math.PI * (0 / 3));
        setupNoodlyAppendage("ball2", 2 * Math.PI * (1 / 3));
        setupNoodlyAppendage("ball3", 2 * Math.PI * (2 / 3));
        window["game"] = this;
    };
    SimpleGame.prototype.update = function () {
        var FORCE = 300;
        var ROTATE_FORCE = 10;
        function forceBody(arm, keys, forceAmt) {
            if (keys.left.isDown) {
                arm.body.force.x = -forceAmt;
            }
            else if (keys.right.isDown) {
                arm.body.force.x = forceAmt;
            }
            if (keys.up.isDown) {
                arm.body.force.y = -forceAmt;
            }
            else if (keys.down.isDown) {
                arm.body.force.y = forceAmt;
            }
        }
        forceBody(this.arm1, this.cursors, FORCE);
        forceBody(this.arm2, this.cursors2, FORCE);
        forceBody(this.arm3, this.cursors3, FORCE);
    };
    return SimpleGame;
}());
window.onload = function () {
    var game = new SimpleGame();
};
var MyGame;
(function (MyGame) {
    var BootState = (function (_super) {
        __extends(BootState, _super);
        function BootState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BootState.prototype.preload = function () { };
        BootState.prototype.create = function () {
            // Use this if you don't need multitouch
            this.input.maxPointers = 1;
            if (this.game.device.desktop) {
            }
            this.game.state.start('Preloader', true, false);
        };
        return BootState;
    }(Phaser.State));
    MyGame.BootState = BootState;
})(MyGame || (MyGame = {}));
var MyGame;
(function (MyGame) {
    var GameState = (function (_super) {
        __extends(GameState, _super);
        function GameState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GameState.prototype.preload = function () { };
        GameState.prototype.create = function () {
            var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo');
            logo.anchor.setTo(0.5, 0.5);
        };
        return GameState;
    }(Phaser.State));
    MyGame.GameState = GameState;
})(MyGame || (MyGame = {}));
var MyGame;
(function (MyGame) {
    var PreloaderState = (function (_super) {
        __extends(PreloaderState, _super);
        function PreloaderState() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PreloaderState.prototype.preload = function () {
            this.game.load.image('logo', 'assets/logo.png');
        };
        PreloaderState.prototype.create = function () {
            this.game.state.start('Game');
        };
        return PreloaderState;
    }(Phaser.State));
    MyGame.PreloaderState = PreloaderState;
})(MyGame || (MyGame = {}));
//# sourceMappingURL=game.js.map