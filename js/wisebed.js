Array.prototype.compareArrays = function(arr) {
	if (this.length != arr.length) return false;
	for (var i = 0; i < arr.length; i++) {
		if (this[i].compareArrays) { //likely nested array
			if (!this[i].compareArrays(arr[i])) return false;
			else continue;
		}
		if (this[i] != arr[i]) return false;
	}
	return true;
};

var Wisebed = function(baseUri, webSocketBaseUri) {

	function getBaseUri() {
		return baseUri;
	}

	function getWebSocketBaseUri() {
		return webSocketBaseUri;
	}

	this.EventWebSocket = function(onDevicesAttached, onDevicesDetached, onOpen, onClose) {

		this.onDevicesAttached = onDevicesAttached;
		this.onDevicesDetached = onDevicesDetached;
		this.onOpen = onOpen;
		this.onClose = onClose;

		window.WebSocket = window.MozWebSocket || window.WebSocket;

		var self = this;
		this.socket = new WebSocket(getWebSocketBaseUri() + '/events');
		this.socket.onmessage = function(evt) {
			var event = JSON.parse(evt.data);
			if (event.type == 'keepAlive') {
				// ignore
			} else if (event.type == 'devicesAttached') {
				self.onDevicesAttached(event);
			} else if (event.type == 'devicesDetached') {
				self.onDevicesDetached(event);
			} else {
				console.log("Received unknown event over event bus: " + event);
			}
		};
		this.socket.onopen  = function(event) { self.onOpen(event);  };
		this.socket.onclose = function(event) { self.onClose(event); };
	};

	this.WebSocket = function(experimentId, onmessage, onopen, onclosed) {

		this.experimentId = experimentId;
		this.onmessage    = onmessage;
		this.onopen       = onopen;
		this.onclosed     = onclosed;

		window.WebSocket = window.MozWebSocket || window.WebSocket;

		var self = this;

		this.socket = new WebSocket(getWebSocketBaseUri() + '/experiments/' + this.experimentId);
		this.socket.onmessage = function(event) { self.onmessage(JSON.parse(event.data)); };
		this.socket.onopen    = function(event) { self.onopen(event); };
		this.socket.onclose   = function(event) { self.onclosed(event); };

		this.send = function(message) {
			this.socket.send(JSON.stringify(message, null, '  '));
		};

		this.close = function(code, reason) {
			this.socket.close(code !== undefined ? code : 1000, reason !== undefined ? reason : '');
		};
	};

	this.testCookie = function (callbackOK, callbackError) {

		// Check cookie
		var getCookieCallbackDone = function() {
			$.ajax({
				url       : getBaseUri() + "/cookies/check",
				success   : callbackOK,
				error     : callbackError,
				xhrFields : { withCredentials: true }
			});
		};

		// Get cookie
		$.ajax({
			url       : getBaseUri() + "/cookies/get",
			success   : getCookieCallbackDone,
			error     : callbackError,
			xhrFields : { withCredentials: true }
		});
	};

	this.reservations = new function() {

		this.getPersonal = function(from, to, callbackDone, callbackError) {
			var queryUrl = getBaseUri() + "/reservations?userOnly=true" +
					(from ? ("&from=" + from.toISOString()) : "") +
					(to ? ("&to="+to.toISOString()) : "");
			console.log("Calling " + queryUrl);
			$.ajax({
				url       : queryUrl,
				success   : callbackDone,
				error     : callbackError,
				context   : document.body,
				dataType  : "json",
				xhrFields : { withCredentials: true }
			});
		};

		this.getPublic = function(from, to, callbackDone, callbackError) {
			var queryUrl = getBaseUri() + "/reservations?" +
					(from ? ("from=" + from.toISOString() + "&") : "") +
					(to ? ("to="+to.toISOString() + "&") : "");
			$.ajax({
				url       : queryUrl,
				success   : callbackDone,
				error     : callbackError,
				context   : document.body,
				dataType  : "json",
				xhrFields : { withCredentials: true }
			});
		};

		this.make = function(from, to, nodeUrns, description, options, callbackDone, callbackError) {

			// Generate JavaScript object
			var content = {
				"from"        : from.toISOString(),
				"nodeUrns"    : nodeUrns,
				"to"          : to.toISOString(),
				"description" : description,
				"options"     : options
			};

			$.ajax({
				url			:	getBaseUri() + "/reservations/create",
				type		:	"POST",
				data		:	JSON.stringify(content, null, '  '),
				contentType	:	"application/json; charset=utf-8",
				dataType	:	"json",
				success		: 	callbackDone,
				error		: 	callbackError,
				xhrFields   : { withCredentials: true }
			});

		};

		this.equals = function(res1, res2) {

			function subsetOf(set1, set2, compare) {
				for (var i=0; i<set1.length; i++) {
					for (var j=0; j<set2.length; j++) {
						if (!compare(set1[i], set2[j])) {
							return false;
						}
					}
				}
				return true;
			}

			function setEquals(set1, set2, compare) {

				if (set1.length != set2.length) {
					return false;
				}

				return subsetOf(set1, set2, compare) && subsetOf(set2, set1, compare);
			}

			return setEquals(res1, res2, function(dataElem1, dataElem2) {
				return  dataElem1.secretReservationKey == dataElem2.secretReservationKey &&
						dataElem1.urnPrefix            == dataElem2.urnPrefix;
			});
		};
	};

	this.experiments = new function() {

		this.getConfiguration = function (url, callbackDone, callbackError) {
			$.ajax({
				url       : getBaseUri() + "/experimentconfiguration",
				type      : "GET",
				data      : {url: url},
				success   : callbackDone,
				error     : callbackError,
				dataType  : "json",
				xhrFields : { withCredentials: true }
			});
		};

		this.getUrl = function(reservation) {
			var secretReservationKeys = {
				reservations: [reservation.secretReservationKey]
			};
			return getBaseUri() + "/experiments/" + btoa(JSON.stringify(secretReservationKeys));
		};

		this.areNodesConnected = function(nodeUrns, callbackDone, callbackError) {

			$.ajax({
				url         : getBaseUri() + "/experiments/areNodesConnected",
				type        : "POST",
				data        : JSON.stringify({nodeUrns:nodeUrns}, null, '  '),
				contentType : "application/json; charset=utf-8",
				dataType    : "json",
				success     : function(data) {callbackDone(data.operationStatus);},
				error       : callbackError,
				xhrFields   : { withCredentials: true }
			});
		};

		this.areNodesAlive = function(experimentId, nodeUrns, callbackDone, callbackError) {

			$.ajax({
				url         : getBaseUri() + "/experiments/" + experimentId + "/areNodesAlive",
				type        : "POST",
				data        : JSON.stringify({nodeUrns:nodeUrns}, null, '  '),
				contentType : "application/json; charset=utf-8",
				dataType    : "json",
				success     : function(data) {callbackDone(data.operationStatus);},
				error       : callbackError,
				xhrFields   : { withCredentials: true }
			});
		};

		this.send = function(experimentId, nodeUrns, messageBytesBase64, callbackDone, callbackError) {

			$.ajax({
				url         : getBaseUri() + "/experiments/" + experimentId + "/send",
				type        : "POST",
				data        : JSON.stringify({
					sourceNodeUrn  : 'user',
					targetNodeUrns : nodeUrns,
					bytesBase64    : messageBytesBase64
				}, null, '  '),
				contentType : "application/json; charset=utf-8",
				dataType    : "json",
				success     : function(data) {callbackDone(data.operationStatus);},
				error       : callbackError,
				xhrFields   : { withCredentials: true }
			});
		};

		this.resetNodes = function(experimentId, nodeUrns, callbackDone, callbackError) {

			$.ajax({
				url         : getBaseUri() + "/experiments/" + experimentId + "/resetNodes",
				type        : "POST",
				data        : JSON.stringify({nodeUrns:nodeUrns}, null, '  '),
				contentType : "application/json; charset=utf-8",
				dataType    : "json",
				success     : function(data) {callbackDone(data.operationStatus);},
				error       : callbackError,
				xhrFields   : { withCredentials: true }
			});
		};

		this.getNodeUrns = function(experimentId, callbackDone, callbackError) {

			$.ajax({
				url         : getBaseUri() + "/experiments/" + experimentId + "/nodeUrns",
				type        : "GET",
				contentType : "application/json; charset=utf-8",
				dataType    : "json",
				success     : function(data) {callbackDone(data.nodeUrns);},
				error       : callbackError,
				xhrFields   : { withCredentials: true }
			});
		};

		this.getChannelPipelines = function(experimentId, nodeUrns, callbackDone, callbackError) {

			$.ajax({
				url         : getBaseUri() + "/experiments/" + experimentId + "/getChannelPipelines",
				type        : "POST",
				data        : JSON.stringify({nodeUrns:nodeUrns}, null, '  '),
				contentType : "application/json; charset=utf-8",
				dataType    : "json",
				success     : function(data) {callbackDone(data);},
				error       : callbackError,
				xhrFields   : { withCredentials: true }
			});
		};

		this.flashNodes = function(experimentId, data, callbackDone, callbackProgress, callbackError) {

			function getAllNodeUrnsFromRequestData(data) {

				var allNodeUrns = [];

				for (var i=0; i<data.configurations.length; i++) {
					var configuration = data.configurations[i];
					for (var j=0; j<configuration.nodeUrns.length; j++) {
						allNodeUrns.push(configuration.nodeUrns[j]);
					}
				}

				allNodeUrns.sort();
				return allNodeUrns;
			}

			var allNodeUrns = getAllNodeUrnsFromRequestData(data);

			var requestSuccessCallback = function(d, textStatus, jqXHR){

				// Headers are empty in Cross-Site-Environment
				//var flashRequestStatusURL = jqXHR.getResponseHeader("Location");
				var flashRequestStatusURL = jqXHR.responseText;

				var schedule = setInterval(function() {

					var onProgressRequestSuccess = function(data) {

						//var data = JSON.parse(d);
						var completeNodeUrns = [];

						$.each(data.operationStatus, function(nodeUrn, nodeStatus) {
							if (nodeStatus.status != 'RUNNING') {
								completeNodeUrns.push(nodeUrn);
							}
						});
						completeNodeUrns.sort();

						if (allNodeUrns.compareArrays(completeNodeUrns)) {
							callbackDone(data.operationStatus);
							clearInterval(schedule);
						} else {
							callbackProgress(data.operationStatus);
						}
					};

					var onProgressRequestError = function(jqXHR, textStatus, errorThrown) {
						clearInterval(schedule);
						callbackError(jqXHR, textStatus, errorThrown);
					};

					$.ajax({
						url         : flashRequestStatusURL,
						type        : "GET",
						success     : onProgressRequestSuccess,
						error       : onProgressRequestError,
						dataType    : "json",
						xhrFields   : { withCredentials: true }
					});

				}, 2 * 1000);
			};

			$.ajax({
				url         : getBaseUri() + "/experiments/" + experimentId + "/flash",
				type        : "POST",
				data        : JSON.stringify(data, null, '  '),
				contentType : "application/json; charset=utf-8",
				success     : requestSuccessCallback,
				error       : callbackError,
				xhrFields   : { withCredentials: true }
			});
		};
	};

	this.getNodeUrnArray = function(experimentId, callbackDone, callbackError) {

		this.getWiseML(
				experimentId,
				function(wiseML, textStatus, jqXHR) {
					callbackDone(this.getNodeUrnArrayFromWiseML(wiseML), textStatus, jqXHR);
				},
				callbackError
		);
	};

	this.getWiseML = function(experimentId, callbackDone, callbackError, jsonOrXml, callbackComplete) {

		$.ajax({
			url      : (experimentId ?
					getBaseUri() + "/experiments/" + experimentId + "/network" :
					getBaseUri() + "/experiments/network"),
			cache    : false,
			context  : document.body,
			success  : callbackDone,
			error    : callbackError,
			complete : callbackComplete,
			dataType : (!jsonOrXml ? "json" : jsonOrXml),
			xhrFields: { withCredentials: true }
		});
	};

	this.getWiseMLAsJSON = function(experimentId, callbackDone, callbackError, callbackComplete) {
		this.getWiseML(experimentId, callbackDone, callbackError, "json", callbackComplete);
	};

	this.getWiseMLAsXML = function(experimentId, callbackDone, callbackError, callbackComplete) {
		this.getWiseML(experimentId, callbackDone, callbackError, "xml", callbackComplete);
	};

	this.getNodeUrnArrayFromWiseML = function(wiseML) {
		var nodeUrns = new Array();
		var nodes = wiseML.setup.node;
		for (var i=0; i<nodes.length; i++) {
			nodeUrns[i] = nodes[i].id;
		}
		return nodeUrns;
	};

	this.getTestbedDescription = function(callbackDone, callbackError) {
		$.ajax({
			url       : getBaseUri() + "/testbedDescription",
			success   : callbackDone,
			error     : callbackError,
			context   : document.body,
			dataType  : "json",
			xhrFields : { withCredentials: true }
		});
	};

	this.hasSecretAuthenticationKeyCookie = function() {
		return $.cookie('wisebed-secret-authentication-key') != null;
	};

	this.isLoggedIn = function(callbackDone, callbackError) {
		$.ajax({
			url      : getBaseUri() + "/auth/isLoggedIn",
			context  : document.body,
			dataType : "json",
			success  : function() {callbackDone(true);},
			error    : function(jqXHR, textStatus, errorThrown) {
				if (jqXHR.status == 403) {
					callbackDone(false);
				} else {
					callbackError(jqXHR, textStatus, errorThrown);
				}
			},
			xhrFields: { withCredentials: true }
		});
	};

	this.login = function(credentials, callbackDone, callbackError) {
		$.ajax({
			url			: getBaseUri() + "/auth/login",
			type		: "POST",
			data		: JSON.stringify(credentials, null, '  '),
			contentType	: "application/json; charset=utf-8",
			dataType	: "json",
			error		: callbackError,
			success		: callbackDone,
			xhrFields   : { withCredentials: true }
		});
	};

	this.logout = function(callbackDone, callbackError) {
		$.ajax({
			url       : getBaseUri() + "/auth/logout",
			success   : callbackDone,
			error     : callbackError,
			xhrFields : { withCredentials: true }
		});
	};

};