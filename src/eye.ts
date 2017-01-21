class Eye {
    
    game: Phaser.Game;

    base: Phaser.Sprite;
    iris: Phaser.Sprite;
    highlight: Phaser.Sprite;

    constructor(game:Phaser.Game, x:number, y:number) {

        this.game = game;
        
        this.base = this.game.add.sprite(x, y, "eyeball-base");
        this.iris = this.game.make.sprite(10,10, "eyeball-iris");
        this.highlight = this.game.make.sprite(0,0, "eyeball-highlight");
        
        // adding these children causes mayhem...
        this.base.addChild(this.iris);
        this.base.addChild(this.highlight);
    }

    attach(parent:Phaser.Sprite) {
        console.log("wow made an eyeball, attached " + this.base.position.toString() );
        parent.addChild(this.base);
    }

}