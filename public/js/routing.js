var routes = {
	sessionVars: {
		countArt: -1,
		countPeers: -1,
		peerId: -1
	},
	watch: function(variable, value) {
		var b = true
		if (routes.sessionVars[variable] == value)
			b = false
		routes.sessionVars[variable] = value
		return b
	},
	index: function() {
		var template = Handlebars.compile($("#homepage-template").html())
		var context = {}
		if (typeof myPeers !== 'undefined')
			context.peerCount = myPeers.length
		$("#main").html(template(context))
	},
	articles: function() {
		var template = Handlebars.compile($("#articles-template").html())
		var context = {}
		if (typeof myPeers !== 'undefined')
			context.hosted = myIndexes
		if (typeof myPeerIndexes !== 'undefined')
			context.peerHosted = myPeerIndexes
		$("#main").html(template(context))
	},
	article: function(context) {
		if (typeof myIndexes == 'undefined')
			return
		var articleName = decodeURIComponent(context.params.name);
		var template = Handlebars.compile($("#article-template").html())
		if (myIndexes.indexOf(articleName) > -1) {
			Articles.get(articleName, function(result) {
				// article found, displaying it
				result.contentHtml = marked(result.content)
				$("#main").html(template(result))
				$('.content img').addClass('pure-img')
				$( "#formEdit" ).submit(function(e) {
					e.preventDefault()
					var formInputs = $('#formEdit :input')
				  var newArticle = {
				  	id: formInputs[0].value,
				  	title: formInputs[1].value,
				  	content: formInputs[2].value
				  }
				  Articles.put(newArticle, function(res) {
				  	console.log(res)
				  })
				});
			})
		} else {
			for (var i = myPeerIndexes.length - 1; i >= 0; i--) {
				if (myPeerIndexes[i].data.indexOf(articleName) > -1) {
					peer.connections[myPeerIndexes[i].peer][0].send({c: 'search', data: articleName})
				}
			};
		}
	},
	network: function() {
		var template = Handlebars.compile($("#network-template").html())
		var context = {}
		if (typeof myPeers !== 'undefined')
			context.peerCount = myPeers.length
		if (typeof peer !== 'undefined')
			context.peerId = peer.id
		$("#main").html(template(context))
	},
	fileUpload: function() {
		$("#main").html("<h1>Upload your file</h1><img id='i' /><button>Ok</button")
	},
	notfound: function() {
		$("#main").html("<h1>404 not found !!</h1>")
	}
}

routes.autoRefresh = setInterval(function() {
	if (page.current == '/')
		if (routes.watch('countPeers', myPeers.length))
			routes.index()
	if (page.current == '/articles')
		if (routes.watch('countPeers', myPeers.length))
			routes.articles()
	if (page.current == '/network') {
		if (routes.watch('countPeers', myPeers.length)
			|| routes.watch('peerId', peer.id))
			routes.network()
	}
		
	if (page.current.substr(0,9) == '/article/') {
		Articles.count(function(res){
			if (routes.watch('countArt', res))
				routes.article({params: {name: page.current.substr(9)}})
		})
	}
}, 500)

$('#fileUpload').on('change', function(ev) {
		routes.fileUpload()
    var f = ev.target.files[0]
    var fr = new FileReader()
    
    fr.onload = function(ev2) {
        $('#i').attr('src', ev2.target.result)
    };
    
    fr.readAsBinaryString(f)
});

//page.base('');
page('/', routes.index)
page('/articles', routes.articles)
page('/network', routes.network)
page('/article/:name', routes.article)
page('*', routes.notfound)
//page(page.current)
page()

