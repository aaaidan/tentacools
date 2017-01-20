var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var maxForce = 20000; // who knows
/// <reference path="../tsd/phaser.d.ts"/>
var SimpleGame = (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(640, 480, Phaser.AUTO, 'content', {
            create: this.create, preload: this.preload, update: this.update
        });
    }
    SimpleGame.prototype.preload = function () {
        this.game.load.image("decepticon", "square.jpg");
    };
    SimpleGame.prototype.create = function () {
        this.mouth = this.game.add.sprite(this.game.width / 2, this.game.height / 2, "decepticon");
        this.arm1 = this.game.add.sprite(this.game.width / 2, this.game.height * 0.1, "decepticon");
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
        this.j1 = this.game.physics.p2.createRevoluteConstraint(this.mouth, [0, 0], this.arm1, [0, 150], maxForce);
        this.j2 = this.game.physics.p2.createRevoluteConstraint(this.mouth, [0, 0], this.arm2, [0, 150], maxForce);
        this.j3 = this.game.physics.p2.createRevoluteConstraint(this.mouth, [0, 0], this.arm3, [0, 150], maxForce);
        this.cursors = this.game.input.keyboard.createCursorKeys();
    };
    SimpleGame.prototype.update = function () {
        var FORCE = 200;
        if (this.cursors.left.isDown) {
            this.arm1.body.force.x = -FORCE;
        }
        else if (this.cursors.right.isDown) {
            this.arm1.body.force.x = FORCE;
        }
        if (this.cursors.up.isDown) {
            this.arm1.body.force.y = -FORCE;
        }
        else if (this.cursors.down.isDown) {
            this.arm1.body.force.y = FORCE;
        }
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