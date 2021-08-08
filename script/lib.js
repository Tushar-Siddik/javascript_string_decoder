function hookUpOnInput() {
	var tagNames = ['INPUT', 'TEXTAREA'];
	for (var j = 0; j < tagNames.length; j++) {
		var elements = document.getElementsByTagName(tagNames[j]);
		for (var i = 0; i < elements.length; i++) {
			var e = elements[i];
			var oninput = e.getAttribute('ONINPUT');
			if (oninput) {
				e.prevValue = e.value;
				e.onkeypress = e.onkeyup = e.onchange = onPerhapsChanged;
 				// Workaround for number widget on Google Chrome.
 				e.onmouseup = function(event) { window.setTimeout(function() { onPerhapsChanged.call(event.target); }, 1); (event.target); }
				e.onfocus = onFocus;
				e.onChanged = new Function(oninput);
				e.removeAttribute('ONINPUT');
			}
		}
	}
}

function onFocus() {
	this.prevValue = this.value;
}

function onPerhapsChanged() {
	if (this.value != this.prevValue) {
		this.onChanged();
		this.prevValue = this.value;
	}
}

// IE6 does not support substr(-i)
String.prototype.right = function(i) {
	return this.substr(this.length - i);
}

Function.prototype.applyDelayed = function(thisArg, args) {
	if (typeof this.delayedTimeout != 'undefined') {
		window.clearTimeout(this.delayedTimeout);
	}
	var method = this;
	this.delayedTimeout = window.setTimeout(
		function() {
			method.apply(thisArg, !args ? [] : args);
			method.delayedTimeout = undefined;
			}, 750);
}

function callServerFunction(methodName, args, callback) {
	var xmlHttp = null;
	//the following is interpretend by IE though it looks like a comment
	/*@cc_on @*/
	/*@if (@_jscript_version >= 5)
		var ids = ['Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0',
			'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
		for (var i = 0; !xmlHttp && i < ids.length; i++) {
			try {
				xmlHttp = new ActiveXObject(ids[i]);
			} catch(e) {}
		}
	@end @*/
	if (!xmlHttp && typeof XMLHttpRequest != 'undefined') {
		xmlHttp = new XMLHttpRequest();
	}
	if (!xmlHttp || typeof xmlHttp.send == 'undefined') {
		return false;
	}

	var url = 'rpc.php?method=' + methodName;
	for (var i = 0; i < args.length; i++) {
	    url += '&args[' + i + ']=' + encodeURIComponent(args[i]);
	}

	//var prevOnerror = window.onerror;
	//window.onerror = function() { window.onerror = prevOnerror; return true; };
	xmlHttp.open('GET', url, true);
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4) {
		    output = eval(xmlHttp.responseText);
		    callback.apply(null, output);
		}
	}
	xmlHttp.send(null);
	return true;
	//window.onerror = prevOnerror;
}

function hasSearchWord(s) {
	var matches = /\?.*\bq=([^&]+)/.exec(document.referrer);
	return matches && decodeURIComponent(matches[1].toLowerCase()).indexOf(s.toLowerCase()) != -1;
}
