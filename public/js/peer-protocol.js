$('document').ready(function(){
	Art = {
		myIndexes: [],
		myPeerIndexes: [],
		myPeers: [],
		acceptShare: [],
		DB: null
	}
	Art.DB = new IDBStore({
	  dbVersion: '3',
	  storeName: 'p2p-website-articles',
	  keyPath: 'id',
	  autoIncrement: true,
	  onStoreReady: function () {
	    Art.updateIndexes()
	  }
	})
	Art.updateIndexes = function() {
		Art.myIndexes = []
  	Art.DB.getAll(function(data) {
    	data.forEach(function(article){
    		Art.myIndexes.push(article.id)
    	})
    }, function(error) {
    	console.log(error)
    })
	}

	//eventually we can let people choose their id
	//var person = prompt("Please enter your name", "Harry Potter");
	peer = new Peer(WakaConfig.PeerServer)

	// connecting to network and adding a bunch of peers
	peer.on('open', function(id) {
		//$('body').append('Hello, your id is: ' + id)
		peer.listAllPeers(function(peers) {
			//$('body').append('<br />Online: ' + peers.length + ' peers in the network.')
			for (var i = 0; i < peers.length && i < 50; i++) {
				if (peer.id != peers[i])
					newPeer(peer.connect(peers[i]))
			}
		})
	})
	// allowing people to connect to us
	peer.on('connection', newPeer)

	setInterval(function(){
		// autorun function for convenience
		if (Art.myPeers.length > 0 && $('#iconNetwork').hasClass('fa-cog'))
			$('#iconNetwork').removeClass('fa-spin')
		if (Art.myPeers.length == 0 && !$('#iconNetwork').hasClass('fa-cog'))
			$('#iconNetwork').addClass('fa-spin')
	}, 250);

	function myPeersChanged(changes) {
		console.log(changes)
	}

	function newPeer(conn) {
		conn.on('open', function(){
			if (Art.myPeers.indexOf(conn.peer) == -1)
				Art.myPeers.push(conn.peer);
			// send our indexes to our peers as handshake
			conn.send({c:'index', data:Art.myIndexes})
		})
		conn.on('close', function(){
			// farewell, you will be missed
			if (Art.myPeers.indexOf(conn.peer) > -1)
				Art.myPeers.splice(Art.myPeers.indexOf(conn.peer))
		})
	  conn.on('data', function(data){
	  	data.peer = conn.peer
	  	switch(data.c) {
	  		case 'index':
	  			Art.myPeerIndexes.push(data)
	  			break
	  		case 'search':
	  			console.log('search')
	  			console.log(data)
	  			if (Art.myIndexes.indexOf(data.data) > -1) {
	  				Art.DB.get(data.data, function(article) {
	  					conn.send({c:'share', data:article})
	  				})
	  			}
	  			break
	  		case 'share':
	  			console.log('share')
	  			console.log(data)
	  			if (Art.acceptShare.indexOf(data.data.id) > -1) {
		  			Art.DB.put(data.data)
		  			Art.myIndexes.push(data.data.id)
		  		}
	  			break
	  	}
	  })
	}
});

