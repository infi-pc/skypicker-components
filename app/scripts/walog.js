

createWALogger = function () {

	//IE8 polyfill trim finction
	if(typeof String.prototype.trim !== 'function') {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '');
		}
	}

	var lastTimestamp =  new Date().getTime();

	var getDifference = function () {
		var timestamp = new Date().getTime();
		var diff = timestamp - lastTimestamp;
		lastTimestamp = timestamp;
		return diff;
	};

	// use only simple variables - it can take lot of memory and also objects can be not actual
	var log = function(message, context, variable) {
		if (typeof context == "undefined") {
			context = ["default"];
		}
		if (typeof variable == "undefined") {
			variable = "";
		}
		var data = {};
		data.timestamp = new Date().getTime();
		data.timeDifference = getDifference();
		if (typeof context == "string") {
			context = context.split(",");
			for(var i = 0; i < context.length; i++) {
				context[i] = context[i].trim();
			}
		}

		if (location.hostname.match('alpha.whichairline.com')) { //Debugging envirovent
			if (console && typeof(console.log) == "function" && typeof(console.timeStamp) == "function") {
				console.timeStamp(message);
				if (context.indexOf("error") == -1) {
					console.log("%c " + message + " " + data.timeDifference + "ms %c |" + context.join("|") + "|", 'background: #222; color: #bada55', 'background: #fff; color: #222')
				} else {
					console.log("%c " + message + " " + data.timeDifference + "ms %c |" + context.join("|") + "|", 'background: #da5555; color: #222', 'background: #fff; color: #222')
				}
				if (variable) {
					console.log(variable);
				}
			}
		}
		_LTracker.push({
			application: "JS client",
			text: message,
			context: context,
			timeDifference: data.timeDifference,
			timestamp: data.timestamp,
			data: variable,
			tag: "JS client"
		});
	};
	return {
		log: log
	}
};


window.WALogger = createWALogger();
window.walog = WALogger.log;


