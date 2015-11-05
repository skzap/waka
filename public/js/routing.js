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
			context.peerCount = Art.myPeers.length
		$("#main").html(template(context))
	},
	articles: function() {
		var template = Handlebars.compile($("#articles-template").html())
		var context = {}
		if (typeof Art !== 'undefined')
			context.hosted = Art.myIndexes
		if (typeof Art !== 'undefined')
			context.peerHosted = Art.myPeerIndexes
		$("#main").html(template(context))
		$( "#newArticle" ).click(function(e) {
			var articleName = prompt("What is the name of your article?", "")
			Art.DB.put({id: articleName, title:'', content:''})
			Art.myIndexes.push(articleName)
			page('/a/' + articleName)
		})
	},
	article: function(context) {
		if (typeof Art == 'undefined')
			return
		var articleName = decodeURIComponent(context.params.name);
		var template = Handlebars.compile($("#article-template").html())
		if (Art.myIndexes.indexOf(articleName) > -1) {
			Art.DB.get(articleName, function(result) {
				// article found, displaying it
				// converting to markdown
				//result.contentHtml = marked(result.content)
				result.contentHtml = Markdown(result.content)
				// extra syntax
				// [[ ]] Double matching brackets wiki style
				var tempContent = result.content
				var words = []
				var wordsMarkdown = []
				while (tempContent.indexOf('[[') > -1 && tempContent.indexOf(']]') > -1) {
					words.push(tempContent.substring(tempContent.indexOf('[['), tempContent.indexOf(']]')+2))
					tempContent = tempContent.substr(tempContent.indexOf(']]')+2)
				}
				for (var i = 0; i < words.length; i++) {
					if (words[i].indexOf('|') > -1) {
						var link = words[i].substring(2, words[i].indexOf('|'))
						var display = words[i].substring(words[i].indexOf('|')+1, words[i].length-2)
						wordsMarkdown.push('<a href="/a/'+link+'">'+display+'</a>')
					}
					else
						wordsMarkdown.push('<a href="/a/'+words[i].substring(2, words[i].length-2)+'">'+words[i].substring(2, words[i].length-2)+'</a>')
					result.contentHtml = result.contentHtml.replace(words[i], wordsMarkdown[i])
				}
				
				$("#main").html(template(result))
				$('.content img').addClass('pure-img')
				$('.content table').addClass('pure-table')
				$( "#formEdit" ).submit(function(e) {
					e.preventDefault()
					var formInputs = $('#formEdit :input')
				  var newArticle = {
				  	id: formInputs[0].value,
				  	title: formInputs[1].value,
				  	content: formInputs[2].value
				  }
				  Art.DB.put(newArticle, function(res) {
				  	console.log(res+' saved')
				  	page(page.current)
				  })
				})
			})
		} else {
			for (var i = Art.myPeerIndexes.length - 1; i >= 0; i--) {
				if (Art.myPeerIndexes[i].data.indexOf(articleName) > -1) {
					if (Art.acceptShare.indexOf(articleName) == -1)
						Art.acceptShare.push(articleName)
					peer.connections[Art.myPeerIndexes[i].peer][0].send({c: 'search', data: articleName})
				}
			}
		}
	},
	network: function() {
		var template = Handlebars.compile($("#network-template").html())
		var context = {}
		if (typeof Art !== 'undefined')
			context.peerCount = Art.myPeers.length
		if (typeof Art !== 'undefined')
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
		if (routes.watch('countPeers', Art.myPeers.length))
			routes.index()
	if (page.current == '/articles')
		if (routes.watch('countPeers', Art.myPeers.length))
			routes.articles()
	if (page.current == '/network') {
		if (routes.watch('countPeers', Art.myPeers.length)
			|| routes.watch('peerId', peer.id))
			routes.network()
	}
		
	if (page.current.substr(0,3) == '/a/') {
		Art.DB.count(function(res){
			if (routes.watch('countArt', res))
				routes.article({params: {name: page.current.substr(3)}})
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
page('/a/:name', routes.article)
page('*', routes.notfound)
//page(page.current)
page()

