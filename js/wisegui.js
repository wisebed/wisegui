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

	this.bindToReservationState = function(elems, experimentId) {

		$.each(elems, function(index,e) {

			var elem = $(e);
			var originalDisabled = elem.attr('disabled') == 'disabled';

			elem.attr('disabled', 'disabled');

			$(window).bind('wisegui-reservation-started', function(e, reservation) {
				if (experimentId == reservation.experimentId) {
					
					if (originalDisabled) {
						elem.attr('disabled', 'disabled');
					} else {
						elem.removeAttr('disabled');
					}
				}
			});

			$(window).bind('wisegui-reservation-ended', function(e, reservation) {
				if (experimentId == reservation.experimentId) {
					elem.attr('disabled', 'disabled');
				}
			});
		});

		return elems;
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
		if (isLoggedIn) {
			buildMyReservationTable(myReservationsTabContentDiv);
		}
	});
	
	$(window).bind('wisegui-logged-in', function() {
		myReservationsTab.show();
		buildMyReservationTable(myReservationsTabContentDiv);
	});
	
	$(window).bind('wisegui-logged-out', function() {
		myReservationsTab.hide();
		myReservationsTabContentDiv.empty();
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
}

function buildMapsView(parent) {

	if (testbedDescription.isFederator) {
		
		wisebed.getWiseMLAsJSON(null, function(wiseML) {
		
			var wiseMLs = {
				'federated' : wiseML
			};

			// create tab pane
			var pills = $(
				'<div class="tabbable">'
			  + '	<ul class="nav nav-pills"></ul>'
			  + '	<div class="tab-content"></div>'
			  + '</div>'
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
					return node.id.indexOf(nodeUrnPrefix) == 0;
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
				var wiseML = nodeUrnPrefix === undefined ? wiseMLs['federated'] : wiseMLs[nodeUrnPrefix];
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
}

function buildFederatableReservationTable(parent) {
	
	var pills = $(
			'<div class="tabbable">'
		  + '	<ul class="nav nav-pills">'
		  + '		<li class="active"><a href="#WiseGuiFederatableReservationsCurrentFuture">Current and Upcoming</a></li>'
		  + '	</ul>'
		  + '	<div class="tab-content">'
		  + '		<div class="tab-pane active" id="WiseGuiFederatableReservationsCurrentFuture"></div>'
		  + '	</div>'
		  + '</div>'
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
}

function buildMyReservationTable(parent) {

	var pills = $(
			'<div class="tabbable">'
		  + '	<ul class="nav nav-pills">'
		  + '		<li class="active"><a href="#WiseGuiMyReservationsCurrentFuture">Current and Upcoming</a></li>'
		  + '		<li               ><a href="#WiseGuiMyReservationsPast">Past</a></li>'
		  + '	</ul>'
		  + '	<div class="tab-content">'
		  + '		<div class="tab-pane active" id="WiseGuiMyReservationsCurrentFuture"></div>'
		  + '		<div class="tab-pane"        id="WiseGuiMyReservationsPast"></div>'
		  + '	</div>'
		  + '</div>'
	);

	var currentAndFutureDiv = pills.find('#WiseGuiMyReservationsCurrentFuture');
	var pastDiv = pills.find('#WiseGuiMyReservationsPast');

	var loadPersonalReservations = function(past) {
		wisebed.reservations.getPersonal(
			!past ? moment() : null,
			 past ? moment() : null,
			function(reservations) {
				buildPersonalReservationsTable(!past ? currentAndFutureDiv : pastDiv, reservations);
			},
			WiseGui.showAjaxError
		);
	}

	pills.find('a[href="#WiseGuiMyReservationsCurrentFuture"]').click(function(e) {
		e.preventDefault();
		loadPersonalReservations(false);
		$(this).tab('show');
	});

	pills.find('a[href="#WiseGuiMyReservationsPast"]').click(function(e) {
		e.preventDefault();
		loadPersonalReservations(true);
		$(this).tab('show');
	});

	loadPersonalReservations(false);

	parent.empty();
	parent.append(pills);
};

function buildPersonalReservationsTable(parent, reservations) {

	var nop = function(event){ event.preventDefault(); };

	var headers = ['From', 'Until', 'Testbed Prefix(es)', 'Nodes', 'Description', ''];
	var model = reservations;
	var rowProducer = function(reservation) {
		
		var rand = Math.floor(Math.random() * 100000);
		var rowData = [];
		
		rowData.push($('<a href="#" rel="tooltip" title="'+reservation.from.toISOString()+'">' + reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop));
		rowData.push($('<a href="#" rel="tooltip" title="'+reservation.to.toISOString()+'">' + reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop));
		rowData.push(reservation.nodeUrnPrefixes.join("<br/>"));
		rowData.push($(
			  '<div>'
			+ '	<a href="javascript:;" data-target="#wisegui-personal-reservation-nodes-'+rand+'-'+i+'" data-toggle="collapse">'+reservation.nodeUrns.length+' nodes</a>'
			+ ' <div class="collapse" id="wisegui-personal-reservation-nodes-'+rand+'-'+i+'">'+reservation.nodeUrns.join("<br/>")+'</div>'
			+ '</div>'
		));
		rowData.push(reservation.description);
		rowData.push($('<a class="btn btn-primary">Open</a>').bind('click', reservation, function(e) {
			e.preventDefault();
			navigateTo(e.data.experimentId);
		}));

		return rowData;
	}
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
}

function buildReservationTableInternal(parent, reservations) {

	var nop = function(event){ event.preventDefault(); };

	var headers = ['From', 'Until', 'Testbed Prefix(es)', 'Nodes'];
	var model = reservations;
	var rowProducer = function(reservation) {
		
		var rand = Math.floor(Math.random() * 100000);
		var rowData = [];
		
		rowData.push($('<a href="#" rel="tooltip" title="'+reservation.from.toISOString()+'">' + reservation.from.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop));
		rowData.push($('<a href="#" rel="tooltip" title="'+reservation.to.toISOString()+'">' + reservation.to.format("YYYY-MM-DD HH:mm:ss") + '</a>').tooltip('show').click(nop));
		rowData.push(reservation.nodeUrnPrefixes.join("<br/>"));
		rowData.push($(
			  '<div>'
			+ '	<a href="javascript:;" data-target="#wisegui-personal-reservation-nodes-'+rand+'-'+i+'" data-toggle="collapse">'+reservation.nodeUrns.length+' nodes</a>'
			+ ' <div class="collapse" id="wisegui-personal-reservation-nodes-'+rand+'-'+i+'">'+reservation.nodeUrns.join("<br/>")+'</div>'
			+ '</div>'
		));

		return rowData;
	}
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
}

function buildReservationTable(parent) {
	
	var pills = $(
			'<div class="tabbable">'
		  + '	<ul class="nav nav-pills">'
		  + '		<li class="active"><a href="#WiseGuiPublicReservationsCurrentFuture">Current and Upcoming</a></li>'
		  + '		<li               ><a href="#WiseGuiPublicReservationsPast">Past</a></li>'
		  + '	</ul>'
		  + '	<div class="tab-content">'
		  + '		<div class="tab-pane active" id="WiseGuiPublicReservationsCurrentFuture"></div>'
		  + '		<div class="tab-pane"        id="WiseGuiPublicReservationsPast"></div>'
		  + '	</div>'
		  + '</div>'
	);

	var currentAndFutureDiv = pills.find('#WiseGuiPublicReservationsCurrentFuture');
	var pastDiv = pills.find('#WiseGuiPublicReservationsPast');

	var loadPublicReservations = function(past) {
		wisebed.reservations.getPublic(
			!past ? moment() : null,
			 past ? moment() : null,
			function(reservations) {
				buildReservationTableInternal(!past ? currentAndFutureDiv : pastDiv, reservations);
			},
			WiseGui.showAjaxError
		);
	}

	pills.find('a[href="#WiseGuiPublicReservationsCurrentFuture"]').click(function(e) {
		e.preventDefault();
		loadPublicReservations(false);
		$(this).tab('show');
	});

	pills.find('a[href="#WiseGuiPublicReservationsPast"]').click(function(e) {
		e.preventDefault();
		loadPublicReservations(true);
		$(this).tab('show');
	});

	loadPublicReservations(false);
	
	parent.empty();
	parent.append(pills);
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
