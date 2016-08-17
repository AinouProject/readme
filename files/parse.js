var O = O || {};
O.title = 'Ainou Project';
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
	return url.replace(/\/[^/]+\/\.\.\//g, '/');
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
		if (request.status >= 200 && request.status < 400) {
			//请求完毕，更新路径
			path = url.replace(/\/[^\/]*\/?$/, '');
			if(path != url){
				O.currentPath = path + '/';	//把当前路径设置过去
			}
			success(request.responseText);
		} else {
			error(request.responseText);
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
		O.get(url, O.parse, O.error.bind(this, '渲染Markdown'));
	}else if (url.match('/$') || url == '') {
		//目录
		O.get(url + 'README.md', O.parse, O.error.bind(this, '渲染Markdown'));
	}else if (url.match(/\.html?$/)) {
		// html 文件
		O.get(url, O.html, O.error.bind(this, '读取HTML'));
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
//失败提示
O.error = function(when, why) {
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
		document.title = text + ' - ' + O.title;
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
	sanitize: true,
	smartLists: true,
	smartypants: false
});

//监听 Hash Change

var locationHashChanged = function(){
	O.route(window.location.hash.slice(1));
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