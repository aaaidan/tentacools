# Let's All Feed The Mouth

A game about feeding The Mouth, together.

This is a 3 player game, so you'll want to get 2 of your closest friends together to play.

[Play LAFTM](http://small-kouprey.cloudvent.net/)

## Installing this

If the above link doesn't work, and you still want to experience this derangement, you will need to install it on your computer.

Since this game is written in [Phaser](https://phaser.io), it needs to be hosted on a static webserver to be played. Sorry about that. It's worth it, I promise.

Specifically, the `bin` folder is all that needs to be served. You can do this any way you like, but an easy way is to install Python, and run its built-in `SimpleHTTPServer` from the bin directory.

With Python v2:

    cd bin
    python -m SimpleHTTPServer 5858

Or with Python v3:

    cd bin
    python -m http.server 5858

Then open http://localhost:5858 in your browser