var WiseGui = new function() {

	this.showAlert = function(message, severity) {
		$(window).trigger('wisegui-notification',
				{
					type     : 'alert',
					severity : severity,
					message  : message
				}
		);
	};

	this.showWarningAlert = function(message) { this.showAlert(message, 'warning'); };
	this.showErrorAlert   = function(message) { this.showAlert(message, 'error'  ); };
	this.showSuccessAlert = function(message) { this.showAlert(message, 'success'); };
	this.showInfoAlert    = function(message) { this.showAlert(message, 'info'   ); };

	this.showBlockAlert = function(message, actions, severity) {
		$(window).trigger('wisegui-notification',
				{
					type     : 'block-alert',
					severity : severity,
					message  : message,
					actions  : actions
				}
		);
	};

	this.showWarningBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'warning'); };
	this.showErrorBlockAlert   = function(message, actions) { this.showBlockAlert(message, actions, 'error'  ); };
	this.showSuccessBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'success'); };
	this.showInfoBlockAlert    = function(message, actions) { this.showBlockAlert(message, actions, 'info'   ); };

	var self = this;
	this.showAjaxError = function(jqXHR, textStatus, errorThrown) {
		console.log(jqXHR);
		var message = $('<h2>Error while loading data!</h2>'
				+ '<h3>jqXHR</h3>'
				+ (jqXHR.readyState ? ('readyState = ' + jqXHR.readyState + '<br/>') : '')
				+ (jqXHR.status ? ('status = ' + jqXHR.status + '<br/>') : '')
				+ (jqXHR.responseText ? ('responseText = <pre>' + jqXHR.responseText + '</pre><br/>') : '')
				+ '<h3>textStatus</h3>'
				+ '<pre>'+textStatus+'</pre>'
				+ '<h3>errorThrown</h3>'
				+ '<pre>'+errorThrown+'</pre>');
		self.showErrorBlockAlert(message);
	};
};

/**
 * #################################################################
 * Global Functions
 * #################################################################
 */

function checkLoggedIn(callback) {
	wisebed.isLoggedIn(callback, WiseGui.showAjaxError);
};

function doLogin(loginData) {

	var self = this;

	var callbackError = function(jqXHR, textStatus, errorThrown) {
		$(window).trigger('wisegui-login-error', {
			jqXHR       : jqXHR,
			textStatus  : textStatus,
			errorThrown : errorThrown
		});
	};

	var callbackDone = function() {
		$(window).trigger('wisegui-logged-in', {loginData : self.loginData});
		$(window).trigger('hashchange');
	};

	wisebed.login(loginData, callbackDone, callbackError);
};

function doLogout() {

	var callbackOK = function() {
		$(window).trigger('wisegui-logged-out');
		$('#WiseGuiLoginDialog').remove();
		navigateTo(undefined, 'WiseGuiTestbedDetailsMapView');
	};

	var callbackError = function(jqXHR, textStatus, errorThrown) {
		WiseGui.showErrorAlert("Logout failed.");
	};

	wisebed.logout(callbackOK, callbackError);
	
};

function wiseMLNullFilter(key,value) {
	if (value == null || value === undefined || (value instanceof Array && value.length == 0)) {
		return undefined;
	} else {
		return value;
	}
};

function loadTestbedDetailsContainer(navigationData, parentDiv) {

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
			  '<ul class="nav nav-tabs" id="'+tabsId+'">'
			+ '	<li class="active"    ><a href="#'+mapTabDivId+'">Map</a></li>'
			+ '	<li                   ><a href="#'+nodesTabDivId+'">Nodes</a></li>'
			+ '	<li                   ><a href="#'+reservationsTabDivId+'">All Reservations</a></li>'
			+ '	<li                   ><a href="#'+myReservationsTabDivId+'">My Reservations</a></li>'
			+ '	<li                   ><a href="#'+federatableReservationsTabDivId+'">Federatable Reservations</a></li>'
			+ '	<li class="pull-right"><a href="#'+wiseMLXMLTabDivId+'">WiseML (XML)</a></li>'
			+ '	<li class="pull-right"><a href="#'+wiseMLJSONTabDivId+'">WiseML (JSON)</a></li>'
			+ '</ul>'
			+ '<div class="tab-content">'
			+ '	<div class="tab-pane active" id="'+mapTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+nodesTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+reservationsTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+myReservationsTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+federatableReservationsTabDivId+'"/>'
			+ ' <div class="tab-pane       " id="'+wiseMLXMLTabDivId+'"/>'
			+ '	<div class="tab-pane       " id="'+wiseMLJSONTabDivId+'"/>'
			+ '</div>');

	var mapTabContentDiv                     = tabs.find('#'+mapTabDivId).first();
	var nodesTabContentDiv                   = tabs.find('#'+nodesTabDivId).first();
	var reservationsTabContentDiv            = tabs.find('#'+reservationsTabDivId).first();
	var myReservationsTabContentDiv          = tabs.find('#'+myReservationsTabDivId).first();
	var federatableReservationsTabContentDiv = tabs.find('#'+federatableReservationsTabDivId).first();
	var wiseMLXMLTabContentDiv               = tabs.find('#'+wiseMLXMLTabDivId).first();
	var wiseMLJSONTabContentDiv              = tabs.find('#'+wiseMLJSONTabDivId).first();

	var myReservationsTab                    = tabs.find('a[href="#'+mapTabDivId+'"]').first();
	var myReservationsTab                    = tabs.find('a[href="#'+myReservationsTabDivId+'"]').first();
	var federatableReservationsTab           = tabs.find('a[href="#'+federatableReservationsTabDivId+'"]').first();

	parentDiv.append(tabs);
	myReservationsTab.hide();
	federatableReservationsTab.hide();

	var reloadMapsTab = function() {
		mapTabContentDiv.empty();
		wisebed.getWiseMLAsJSON(
			null,
			function(wiseML) {
				
				// init description over map
				if (wiseML.setup && wiseML.setup.description) {
					var mapDescription = wiseML.setup.description;
					var mapDescriptionRow = $('<div class="row"><div class="span12">' + mapDescription + '</div></div>');
					mapTabContentDiv.append(mapDescriptionRow);
				}

				// init map
				var mapRow = $('<div class="row"><div class="span12"></div></div>');
				mapTabContentDiv.append(mapRow);
				new WiseGuiGoogleMapsView(wiseML, mapRow.find('div').first());
			},
			WiseGui.showAjaxError
		);
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
					wiseMLXMLTabContentDiv.append($('<pre class="WiseGuiTestbedDetailsWiseMLXML">'+new XMLSerializer().serializeToString(wiseML).replace(/</g,"&lt;")+'</pre>'));
					wiseMLXMLTabContentDiv.append($('<a href="'+wisebedBaseUrl + '/experiments/network.xml" target="_blank" class="btn btn-primary pull-right">Download</a>'));
				},
				WiseGui.showAjaxError
		);
	};

	var reloadWiseMLJSONTab = function() {
		wiseMLJSONTabContentDiv.empty();
		wisebed.getWiseMLAsJSON(
				null,
				function(wiseML) {
					wiseMLJSONTabContentDiv.append($('<pre class="WiseGuiTestbedDetailsWiseMLJSON">'+JSON.stringify(wiseML, wiseMLNullFilter, '  ')+'</pre>'));
					wiseMLJSONTabContentDiv.append($('<a href="'+wisebedBaseUrl + '/experiments/network.json" target="_blank" class="btn btn-primary pull-right">Download</a>'));
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
	$(window).bind('wisegui-navigation-event', function(e, navigationData) {
		if (navigationData.nav == 'overview' && navigationData.tab) {
			tabs.find('a[href="#'+navigationData.tab+'"]').tab('show');
			var reloadFunction = reloadFunctions[navigationData.tab];
			if (reloadFunction) {
				reloadFunction();
			}
		} else if (navigationData.nav == 'overview' && navigationData.tab == '') {
			reloadMapsTab();
		}
	});
	
	$(window).bind('wisegui-reservations-changed', function() {
		buildReservationTable(reservationsTabContentDiv);
	});
	
	$(window).bind('wisegui-logged-in', function() {
		myReservationsTab.show();
		buildMyReservationTable(myReservationsTabContentDiv);
	});
	
	$(window).bind('wisegui-logged-out', function() {
		myReservationsTab.hide();
		myReservationsTabContentDiv.empty();
	});

	$(window).bind('wisegui-reservations-changed', function() {
		if (isLoggedIn) {
			buildMyReservationTable(myReservationsTabContentDiv);
		}
	});
	
	if (testbedDescription.isFederator) {
		
		$(window).bind('wisegui-logged-in', function() {
			federatableReservationsTab.show();
			buildFederatableReservationTable(federatableReservationsTabContentDiv);
		});

		$(window).bind('wisegui-logged-out', function() {
			federatableReservationsTab.hide();
		});

		$(window).bind('wisegui-reservations-changed', function() {
			if (isLoggedIn) {
				buildFederatableReservationTable(federatableReservationsTabContentDiv);
			}
		});
	}

	tabs.find('a').click(function (e) {
	    e.preventDefault();
	    var navigationData = getNavigationData();
	    navigationData.tab = e.target.hash.substring(1);
	    window.location.hash = $.param(navigationData);
	});

	buildReservationTable(reservationsTabContentDiv);
	if (isLoggedIn) {
		buildFederatableReservationTable(federatableReservationsTabContentDiv);
	}
}

function buildFederatableReservationTable(tab) {
	wisebed.reservations.getFederatable(
			null,
			null,
			function(federatableReservations) { buildPersonalReservationsTable(tab, federatableReservations); },
			WiseGui.showAjaxError
	);
}

function buildMyReservationTable(parent) {
	wisebed.reservations.getPersonal(
			null,
			null,
			function(wisebedReservationList) {
				buildPersonalReservationsTable(parent, wisebedReservationList);
			},
			WiseGui.showAjaxError
	);
};

function buildPersonalReservationsTable(parent, reservations) {

	var tableHead = [
		{content: "From", style: "white-space: nowrap;"},
		{content: "Until", style: "white-space: nowrap;"},
		"Testbed Prefix(es)",
		{content: "Nodes", style: "white-space: nowrap;"},
		"Description",
		""
	];

	var tableRows = [];
	var nop = function(event){ event.preventDefault(); };
	var reservation, from, to, nodes, btn;

	for (var i=0; i<reservations.length; i++) {

		reservation = reservations[i];

		from  = $('<a href="#" rel="tooltip" title="'+reservation.from.toISOString()+'">' + reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop);
		to    = $('<a href="#" rel="tooltip" title="'+reservation.to.toISOString()+'">' + reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop);
		nodes = $('<a href="#" rel="tooltip" title="'+reservation.nodeUrns.join("<br/>")+'">'+ reservation.nodeUrns.length + ' nodes</a>').tooltip('show').click(nop);
		btn   = $('<a class="btn btn-primary">Open</a>').bind('click', reservation, function(e) {
			e.preventDefault();
			navigateTo(e.data.experimentId);
		});

		tableRows[i] = [];
		tableRows[i][0] = from;
		tableRows[i][1] = to;
		tableRows[i][2] = reservation.nodeUrnPrefixes.join("<br/>");
		tableRows[i][3] = nodes;
		tableRows[i][4] = reservation.description;
		tableRows[i][5] = btn;
	}

	var noEntriesMessage = 'No reservations available';
	var table = buildTable(tableHead, tableRows, noEntriesMessage);
	parent.empty();
	parent.append(table);
	if (tableRows.length > 0) {
		table.tablesorter({ sortList: [[0,1]] });
	}
}

function buildReservationTable(reservationsTab) {
	wisebed.reservations.getPublic(
			null,
			null,
			function(reservations) {

				var tableHead = [
					"From",
					"Until",
					"Testbed Prefix(es)",
					"Nodes"
				];

				var tableRows = [];
				var reservation;
				var nop = function(event){ event.preventDefault(); };
				var from, to, nodes;

				for (var i=0; i<reservations.length; i++) {

					reservation = reservations[i];
					from  = $('<a href="#" rel="tooltip" title="'+reservation.from.toISOString()+'">' + reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop);
					to    = $('<a href="#" rel="tooltip" title="'+reservation.to.toISOString()+'">' + reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop);
					nodes = $('<a href="#" rel="tooltip" title="'+reservation.nodeUrns.join("<br/>")+'">'+ reservation.nodeUrns.length + ' nodes</a>').tooltip('show').click(nop);

					tableRows[i]    = [];
					tableRows[i][0] = from;
					tableRows[i][1] = to;
					tableRows[i][2] = reservation.nodeUrnPrefixes.join("<br/>");
					tableRows[i][3] = nodes;
				}

				var noEntriesMessage = 'There are no reservations for the next week yet!';
				var table = buildTable(tableHead, tableRows, noEntriesMessage);
				reservationsTab.empty();
				reservationsTab.append(table);
				if (tableRows.length > 0) {
					table.tablesorter({ sortList: [[0,1]] });
				}
			},
			WiseGui.showAjaxError
	);
}


function buildTable(tableHead, tableRows, noEntriesMessage) {

	var table = $('<table class="table table-striped table-bordered"/>"');
	var thead = $('<thead/>');
	var theadRow = $('<tr/>');
	thead.append(theadRow);

	for (var i=0; i<tableHead.length; i++) {
		if (typeof tableHead[i] === 'object') {
			theadRow.append('<th style="'+tableHead[i].style+'">'+tableHead[i].content+'</th>');
		} else {
			theadRow.append('<th>'+tableHead[i]+'</th>');
		}
	}

	var tbody = $('<tbody/>');

	if(tableRows.length == 0 && noEntriesMessage) {
	    tbody.append('<tr><td colspan="'+tableHead.length+'">'+noEntriesMessage+'</td></tr>');
	}

	for (var k=0; k<tableRows.length; k++) {
		var row = $('<tr/>');
		tbody.append(row);
		for (var l=0; l<tableRows[k].length; l++) {
			var td = $(typeof tableHead[l] === 'object' ? '<td style="' + tableHead[l].style + '"/>' : '<td/>');
			row.append(td);
			td.append(tableRows[k][l]);
		}
	}

	table.append(thead, tbody);

	return table;
}

function loadReservationViewContainer(navigationData, parentDiv) {

	wisebed.reservations.getByExperimentId(navigationData.experimentId, function(reservation) {

		var reservationView = new WiseGuiReservationView(reservation);
		parentDiv.append(reservationView.view);
		$(window).trigger('hashchange');

	}, WiseGui.showAjaxError);
}

function getNavigationKey(navigationData) {
	if (navigationData.nav == 'overview' && navigationData.experimentId == '') {
		return 'overview';
	} else if (navigationData.nav == 'experiment' && navigationData.experimentId != '') {
		return 'experimentId=' + navigationData.experimentId;
	}
	return undefined;
}

function getCreateContentFunction(navigationData) {
	if (navigationData.nav == 'overview' && navigationData.experimentId == '')   { return loadTestbedDetailsContainer;  }
	if (navigationData.nav == 'experiment' && navigationData.experimentId != '') { return loadReservationViewContainer; }
	return undefined;
}

function showReservationsDialog() {
	var existingDialog = $("#WiseGuiReservationDialog");
	if (existingDialog.length != 0) {existingDialog.modal('show');}
	else {new WiseGuiReservationDialog();}
}

function navigateTo(experimentId, tab) {
	var navigationData = {
		nav          : (experimentId ? 'experiment' : 'overview'),
		experimentId : (experimentId || ''),
		tab          : (tab || '')
	};
	$.bbq.pushState(navigationData);
}

function getNavigationData(fragment) {

	var parsedFragment = $.deparam.fragment(fragment ? fragment : window.location.fragment);

	return {
		nav          : parsedFragment['nav']          || 'overview',
		experimentId : parsedFragment['experimentId'] || '',
		tab          : parsedFragment['tab']          || ''
	};
}

function createNavigationContainer() {

	var container = $('<div class="WiseGuiNavigationContainer" id="WiseGuiNavigationContainer"/>');
	
	$('#WiseGuiContainer .WiseGuiNotificationsContainer').before(container);

	var navigationViewer = new WiseGuiNavigationView();
	container.append(navigationViewer.view);
	return container;
}

function switchContentContainer(navigationData, navigationKey) {
	$('#WiseGuiContainer .WiseGuiContentContainer').hide();
	getOrCreateContentContainer(navigationData, navigationKey).show();
}

function getOrCreateContentContainer(navigationData, navigationKey) {
	
	if (contentContainers[navigationKey]) {
		return contentContainers[navigationKey];
	}

	var container = createContentContainer(navigationData);
	contentContainers[navigationKey] = container;
	return container;
}

function createContentContainer(navigationData) {
	
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
}


function onHashChange(e) {

	var navigationData = getNavigationData(e.fragment);
	var navigationKey  = getNavigationKey(navigationData);

	switchContentContainer(navigationData, navigationKey);

	$(window).trigger('wisegui-navigation-event', navigationData);
}

var wisebed              = new Wisebed(wisebedBaseUrl, wisebedWebSocketBaseUrl);

var navigationContainer  = undefined;
var contentContainers    = {};

var loginObserver        = new WiseGuiLoginObserver();
var reservationObserver  = new WiseGuiReservationObserver();
var notificationsViewer  = new WiseGuiNotificationsViewer();

var testbedDescription   = null;
var eventWebSocket       = undefined;
var isLoggedIn           = false;

$(function () {

	$('#WiseGuiContainer').append(notificationsViewer.view);
	$('.modal').modal({ keyboard: true });

	$(window).bind('wisegui-logged-in', function()  { isLoggedIn = true;  });
	$(window).bind('wisegui-logged-out', function() { isLoggedIn = false; });

	if (eventWebSocket === undefined) {
		eventWebSocket = new wisebed.EventWebSocket(
			function(devicesAttachedEvent) {$(window).trigger('wisegui-devices-attached-event', devicesAttachedEvent);},
			function(devicesDetachedEvent) {$(window).trigger('wisegui-devices-detached-event', devicesDetachedEvent);},
			function() { console.log('EventWebSocket connection established'); },
			function() { console.log('EventWebSocket connection closed'); eventWebSocket = undefined; }
		);
	}

	wisebed.getTestbedDescription(
		function(td) {

			testbedDescription = td;

			navigationContainer = createNavigationContainer();

			var navigationData = {nav:'overview', experimentId:'', tab:''};
			getOrCreateContentContainer(navigationData, getNavigationKey(navigationData));

			reservationObserver.startObserving();
			loginObserver.startObserving();

			$(window).bind('hashchange', onHashChange);
			$(window).trigger('hashchange');

			// Test for 3rd party cookies
			var cookieCallbackError = function(jqXHR, textStatus, errorThrown) {
				WiseGui.showErrorAlert(
						'Your browser doesn\'t support 3rd party cookies. '
						+ 'Please enable them or you will not be able to login. '
						+ 'Otherwise you can go to <a href="' + wisebedBaseUrl + '">' + wisebedBaseUrl + '</a>');
			};
			wisebed.testCookie(function() {}, cookieCallbackError);
		},
		WiseGui.showAjaxError
	);
});
