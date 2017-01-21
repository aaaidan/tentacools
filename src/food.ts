class Food {

    constructor (game: Phaser.Game, spriteName: String, collisionGroups: Phaser.Physics.P2.CollisionGroup[]) {

    // var food = allFood.create(this.game.world.randomX, this.game.world.randomY, 'food');
	// food.body.setRectangle(40, 40);
	// food.body.setCollisionGroup(foodCollisionGroup);
	// food.body.collides([foodCollisionGroup, starfishCollisionGroup]);
    }


}


class FoodGroup {

    group: Phaser.Group;
    collisionGroup: Phaser.Physics.P2.CollisionGroup;

    constructor(game: Phaser.Game) {
        this.group = game.add.group();
		this.group.enableBody = true;
		this.group.physicsBodyType = Phaser.Physics.P2JS;
    }

}