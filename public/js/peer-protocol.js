$('document').ready(function(){
	myIndexes = []
	myPeerIndexes = []
	myPeers = []
	Articles = new IDBStore({
	  dbVersion: '3',
	  storeName: 'p2p-website-articles',
	  keyPath: 'id',
	  autoIncrement: true,
	  onStoreReady: function () {
	    Articles.updateIndexes()
	  }
	})
	Articles.updateIndexes = function() {
		myIndexes = []
  	Articles.getAll(function(data) {
    	data.forEach(function(article){
    		myIndexes.push(article.id)
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
		if (myPeers.length > 0 && $('#iconNetwork').hasClass('fa-cog'))
			$('#iconNetwork').removeClass('fa-spin')
		if (myPeers.length == 0 && !$('#iconNetwork').hasClass('fa-cog'))
			$('#iconNetwork').addClass('fa-spin')
	}, 250);

	function myPeersChanged(changes) {
		console.log(changes)
	}

	function newPeer(conn) {
		conn.on('open', function(){
			if (myPeers.indexOf(conn.peer) == -1)
				myPeers.push(conn.peer);
			// send our indexes to our peers as handshake
			conn.send({c:'index', data:myIndexes})
		})
		conn.on('close', function(){
			// farewell, you will be missed
			if (myPeers.indexOf(conn.peer) > -1)
				myPeers.splice(myPeers.indexOf(conn.peer))
		})
	  conn.on('data', function(data){
	  	data.peer = conn.peer
	  	switch(data.c) {
	  		case 'index':
	  			myPeerIndexes.push(data)
	  			break
	  		case 'search':
	  			console.log('search')
	  			console.log(data)
	  			if (myIndexes.indexOf(data.data) > -1) {
	  				Articles.get(data.data, function(article) {
	  					conn.send({c:'share', data:article})
	  				})
	  			}
	  			break
	  		case 'share':
	  			console.log('share')
	  			Articles.put(data.data)
	  			myIndexes.push(data.data.id)
	  			break
	  	}
	  })
	}
});

