# Let's All Feed The Mouth

A game about feeding The Mouth, together.

## Running this

This game is written in Phaser, so it needs to be hosted on a static webserver to be played. 

Specifically, the `bin` folder is all that needs to be served.

You can do this any way you like, but an easy way is to install Python, and run its built-in `SimpleHTTPServer` from the bin directory.

With Python v2:

    cd bin
    python -m SimpleHTTPServer 5858

Or with Python v3:

    cd bin
    python -m http.server 5858

Then open http://localhost:5858 in your browser