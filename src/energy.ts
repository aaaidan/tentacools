class PlayerEnergy {
    maxEnergy: number;
    currentEngery: number;

    startTime: Phaser.Time;

    decayRate: number;

    sprite: Phaser.Sprite;

    constructor(game: Phaser.Game, max: number) {
        this.maxEnergy = max;
        this.currentEngery = this.maxEnergy;

        this.sprite = game.add.sprite(10, 10, 'energy');
        this.sprite.fixedToCamera = true;
    }


    increaeEnergy(amount: number) {
        if (this.currentEngery < this.maxEnergy) {
            this.currentEngery += amount;
            this.sprite.scale.setTo(this.currentEngery/this.maxEnergy, 1);
        }
    }

    decreaseEnergy(amount: number) {
        if (this.currentEngery > 0) {
            this.currentEngery -= amount;
            this.sprite.scale.setTo(this.currentEngery/this.maxEnergy, 1);
        } 

    }
}