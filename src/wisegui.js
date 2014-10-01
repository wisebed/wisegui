global._                       = require('underscore');
var wjs                        = require('wisebed.js');
var WiseGuiNodeTable           = require('./wisegui-node-table.js');
var WiseGuiReservationDialog   = require('./wisegui-reservation-dialog.js');
var WiseGuiReservationObserver = require('./wisegui-reservation-observer.js');
var WiseGuiReservationView     = require('./wisegui-reservation-view.js');
var WiseGuiLoginObserver       = require('./wisegui-login-observer.js');
var WiseGuiTable               = require('./wisegui-table.js');
var WiseGuiNotificationsViewer = require('./wisegui-notifications-viewer.js');
var WiseGuiNavigationView      = require('./wisegui-navigation-view.js');
var WiseGuiGoogleMapsView      = require('./wisegui-google-maps-view.js');
var WiseGuiModalDialog         = require('./wisegui-modal-dialog.js');
var WiseGuiEvents              = require('./wisegui-events.js');

global.WiseGui = {

	showAlert : function(message, severity) {
		$(window).trigger(WiseGuiEvents.EVENT_NOTIFICATION,
				{
					type     : 'alert',
					severity : severity,
					message  : message
				}
		);
	},
	showWarningAlert : function(message) {
		WiseGui.showAlert(message, 'warning');
	},
	showErrorAlert : function(message) {
		WiseGui.showAlert(message, 'error');
	},
	showSuccessAlert : function(message) {
		WiseGui.showAlert(message, 'success');
	},
	showInfoAlert : function(message) {
		WiseGui.showAlert(message, 'info');
	},
	showBlockAlert : function(message, actions, severity) {
		$(window).trigger(WiseGuiEvents.EVENT_NOTIFICATION,
				{
					type     : 'block-alert',
					severity : severity,
					message  : message,
					actions  : actions
				}
		);
	},
	showWarningBlockAlert : function(message, actions) {
		WiseGui.showBlockAlert(message, actions, 'warning');
	},
	showErrorBlockAlert : function(message, actions) {
		WiseGui.showBlockAlert(message, actions, 'error');
	},
	showSuccessBlockAlert : function(message, actions) {
		WiseGui.showBlockAlert(message, actions, 'success');
	},
	showInfoBlockAlert : function(message, actions) {
		WiseGui.showBlockAlert(message, actions, 'info');
	},
	showAjaxError : function(jqXHR, textStatus, errorThrown) {
		console.log(jqXHR);
		var message = $(
			'<h2>Error while loading data!</h2>' +
			'<h3>jqXHR</h3>' +
			(jqXHR.readyState ? ('readyState = ' + jqXHR.readyState + '<br/>') : '') +
			(jqXHR.status ? ('status = ' + jqXHR.status + '<br/>') : '') +
			(jqXHR.responseText ? ('responseText = <pre>' + jqXHR.responseText + '</pre><br/>') : '') +
			'<h3>textStatus</h3>' +
			'<pre>'+textStatus+'</pre>' +
			'<h3>errorThrown</h3>' +
			'<pre>'+errorThrown+'</pre>'
		);
		WiseGui.showErrorBlockAlert(message);
	},
	bindToReservationState : function(elems, experimentId) {

		$.each(elems, function(index,e) {

			var elem = $(e);
			var originalDisabled = elem.attr('disabled') == 'disabled';

			elem.attr('disabled', 'disabled');

			$(window).bind(WiseGuiEvents.EVENT_RESERVATION_STARTED, function(e, reservation) {
				if (experimentId == reservation.experimentId) {
					
					if (originalDisabled) {
						elem.attr('disabled', 'disabled');
					} else {
						elem.removeAttr('disabled');
					}
				}
			});

			$(window).bind(WiseGuiEvents.EVENT_RESERVATION_ENDED, function(e, reservation) {
				if (experimentId == reservation.experimentId) {
					elem.attr('disabled', 'disabled');
				}
			});
		});

		return elems;
	}
};

global.checkLoggedIn = function(callback) {
	wisebed.isLoggedIn(callback, WiseGui.showAjaxError);
};

global.doLogin = function(loginData) {

	var self = this;

	var callbackError = function(jqXHR, textStatus, errorThrown) {
		$(window).trigger(WiseGuiEvents.EVENT_LOGIN_ERROR, {
			jqXHR       : jqXHR,
			textStatus  : textStatus,
			errorThrown : errorThrown
		});
	};

	var callbackDone = function() {
		$(window).trigger(WiseGuiEvents.EVENT_LOGGED_IN, { loginData : self.loginData });
		$(window).trigger('hashchange');
	};

	wisebed.login(loginData, callbackDone, callbackError);
};

global.doLogout = function() {

	var callbackOK = function() {
		$(window).trigger(WiseGuiEvents.EVENT_LOGGED_OUT);
		$('#WiseGuiLoginDialog').remove();
		navigateTo(undefined, 'WiseGuiTestbedDetailsMapView');
	};

	var callbackError = function(jqXHR, textStatus, errorThrown) {
		WiseGui.showErrorAlert("Logout failed.");
	};

	wisebed.logout(callbackOK, callbackError);
	
};

global.wiseMLNullFilter = function(key,value) {
	if (value === null || value === undefined || (value instanceof Array && value.length === 0)) {
		return undefined;
	} else {
		return value;
	}
};

global.loadTestbedDetailsContainer = function(navigationData, parentDiv) {

	parentDiv.append($('<h2 class="WiseGuiTestbedTitle">'+testbedDescription.name+'</h2>'));

	var tabsId                          = 'WiseGuiTestbedDetailsTabs';
	var mapTabDivId                     = 'WiseGuiTestbedDetailsMapView';
	var nodesTabDivId                   = 'WiseGuiTestbedDetailsNodes';
	var reservationsTabDivId            = 'WiseGuiTestbedDetailsReservations';
	var myReservationsTabDivId          = 'WiseGuiTestbedDetailsMyReservations';
	var federatableReservationsTabDivId = 'WiseGuiTestbedDetailsFederatableReservations';
	var wiseMLXMLTabDivId               = 'WiseGuiTestbedDetailsWiseMLXML';
	var wiseMLJSONTabDivId              = 'WiseGuiTestbedDetailsWiseMLJSON';

	var tabs = $(
			'<ul class="nav nav-tabs" id="'+tabsId+'">' +
			'	<li class="active"    ><a href="#'+mapTabDivId+'">Map</a></li>' +
			'	<li                   ><a href="#'+nodesTabDivId+'">Nodes</a></li>' +
			'	<li                   ><a href="#'+reservationsTabDivId+'">All Reservations</a></li>' +
			'	<li                   ><a href="#'+myReservationsTabDivId+'">My Reservations</a></li>' +
			'	<li                   ><a href="#'+federatableReservationsTabDivId+'">Federatable Reservations</a></li>' +
			'	<li class="pull-right"><a href="#'+wiseMLXMLTabDivId+'">WiseML (XML)</a></li>' +
			'	<li class="pull-right"><a href="#'+wiseMLJSONTabDivId+'">WiseML (JSON)</a></li>' +
			'</ul>' +
			'<div class="tab-content">' +
			'	<div class="tab-pane active" id="'+mapTabDivId+'"/>' +
			'	<div class="tab-pane       " id="'+nodesTabDivId+'"/>' +
			'	<div class="tab-pane       " id="'+reservationsTabDivId+'"/>' +
			'	<div class="tab-pane       " id="'+myReservationsTabDivId+'"/>' +
			'	<div class="tab-pane       " id="'+federatableReservationsTabDivId+'"/>' +
			' <div class="tab-pane       " id="'+wiseMLXMLTabDivId+'"/>' +
			'	<div class="tab-pane       " id="'+wiseMLJSONTabDivId+'"/>' +
			'</div>'
	);

	var mapTabContentDiv                     = tabs.find('#'+mapTabDivId).first();
	var nodesTabContentDiv                   = tabs.find('#'+nodesTabDivId).first();
	var reservationsTabContentDiv            = tabs.find('#'+reservationsTabDivId).first();
	var myReservationsTabContentDiv          = tabs.find('#'+myReservationsTabDivId).first();
	var federatableReservationsTabContentDiv = tabs.find('#'+federatableReservationsTabDivId).first();
	var wiseMLXMLTabContentDiv               = tabs.find('#'+wiseMLXMLTabDivId).first();
	var wiseMLJSONTabContentDiv              = tabs.find('#'+wiseMLJSONTabDivId).first();

	var myReservationsTab                    = tabs.find('a[href="#'+myReservationsTabDivId+'"]').first();
	var federatableReservationsTab           = tabs.find('a[href="#'+federatableReservationsTabDivId+'"]').first();

	parentDiv.append(tabs);
	myReservationsTab.hide();
	federatableReservationsTab.hide();

	var reloadMapsTab = function() {
		mapTabContentDiv.empty();
		buildMapsView(mapTabContentDiv);
	};

	var reloadNodesTab = function() {
		nodesTabContentDiv.empty();
		wisebed.getWiseMLAsJSON(
				null,
				function(wiseML) {
					new WiseGuiNodeTable(wiseML, nodesTabContentDiv, false, true);
				},
				WiseGui.showAjaxError
		);
	};

	var reloadReservationsTab = function() {
		reservationsTabContentDiv.empty();
		buildReservationTable(reservationsTabContentDiv);
	};

	var reloadMyReservationsTab = function() {
		if (isLoggedIn) {
			myReservationsTabContentDiv.empty();
			buildMyReservationTable(myReservationsTabContentDiv);
		}
	};

	var reloadFederatableReservationsTab = function() {
		if (testbedDescription.isFederator && isLoggedIn) {
			federatableReservationsTabContentDiv.empty();
			buildFederatableReservationTable(federatableReservationsTabContentDiv);
		}
	};

	var reloadWiseMLXMLTab = function() {
		wiseMLXMLTabContentDiv.empty();
		wisebed.getWiseMLAsXML(
				null,
				function(wiseML) {
					wiseMLXMLTabContentDiv.append($('<pre class="WiseGuiTestbedDetailsWiseMLXML">' + wiseML.replace(/</g,"&lt;") + '</pre>'));
					wiseMLXMLTabContentDiv.append($('<a href="' + wisebedBaseUrl + '/experiments/network.xml" target="_blank" class="btn btn-primary pull-right">Download</a>'));
				},
				WiseGui.showAjaxError
		);
	};

	var reloadWiseMLJSONTab = function() {
		wiseMLJSONTabContentDiv.empty();
		wisebed.getWiseMLAsJSON(
				null,
				function(wiseML) {
					wiseMLJSONTabContentDiv.append($('<pre class="WiseGuiTestbedDetailsWiseMLJSON">' + JSON.stringify(wiseML, wiseMLNullFilter, '  ') + '</pre>'));
					wiseMLJSONTabContentDiv.append($('<a href="' + wisebedBaseUrl + '/experiments/network.json" target="_blank" class="btn btn-primary pull-right">Download</a>'));
				},
				WiseGui.showAjaxError
		);
	};

	var reloadFunctions = {};
	reloadFunctions[mapTabDivId]                     = reloadMapsTab;
	reloadFunctions[nodesTabDivId]                   = reloadNodesTab;
	reloadFunctions[reservationsTabDivId]            = reloadReservationsTab;
	reloadFunctions[myReservationsTabDivId]          = reloadMyReservationsTab;
	reloadFunctions[federatableReservationsTabDivId] = reloadFederatableReservationsTab;
	reloadFunctions[wiseMLXMLTabDivId]               = reloadWiseMLXMLTab;
	reloadFunctions[wiseMLJSONTabDivId]              = reloadWiseMLJSONTab;

	var self = this;
	$(window).bind(WiseGuiEvents.EVENT_NAVIGATION, function(e, navigationData) {
		if (navigationData.nav == 'overview' && navigationData.tab) {
			tabs.find('a[href="#'+navigationData.tab+'"]').tab('show');
			var reloadFunction = reloadFunctions[navigationData.tab];
			if (reloadFunction) {
				reloadFunction();
			}
		} else if (navigationData.nav == 'overview' && navigationData.tab === '') {
			reloadMapsTab();
		}
	});
	
	$(window).bind(WiseGuiEvents.EVENT_RESERVATIONS_CHANGED, function() {
		buildReservationTable(reservationsTabContentDiv);
		if (isLoggedIn) {
			buildMyReservationTable(myReservationsTabContentDiv);
		}
	});
	
	$(window).bind(WiseGuiEvents.EVENT_LOGGED_IN, function() {
		myReservationsTab.show();
		buildMyReservationTable(myReservationsTabContentDiv);
	});
	
	$(window).bind(WiseGuiEvents.EVENT_LOGGED_OUT, function() {
		myReservationsTab.hide();
		myReservationsTabContentDiv.empty();
	});
	
	if (testbedDescription.isFederator) {
		
		$(window).bind(WiseGuiEvents.EVENT_LOGGED_IN, function() {
			federatableReservationsTab.show();
			buildFederatableReservationTable(federatableReservationsTabContentDiv);
		});

		$(window).bind(WiseGuiEvents.EVENT_LOGGED_OUT, function() {
			federatableReservationsTab.hide();
		});

		$(window).bind(WiseGuiEvents.EVENT_RESERVATIONS_CHANGED, function() {
			if (isLoggedIn) {
				buildFederatableReservationTable(federatableReservationsTabContentDiv);
			}
		});
	}

	tabs.find('a').click(function (e) {
	    e.preventDefault();
	    var navigationData = getNavigationData();
	    navigationData.tab = e.target.hash.substring(1);
	    navigateToNavigationData(navigationData);
	});
};

global.buildMapsView = function(parent) {

	if (testbedDescription.isFederator) {
		
		wisebed.getWiseMLAsJSON(null, function(wiseML) {
		
			var wiseMLs = {
				'federated' : wiseML
			};

			// create tab pane
			var pills = $(
					'<div class="tabbable">' +
					'	<ul class="nav nav-pills"></ul>' +
					'	<div class="tab-content"></div>' +
					'</div>'
			);
			
			var headers = pills.find('ul.nav-pills');
			var contents = pills.find('div.tab-content');
			
			var federatedHeader = $('<li><a href="#WiseGuiMapsView-federated">Federated</a></li>');
			var federatedContent = $('<div class="tab-pane" id="WiseGuiMapsView-federated">Federated</div>');

			headers.append(federatedHeader);
			contents.append(federatedContent);

			// add a tab for each testbed URN prefix
			testbedDescription.urnPrefixes.forEach(function(nodeUrnPrefix, index) {

				wiseMLs[nodeUrnPrefix] = JSON.parse(JSON.stringify(wiseML));
				wiseMLs[nodeUrnPrefix].setup.node = wiseMLs[nodeUrnPrefix].setup.node.filter(function(node) {
					return node.id.indexOf(nodeUrnPrefix) === 0;
				});
				
				var header = $('<li><a href="#WiseGuiMapsView-'+index+'">'+nodeUrnPrefix+'</a></li>');
				var content = $('<div class="tab-pane" id="WiseGuiMapsView-'+index+'">'+nodeUrnPrefix+'</div>');

				$(header.find('a').first()).data('nodeUrnPrefix', nodeUrnPrefix);
				
				headers.append(header);
				contents.append(content);
			});

			pills.find('a').click(function(e) {
				
				e.preventDefault();
				$(this).tab('show');

				var nodeUrnPrefix = $(this).data('nodeUrnPrefix');
				var tab = $($(this).attr('href'));

				tab.empty();

				// init map
				var mapRow = $('<div class="row"><div class="span12"></div></div>');
				tab.append(mapRow);
				var wiseML = nodeUrnPrefix === undefined ? wiseMLs.federated : wiseMLs[nodeUrnPrefix];
				new WiseGuiGoogleMapsView(wiseML, mapRow.find('div').first());
			});

			parent.append(pills);
			pills.find('a').first().click();

		});

	} else {

		wisebed.getWiseMLAsJSON(
			null,
			function(wiseML) {
				// init description over map
				if (wiseML.setup && wiseML.setup.description) {
					var mapDescription = wiseML.setup.description;
					var mapDescriptionRow = $('<div class="row"><div class="span12">' + mapDescription + '</div></div>');
					parent.append(mapDescriptionRow);
				}
				// init map
				var mapRow = $('<div class="row"><div class="span12"></div></div>');
				parent.append(mapRow);
				new WiseGuiGoogleMapsView(wiseML, mapRow.find('div').first());
			},
			WiseGui.showAjaxError
		);
	}
};

global.buildFederatableReservationTable = function(parent) {
	
	var pills = $(
			'<div class="tabbable">' +
			'	<ul class="nav nav-pills">' +
			'		<li class="active"><a href="#WiseGuiFederatableReservationsCurrentFuture">Current and Upcoming</a></li>' +
			'	</ul>' +
			'	<div class="tab-content">' +
			'		<div class="tab-pane active" id="WiseGuiFederatableReservationsCurrentFuture"></div>' +
			'	</div>' +
			'</div>'
	);

	pills.find('a').click(function(e) {
		e.preventDefault();
		$(this).tab('show');
	});

	var currentAndFutureDiv = pills.find('#WiseGuiFederatableReservationsCurrentFuture');
	
	parent.empty();
	parent.append(pills);

	wisebed.reservations.getFederatable(
		moment(),
		null,
		function(federatableReservations) {
			buildPersonalReservationsTable(currentAndFutureDiv, federatableReservations);
		},
		WiseGui.showAjaxError
	);
};

global.buildMyReservationTable = function(parent) {

	var pills = $(
			'<div class="tabbable">' +
			'	<ul class="nav nav-pills">' +
			'		<li class="active"><a href="#WiseGuiMyReservationsCurrentFuture">Current and Upcoming</a></li>' +
			'		<li               ><a href="#WiseGuiMyReservationsPast">Past</a></li>' +
			'	</ul>' +
			'	<div class="tab-content">' +
			'		<div class="tab-pane active" id="WiseGuiMyReservationsCurrentFuture"></div>' +
			'		<div class="tab-pane"        id="WiseGuiMyReservationsPast"></div>' +
			'	</div>' +
			'</div>'
	);

	var currentAndFutureDiv = pills.find('#WiseGuiMyReservationsCurrentFuture');
	var pastDiv = pills.find('#WiseGuiMyReservationsPast');

	var loadPersonalReservations = function(past, showCancelled) {
		wisebed.reservations.getPersonal(
			!past ? moment() : null,
			 past ? moment() : null,
			function(reservations) {
				buildPersonalReservationsTable(!past ? currentAndFutureDiv : pastDiv, reservations, past);
			},
			WiseGui.showAjaxError,
			false,
			showCancelled
		);
	};

	pills.find('a[href="#WiseGuiMyReservationsCurrentFuture"]').click(function(e) {
		e.preventDefault();
		loadPersonalReservations(false, false);
		$(this).tab('show');
	});

	pills.find('a[href="#WiseGuiMyReservationsPast"]').click(function(e) {
		e.preventDefault();
		loadPersonalReservations(true, true);
		$(this).tab('show');
	});

	loadPersonalReservations(false, false);

	parent.empty();
	parent.append(pills);
};

global.buildPersonalReservationsTable = function(parent, reservations, past) {

	var nop = function(event){ event.preventDefault(); };

	var headers = ['From', 'Until', 'Testbed Prefix(es)', 'Nodes', 'Description', '', '', ''];
	var model = reservations;
	var rowProducer = function(reservation) {
		
		var rand = Math.floor(Math.random() * 100000);
		var rowData = [];
		
		rowData.push($('<a href="#" rel="tooltip" title="'+reservation.from.toISOString()+'">' + reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop));
		rowData.push($('<a href="#" rel="tooltip" title="'+reservation.to.toISOString()+'">' + reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop));
		rowData.push(reservation.nodeUrnPrefixes.join("<br/>"));
		rowData.push($(
				'<div>' +
				'	<a href="javascript:;" data-target="#wisegui-personal-reservation-nodes-'+rand+'" data-toggle="collapse">'+reservation.nodeUrns.length+' nodes</a>' +
				'	<div class="collapse" id="wisegui-personal-reservation-nodes-'+rand+'">'+reservation.nodeUrns.join("<br/>")+'</div>' +
				'</div>'
		));
		rowData.push(reservation.description);
		var openButton = $('<a class="btn btn-primary">Open</a>').bind('click', reservation, function(e) {
				e.preventDefault();
				if (openButton.attr('disabled') != 'disabled') {
					navigateTo(e.data.experimentId);
				}
		});
		if (reservation.finalized) {
			openButton.attr('disabled', 'disabled');
		}
		rowData.push(openButton);
		rowData.push($('<button class="btn" title="Download Log"><i class="icon-download"></i> Log</button>').bind('click', reservation, function(e) {
				var url = wisebedBaseUrl + '/events/' + e.data.experimentId + '.json';
				window.open(url, '_blank');
		}));
        
    	var cancelButton;
        var cancelledLabel;
    	var finalizedLabel;

    	if (reservation.cancelled) {
    		cancelledLabel = $('<span class="label label-important">Cancelled</span><br/><span class="label label-important">' + reservation.cancelled.format("YYYY-MM-DD HH:mm:ss") + '</span>');
    		cancelledLabel.popover({
    			placement : 'top',
				title   : 'Cancelled Reservation',
				content : '<p>This reservation has been <b>cancelled</b>.</p><p>A reservation ends '+
				 'either because the end of the reservaiton time span has been reached or because it has '+
				 'been cancelled. Due to network delays or temporary network disconnections in the testbed '+
				 'backend node outputs might still arrive delayed. After a couple of minutes after the '+
				 'last delayed node output was received the reservation is finalized, i.e. it is '+
				 'guaranteed that there will not be any more outputs attached to the reservations log.</p>'
			});
    	}

    	if (reservation.finalized) {
    		finalizedLabel = $('<span class="label label-info">Finalized</span>');
			finalizedLabel.popover({
				placement : 'top',
				title   : 'Finalized Reservation',
				content : '<p>This reservation has been <b>finalized</b>.</p><p>A reservation ends '+
				 'either because the end of the reservaiton time span has been reached or because it has '+
				 'been cancelled. Due to network delays or temporary network disconnections in the testbed '+
				 'backend node outputs might still arrive delayed. After a couple of minutes after the '+
				 'last delayed node output was received the reservation is finalized, i.e. it is '+
				 'guaranteed that there will not be any more outputs attached to the reservations log.</p>'
			});
		}

		if (!reservation.cancelled && !reservation.finalized && !past) {
			cancelButton = $('<a class="btn btn-danger">Cancel</a>').bind('click', reservation, function(e) {
	                e.preventDefault();
	                new WiseGuiModalDialog(undefined, function() {
	                	wisebed.reservations.cancel(
							e.data.experimentId,
							function() { 
								cancelButton.popover('hide');
								$(window).trigger(WiseGuiEvents.EVENT_RESERVATION_CANCELLED, reservation);
								$(window).trigger('hashchange');
							},
							WiseGui.showAjaxError
						);
	                }).show();
	        });
			cancelButton.popover({
				placement : 'top',
				title   : 'Cancelling Reservations',
				content : 'Cancelling a reservation will free the resources bound to the reservation so that ' +
					'e.g. other users can reserve the nodes. If a reservation gets cancelled while it is ' +
					'active all reservation events (such as node outputs) until the cancellation will still ' +
					'be persisted in the reservation log and available for download.'
			});
		}

		if (reservation.cancelled && reservation.finalized) {
			rowData.push($('<span/>').append(cancelledLabel).append(' ').append(finalizedLabel));
		} else if (reservation.cancelled) {
			rowData.push(cancelledLabel);
		} else if (reservation.finalized) {
			rowData.push(finalizedLabel);
		} else if (!past) {
			rowData.push(cancelButton);
		} else {
			rowData.push('&nbsp;');
		}

		return rowData;
	};
	var preFilterFun = null;
	var preSelectFun = null;
	var showCheckBoxes = false;
	var showFilterBox = false;
	var options = {
		noDataMessage    : 'No reservations found.',
		pagination       : true,
		paginationAmount : 10
	};

	var table = new WiseGuiTable(model, headers, rowProducer, preFilterFun, preSelectFun, showCheckBoxes, showFilterBox, options);

	parent.empty();
	parent.append(table.html);
};

global.buildReservationTableInternal = function(parent, reservations) {

	var nop = function(event){ event.preventDefault(); };

	var headers = ['From', 'Until', 'Testbed Prefix(es)', 'Nodes', ' '];
	var model = reservations;
	var rowProducer = function(reservation) {
		
		var rand = Math.floor(Math.random() * 100000);
		var rowData = [];
		
		rowData.push($('<a href="#" rel="tooltip" title="'+reservation.from.toISOString()+'">' + reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop));
		rowData.push($('<a href="#" rel="tooltip" title="'+reservation.to.toISOString()+'">' + reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop));
		rowData.push(reservation.nodeUrnPrefixes.join("<br/>"));
		rowData.push($(
				'<div>' +
				'	<a href="javascript:;" data-target="#wisegui-personal-reservation-nodes-'+rand+'" data-toggle="collapse">'+reservation.nodeUrns.length+' nodes</a>' +
				'	<div class="collapse" id="wisegui-personal-reservation-nodes-'+rand+'">'+reservation.nodeUrns.join("<br/>")+'</div>' +
				'</div>'
		));

		var cancelledLabel;
		
		if (reservation.cancelled) {
			cancelledLabel = $('<span class="label label-important">Cancelled</span><br/><span class="label label-important">' + reservation.cancelled.format("YYYY-MM-DD HH:mm:ss") + '</span>');
    		cancelledLabel.popover({
    			placement : 'top',
				title   : 'Cancelled Reservation',
				content : '<p>This reservation has been <b>cancelled</b>.</p><p>A reservation ends '+
				 'either because the end of the reservaiton time span has been reached or because it has '+
				 'been cancelled. Due to network delays or temporary network disconnections in the testbed '+
				 'backend node outputs might still arrive delayed. After a couple of minutes after the '+
				 'last delayed node output was received the reservation is finalized, i.e. it is '+
				 'guaranteed that there will not be any more outputs attached to the reservations log.</p>'
			});
		}

		if (reservation.cancelled) {
			rowData.push(cancelledLabel);
		} else {
			rowData.push('&nbsp;');
		}

		return rowData;
	};

	var preFilterFun = null;
	var preSelectFun = null;
	var showCheckBoxes = false;
	var showFilterBox = false;
	var options = {
		noDataMessage    : 'No reservations found.',
		sortColumn       : 0,
		pagination       : true,
		paginationAmount : 10
	};

	var table = new WiseGuiTable(model, headers, rowProducer, preFilterFun, preSelectFun, showCheckBoxes, showFilterBox, options);

	parent.empty();
	parent.append(table.html);
};

global.buildReservationTable = function(parent) {
	
	var pills = $(
			'<div class="tabbable">' +
			'	<ul class="nav nav-pills">' +
			'		<li class="active"><a href="#WiseGuiPublicReservationsCurrentFuture">Current and Upcoming</a></li>' +
			'		<li               ><a href="#WiseGuiPublicReservationsPast">Past</a></li>' +
			'	</ul>' +
			'	<div class="tab-content">' +
			'		<div class="tab-pane active" id="WiseGuiPublicReservationsCurrentFuture"></div>' +
			'		<div class="tab-pane"        id="WiseGuiPublicReservationsPast"></div>' +
			'	</div>' +
			'</div>'
	);

	var currentAndFutureDiv = pills.find('#WiseGuiPublicReservationsCurrentFuture');
	var pastDiv = pills.find('#WiseGuiPublicReservationsPast');

	var loadPublicReservations = function(past, showCancelled) {
		wisebed.reservations.getPublic(
			!past ? moment() : null,
			 past ? moment() : null,
			function(reservations) {
				buildReservationTableInternal(!past ? currentAndFutureDiv : pastDiv, reservations);
			},
			WiseGui.showAjaxError,
			showCancelled
		);
	};

	pills.find('a[href="#WiseGuiPublicReservationsCurrentFuture"]').click(function(e) {
		e.preventDefault();
		loadPublicReservations(false, false);
		$(this).tab('show');
	});

	pills.find('a[href="#WiseGuiPublicReservationsPast"]').click(function(e) {
		e.preventDefault();
		loadPublicReservations(true, true);
		$(this).tab('show');
	});

	loadPublicReservations(false, false);
	
	parent.empty();
	parent.append(pills);
};

global.loadReservationViewContainer = function(navigationData, parentDiv) {

	wisebed.reservations.getByExperimentId(navigationData.experimentId, function(reservation) {

		var reservationView = new WiseGuiReservationView(reservation);
		parentDiv.append(reservationView.view);
		$(window).trigger('hashchange');

	}, WiseGui.showAjaxError);
};

global.getNavigationKey = function(navigationData) {
	if (navigationData.nav == 'overview' && navigationData.experimentId === '') {
		return 'overview';
	} else if (navigationData.nav == 'experiment' && navigationData.experimentId !== '') {
		return 'experimentId=' + navigationData.experimentId;
	}
	return undefined;
};

global.getCreateContentFunction = function(navigationData) {
	if (navigationData.nav == 'overview' && navigationData.experimentId === '')   { return loadTestbedDetailsContainer;  }
	if (navigationData.nav == 'experiment' && navigationData.experimentId !== '') { return loadReservationViewContainer; }
	return undefined;
};

global.showReservationsDialog = function() {
	var existingDialog = $("#WiseGuiReservationDialog");
	if (existingDialog.length !== 0) {existingDialog.modal('show');}
	else {new WiseGuiReservationDialog();}
};

global.navigateToNavigationData = function(navigationData) {
	console.log('navigateToNavigationData(%s)', JSON.stringify(navigationData));
	if (navigationData) {
		window.location.hash = '#nav='+encodeURIComponent(navigationData.nav)+'&experimentId='+encodeURIComponent(navigationData.experimentId)+'&tab='+encodeURIComponent(navigationData.tab);
	} else {
		window.location.hash = '#nav=overview';
	}
};

global.navigateTo = function(experimentId, tab) {
	navigateToNavigationData({
		nav          : (experimentId ? 'experiment' : 'overview'),
		experimentId : (experimentId || ''),
		tab          : (tab || '')
	});
};

global.getNavigationData = function(fragment) {
	var decoded = decodeUrlHash();
	return {
		nav          : decoded.nav          || 'overview',
		experimentId : decoded.experimentId || '',
		tab          : decoded.tab          || ''
	};
};

global.createNavigationContainer = function() {

	var container = $('<div class="WiseGuiNavigationContainer" id="WiseGuiNavigationContainer"/>');
	
	$('#WiseGuiContainer .WiseGuiNotificationsContainer').before(container);

	var navigationViewer = new WiseGuiNavigationView();
	container.append(navigationViewer.view);
	return container;
};

global.switchContentContainer = function(navigationData, navigationKey) {
	$('#WiseGuiContainer .WiseGuiContentContainer').hide();
	getOrCreateContentContainer(navigationData, navigationKey).show();
};

global.getOrCreateContentContainer = function(navigationData, navigationKey) {
	
	if (contentContainers[navigationKey]) {
		return contentContainers[navigationKey];
	}

	var container = createContentContainer(navigationData);
	contentContainers[navigationKey] = container;
	return container;
};

global.createContentContainer = function(navigationData) {
	
	var container = $('<div class="WiseGuiContentContainer"/>');
	container.hide();

	$('#WiseGuiContainer .WiseGuiNotificationsContainer').after(container);

	var createContentFunction = getCreateContentFunction(navigationData);
	if (createContentFunction === undefined) {
		console.warn("createContentFunction is undefined");
		console.warn(navigationData);
	} else {
		createContentFunction(navigationData, container);
	}

	return container;
};

global.connectEventWebSocket = function() {

	console.log('EventWebSocket: trying to connect');

	var onOpen = function() {
		
		console.log('EventWebSocket: connection established');
		eventWebSocketState = 'connected';
		$(window).trigger(EVENT_EVENTWEBSOCKET_CONNECTED);

		if (eventWebSocketSchedule !== undefined) {
			console.log('EventWebSocket: cancelling reconnection schedule');
			window.clearInterval(eventWebSocketSchedule);
			eventWebSocketSchedule = undefined;
		}
	};

	var onClosed = function(closeEvent) {
		
		console.log(eventWebSocket.readyState);
		console.log(closeEvent);

		if (eventWebSocketState == 'connected') {
			console.log('EventWebSocket: connection closed');
			$(window).trigger(EVENT_EVENTWEBSOCKET_DISCONNECTED);
			eventWebSocketState = 'disconnected';
		}

		if (eventWebSocketSchedule === undefined) {
			console.log('EventWebSocket: scheduling reconnect every 5 seconds');
			eventWebSocketSchedule = window.setInterval(connectEventWebSocket, 5000);
		}
	};

	var onAttached = function(devicesAttachedEvent) { $(window).trigger(EVENT_DEVICES_ATTACHED, devicesAttachedEvent); };
	var onDetached = function(devicesDetachedEvent) { $(window).trigger(EVENT_DEVICES_DETACHED, devicesDetachedEvent); };

	eventWebSocket = new wisebed.EventWebSocket(onAttached, onDetached, onOpen, onClosed);

	$(window).bind(EVENT_EVENTWEBSOCKET_DISCONNECTED, function() {

		var disconnectionModal = $(
				'<div class="modal hide" id="WiseGuiDisconnectionModal">' +
				'	<div class="modal-header">' +
				'		<button type="button" class="close" data-dismiss="modal">×</button>' +
				'		<h3>Connection Lost...</h3>' +
				'	</div>' +
				'	<div class="modal-body">' +
				'		<p>WiseGui is currently offline as it lost the connection to the testbeds portal server. Trying to reconnect every 5 seconds...</p>' +
				'	</div>' +
				'</div>'
		);
		
		$(document.body).append(disconnectionModal);
		disconnectionModal.modal('show');

		$(window).bind(EVENT_EVENTWEBSOCKET_CONNECTED, function() {
			$('#WiseGuiDisconnectionModal').modal('hide');
			$('#WiseGuiDisconnectionModal').remove();
		});
	});

};

// export event constants into global namespace for backwards compatibility with older code
for (var eventName in WiseGuiEvents) {
	global[eventName] = WiseGuiEvents[eventName];
}

// print all events to console for debugging as soon as they occur
for (var eventName in WiseGuiEvents) {
	/*jshint loopfunc:true */
	$(window).bind(WiseGuiEvents[eventName], function(e, data) {
		console.log('+++ %s => %s', eventName, JSON.stringify(data));
	});
}

// some more global vars for backwards compatibility
global.wisebed                            = new wjs.Wisebed(wisebedBaseUrl, wisebedWebSocketBaseUrl);
global.WisebedPublicReservationData       = wjs.WisebedPublicReservationData;
global.WisebedConfidentialReservationData = wjs.WisebedConfidentialReservationData;
global.WisebedReservation                 = wjs.WisebedReservation;

global.navigationContainer    = null;
global.contentContainers      = {};
global.loginObserver          = new WiseGuiLoginObserver();
global.reservationObserver    = new WiseGuiReservationObserver();
global.notificationsViewer    = new WiseGuiNotificationsViewer();
global.testbedDescription     = null;
global.eventWebSocket         = null;
global.eventWebSocketSchedule = null;
global.eventWebSocketState    = 'disconnected';
global.isLoggedIn             = false;
global.$                      = $;

global.decodeUrlHash = function () {
	var urlParams = {};
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.hash.substring(1);

    while ((match = search.exec(query)) !== null) {
       urlParams[decode(match[1])] = decode(match[2]);
    }

    return urlParams;
};

// extend jQuery with the 'exists' function to check if selector returned empty result
// and only do so if not done yet...
if (!($.fn.exists)) {
	$.fn.exists = function () {
		return this.length !== 0;
	};
}

$(function () {

	$('#WiseGuiContainer').append(notificationsViewer.view);
	$('.modal').modal({ keyboard: true });

	$(window).bind(EVENT_LOGGED_IN,  function() { isLoggedIn = true;  });
	$(window).bind(EVENT_LOGGED_OUT, function() { isLoggedIn = false; });

	connectEventWebSocket();

	wisebed.getTestbedDescription(
		function(td) {

			testbedDescription = td;

			navigationContainer = createNavigationContainer();

			var navigationData = {nav:'overview', experimentId:'', tab:''};
			getOrCreateContentContainer(navigationData, getNavigationKey(navigationData));

			reservationObserver.startObserving();
			loginObserver.startObserving();

			window.onhashchange = function(e) {
				
				console.log('onhashchange');
				e.preventDefault();

				var navigationData = getNavigationData();
				var navigationKey  = getNavigationKey(navigationData);
				switchContentContainer(navigationData, navigationKey);
				$(window).trigger(WiseGuiEvents.EVENT_NAVIGATION, navigationData);
			};
			
			$(window).trigger('hashchange');

			// Test for 3rd party cookies
			var cookieCallbackError = function(jqXHR, textStatus, errorThrown) {
				WiseGui.showErrorAlert(
						'Your browser doesn\'t support 3rd party cookies. ' +
						'Please enable them or you will not be able to login. ' +
						'Otherwise you can go to <a href="' + wisebedBaseUrl + '">' + wisebedBaseUrl + '</a>'
				);
			};
			wisebed.testCookie(function() {}, cookieCallbackError);
		},
		WiseGui.showAjaxError
	);
});
