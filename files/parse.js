var O = O || {};
O.title = 'Ainou Project 知识库';
O.currentPath = '';
O.isRelative = function(url) {
	return !url.match(/^((https?|ftp|mailto)\:|\/)/)
}
O.isOut = function(url) {
	return url.match(/^(https?|ftp|mailto|javascript)\:/);
}
O.realPath = function(url) {
	if (O.isRelative(url)) {
		return O.currentPath + url;
	} else {
		return url;
	}
}
O.fixPath = function(url) {
	// 修正相对路径
	var newUrl;
	while (true) {
		newUrl = url.replace(/\/[^/]+\/\.\.\//g, '/');
		if (url === newUrl) {
			break;
		}
		url = newUrl;
	}
	return newUrl;
}
O.get = function(url, success, error) {
	var request = new XMLHttpRequest();
	document.getElementById('content').innerHTML = '少女祈祷中…';
	var relative = false;
	/*if (O.isRelative(url)) {
		//相对路径
		relative = true;
		url = O.currentPath + url;
	}*/
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 300) {
			//请求完毕，更新路径
			path = url.replace(/\/[^\/]*\/?$/, '');
			if(path != url){
				O.currentPath = path + '/';	//把当前路径设置过去
			}
			var docUrl = url.replace(/^\.\//, '');
			var baseUrl = 'https://github.com/AinouProject/readme';
			document.getElementById('edit-link').href = baseUrl + '/edit/master/' + docUrl;
			document.getElementById('history-link').href = baseUrl + '/commits/master/' + docUrl;
			success(request.responseText);
		} else {
			if (request.status === 404) {
				error('请求的文件没有找到。');
			} else {
				error(request.responseText);
			}
		}
	};

	request.onerror = function() {
		error(null);
	};
	request.send();
};
//前端路由
O.route = function(url) {
	//var url = window.location.hash.slice(1);
	if (url.match(/\.m(?:ark)?d(?:own)?$/)) {
		//markdown 文件
		O.get(url, O.parse, O.error.bind(this, '读取 Markdown '));
	}else if (url.match('/$') || url == '') {
		//目录
		O.get(url + 'README.md', O.parse, O.error.bind(this, '读取目录 README '));
	}else if (url.match(/\.inline\.html?$/)) {
		// html 文件
		O.get(url, O.html, O.error.bind(this, '读取 HTML'));
	}else if (url.match(/\.txt$/)) {
		O.get(url, O.text, O.error.bind(this, '读取文本'));
	}
}
//渲染并写入HTML
O.parse = function(markdown) {
	O.isFirstHeading = true;
	var html = marked(markdown);
	document.getElementById('content').innerHTML = html;
	if (O.isFirstHeading) {
		document.title = O.title;
	}
}
O.html = function(html) {
	document.title = O.title;
	var el = document.getElementById('content');
	el.innerHTML = html;
	var scripts = el.getElementsByTagName("script");
	for (var i = 0; i < scripts.length; i++) {
		eval(scripts[i].text);
	}
}
O.text = function (text) {
	document.title = O.title;
	var el = document.createElement('pre');
	var content = document.getElementById('content');
	content.innerHTML = '';
	content.appendChild(el);
	el.textContent = text;
}
//失败提示
O.error = function(when, why) {
	document.title = '错误 - ' + O.title;
	document.getElementById('content').innerHTML = when + '失败，原因：' + why;
}

//Markdown 渲染
O.renderer = new marked.Renderer();
var orgRenderer = new marked.Renderer();
//修改图像地址
O.renderer.image = function(href, title, text) {
	return orgRenderer.image(O.realPath(href), title, text);
}
//修改链接地址
O.renderer.link = function(href, title, text) {
	if (O.isOut(href)) {
		if (title) {
			return '<a href="' + href + '" title="' + title + '" target="_blank">' + text + '</a>';
		} else {
			return '<a href="' + href + '" target="_blank">' + text + '</a>';
		}
	}
	if (O.isRelative(href)) {
		href = O.currentPath + href;
	}
	return orgRenderer.link('#' + O.fixPath(href), title, text);
}
//hook 住 h1 ，写入标题
O.renderer.heading = function (text, level) {
	if (level == 1 && O.isFirstHeading) {
		if (text !== O.title) {
			document.title = text + ' - ' + O.title;
		} else {
			document.title = O.title;
		}
		O.isFirstHeading = false;
	}
	return orgRenderer.heading.apply(this, arguments);
}
//初始化 Markdown
marked.setOptions({
	renderer: O.renderer,
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false
});

//监听 Hash Change

var locationHashChanged = function(){
	if (window.location.hash.slice(0, 3) !== '#./') {
		// 禁用非 ./ 开头的路径
		window.location.hash = '#./';
		return;
	}
	O.route(window.location.hash.slice(1).replace(/\|.*$/, ''));
}

if ("onhashchange" in window) {
	window.onhashchange = locationHashChanged;
} else {
	(function(){
		var currentHash = window.location.hash;
		setInterval(function(){
			if (window.location.hash != currentHash) {
				locationHashChanged()
			}
		}, 100)
	})();
}

locationHashChanged();