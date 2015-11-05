# Waka

This project's purpose is to create a wiki-style website with no server-side database, that can have loads of visitors with minimal server costs.

Articles are stored in the browser IndexedDB, then shared via peer-to-peer between users, without going through the server.

Demo: [Wakapedia.info](HTTP://WAKAPEDIA.INFO)

## Client (App.html)
#### Javascript Dependencies (CDN hosted)
* jquery
* peerjs: peer to peer in the browser
* idbstore: to store articles in the browser
* handlebars: html templating
* page.js: javascript router
* markdown-extra: syntax for articles

## Server.js
To get your own waka website running: 

    https://github.com/skzap/waka.git
    npm install
Then add a file /js/public/config.js

    WakaConfig = {
    	PeerServer: {
          host: 'yourdomain.com', 
          port: 80, 
          path: '/peerjs',
          debug: true
    	},
    	PeerOptions: {
          debug: true,
          allow_discovery: true
    	}
    }
#### Dependencies
* peer: peer js signaling server
* express: http server to serve the html/js/css to client
* winston: logging
