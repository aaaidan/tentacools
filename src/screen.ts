declare const Promise: any;

class GameScreen {
    screen:Phaser.Image;
    timeout:any;
    constructor(game:Phaser.Game, screenName:string, timeout?:number) {
        this.screen = game.add.image(0,0, screenName);
        this.timeout = timeout;
        this.screen.fixedToCamera = true;
        this.screen.visible = false;

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
    }
    show() {
        this.screen.visible = true;
        this.screen.bringToTop();

        return new Promise((res,rej) => {
            if (typeof this.timeout != "undefined") {
                setTimeout(()=>{
                    this.hide();
                    res();
                }, this.timeout);
            } else {
                res();
            }
        });
    }
    hide() {
        this.screen.visible = false;
        return new Promise((res) => { res(); });
    }
}