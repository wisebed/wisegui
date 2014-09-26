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

var WisebedPublicReservationData = function(prd) {
	
	this.from = moment(prd.from);
	this.to = moment(prd.to);
	this.cancelled = prd.cancelled ? moment(prd.cancelled) : undefined;
	this.finalized = prd.finalized ? moment(prd.finalized) : undefined;
	this.nodeUrns = prd.nodeUrns;
	this.nodeUrnPrefixes = [];
	
	var self = this;
	
	prd.nodeUrns.forEach(function(nodeUrn) {
		var nodeUrnPrefix = nodeUrn.substring(0, nodeUrn.lastIndexOf(':') + 1);
		if (self.nodeUrnPrefixes.indexOf(nodeUrnPrefix) < 0) {
			self.nodeUrnPrefixes.push(nodeUrnPrefix);
		}
	});
};

var WisebedConfidentialReservationData = function(crd) {
	
	this.description = crd.description;
	this.from = moment(crd.from);
	this.to = moment(crd.to);
	this.cancelled = crd.cancelled ? moment(crd.cancelled) : undefined;
	this.finalized = crd.finalized ? moment(crd.finalized) : undefined;
	this.nodeUrns = crd.nodeUrns;
	this.nodeUrnPrefixes = [];
	this.options = crd.options;
	this.secretReservationKey = crd.secretReservationKey;
	this.username = crd.username;
	
	var self = this;

	crd.nodeUrns.forEach(function(nodeUrn) {
		var nodeUrnPrefix = nodeUrn.substring(0, nodeUrn.lastIndexOf(':') + 1);
		if (self.nodeUrnPrefixes.indexOf(nodeUrnPrefix) < 0) {
			self.nodeUrnPrefixes.push(nodeUrnPrefix);
		}
	});
};

var WisebedReservation = function(confidentialReservationDataList) {

	this.descriptions = [];
	this.description = '';
	this.from = null;
	this.to = null;
	this.cancelled = null;
	this.finalized = null;
	this.nodeUrns = [];
	this.nodeUrnPrefixes = [];
	this.confidentialReservationDataList = [];
	this.secretReservationKeys = [];
	this.serializedSecretReservationKeyBase64 = null;
	this.experimentId = null;

	var self = this;

	confidentialReservationDataList.forEach(function(confidentialReservationData) {
		var crd = new WisebedConfidentialReservationData(confidentialReservationData);
		if (crd.description && crd.description != '') {
			self.descriptions.push(crd.description);
		}
		if (self.from == null || crd.from >= self.from) {
			self.from = crd.from;
		}
		if (self.to   == null || crd.to   <= self.to  ) {
			self.to = crd.to;
		}
		if (self.cancelled == null || crd.cancelled <= self.cancelled) {
			self.cancelled = crd.cancelled;
		}
		if (self.finalized == null || crd.finalized <= self.finalized) {
			self.finalized = crd.finalized;
		}
		crd.nodeUrns.forEach(function(nodeUrn) {
			self.nodeUrns.push(nodeUrn);
			var nodeUrnPrefix = nodeUrn.substring(0, nodeUrn.lastIndexOf(':') + 1);
			if (self.nodeUrnPrefixes.indexOf(nodeUrnPrefix) < 0) {
				self.nodeUrnPrefixes.push(nodeUrnPrefix);
			}
		});
		self.secretReservationKeys.push(crd.secretReservationKey);
		self.confidentialReservationDataList.push(new WisebedConfidentialReservationData(crd));
	});
	this.nodeUrns.sort();
	this.nodeUrnPrefixes.sort();
	this.secretReservationKeys.sort(function(a,b) {
		if (a.nodeUrnPrefix < b.nodeUrnPrefix) { return -1; }
		if (a.nodeUrnPrefix > b.nodeUrnPrefix) { return  1; }
		if (a.key < b.key) { return -1; }
		if (a.key > b.key) { return  1; }
		return 0;
	});
	this.serializedSecretReservationKeyBase64 = btoa(JSON.stringify(this.secretReservationKeys));
	this.experimentId = this.serializedSecretReservationKeyBase64;
	this.description = this.descriptions.join('<br/>');
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
				console.log("Received unknown event over event bus: " + JSON.stringify(event));
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

		/**
		 * returns a WisebedReservation for the given experimentId (serialized base64-encoded secret reservation key(s))
		 */
		this.getByExperimentId = function(experimentId, callbackDone, callbackError) {
			var queryUrl = getBaseUri() + "/reservations/byExperimentId/" + experimentId;
			$.ajax({
				url       : queryUrl,
				success   : function(confidentialReservationDataList, textStatus, jqXHR) {
					callbackDone(new WisebedReservation(confidentialReservationDataList), textStatus, jqXHR)
				},
				error     : callbackError,
				context   : document.body,
				dataType  : "json",
				xhrFields : { withCredentials: true }
			});
		};

		/**
		 * returns a list of WisebedReservation objects
		 */
		this.getPersonal = function(from, to, callbackDone, callbackError, showCancelled) {
			var queryUrl = getBaseUri() + "/reservations/personal?" +
					(from ? ("from=" + from.toISOString() + "&") : "") +
					(to ? ("to="+to.toISOString() + "&") : "") +
					(to ? ("showCancelled="+ showCancelled + "&") : "");
			$.ajax({
				url       : queryUrl,
				success   : function(crdList, textStatus, jqXHR) {
					var list = [];
					crdList.forEach(function(crd) { list.push(new WisebedReservation([crd])); });
					callbackDone(list, textStatus, jqXHR);
				},
				error     : callbackError,
				context   : document.body,
				dataType  : "json",
				xhrFields : { withCredentials: true }
			});
		};

		/**
		 * returns a list of WisebedPublicReservationData objects
		 */
		this.getPublic = function(from, to, callbackDone, callbackError, showCancelled) {
			var queryUrl = getBaseUri() + "/reservations/public?" +
					(from ? ("from=" + from.toISOString() + "&") : "") +
					(to ? ("to=" + to.toISOString() + "&") : "") +
					(to ? ("showCancelled=" + showCancelled + "&") : "");
			$.ajax({
				url       : queryUrl,
				success   : function(prdList, textStatus, jqXHR) {
					var list = [];
					prdList.forEach(function(prd) { list.push(new WisebedPublicReservationData(prd)); });
					callbackDone(list, textStatus, jqXHR);
				},
				error     : callbackError,
				context   : document.body,
				dataType  : "json",
				xhrFields : { withCredentials: true }
			});
		};

		this.getFederatable = function(from, to, callbackDone, callbackError) {

			function calculatePowerset(ary) {
				var ps = [[]];
				for (var i=0; i < ary.length; i++) {
					for (var j = 0, len = ps.length; j < len; j++) {
						ps.push(ps[j].concat(ary[i]));
					}
				}
				return ps;
			}

			this.getPersonal(from, to, function(reservations) {

				var powerset = calculatePowerset(reservations);
				var federatableSets = [];
				var current, currentRes, overlap;

				for (var i=0; i<powerset.length; i++) {
					
					if (powerset[i].length == 0) {continue;} // first element (empty set) doesn't make sense
					if (powerset[i].length == 1) {continue;} // single reservation sets can't be federated

					// for every reservation in the current set of reservations check if reservation interval
					// overlaps with reservation interval of each other reservation in the set
					current = powerset[i];
					overlap = true;
					
					for (var k=0; k<current.length; k++) {
						for (var l=k; l<current.length; l++) {

							// reservations overlap if (startA <= endB) and (endA >= startB)
							if (!(current[k].from < current[l].to && current[k].to > current[l].from)) {
								overlap = false;
							}
						}
					}

					if (overlap) {
						federatableSets.push(current);
					}
				}

				var federatableReservations = [];
				federatableSets.forEach(function(federatableSet) {
					var federatableSetCrds = [];
					federatableSet.forEach(function(federatable) {
						federatableSetCrds = federatableSetCrds.concat(federatable.confidentialReservationDataList);
					});
					federatableReservations.push(new WisebedReservation(federatableSetCrds));
				});

				callbackDone(federatableReservations);

			}, callbackError);
		}

		/**
		 * returns a WisebedReservation object
		 */
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
				success		: 	function(confidentialReservationDataList, textStatus, jqXHR) {
					callbackDone(new WisebedReservation(confidentialReservationDataList), textStatus, jqXHR)
				},
				error		: 	callbackError,
				xhrFields   : { withCredentials: true }
			});

		};
        
        this.delete = function(experimentId, callbackDone, callbackError) {
			var queryUrl = getBaseUri() + "/reservations/byExperimentId/" + experimentId;
			$.ajax({
                type      : 'DELETE',
				url       : queryUrl,
				success   : callbackDone,
				error     : callbackError,
				context   : document.body,
				dataType  : "json",
				xhrFields : { withCredentials: true }
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

				var flashRequestStatusURL = jqXHR.getResponseHeader("Location");

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

		var dataType = (!jsonOrXml ? "json" : jsonOrXml);
		var url = (experimentId ?
					getBaseUri() + "/experiments/" + encodeURIComponent(experimentId) + "/network." + dataType :
					getBaseUri() + "/experiments/network." + dataType);

		$.ajax({
			url      : url,
			cache    : false,
			context  : document.body,
			success  : callbackDone,
			error    : callbackError,
			complete : callbackComplete,
			dataType : dataType,
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
