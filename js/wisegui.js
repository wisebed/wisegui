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
	this.showErrorAlert = function(message) { this.showAlert(message, 'error'); };
	this.showSuccessAlert = function(message) { this.showAlert(message, 'success'); };
	this.showInfoAlert = function(message) { this.showAlert(message, 'info'); };

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
	this.showErrorBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'error'); };
	this.showSuccessBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'success'); };
	this.showInfoBlockAlert = function(message, actions) { this.showBlockAlert(message, actions, 'info'); };

	var self = this;
	this.showAjaxError = function(jqXHR, textStatus, errorThrown) {
		var message = $('<h2>Error while loading data!</h2>'
				+ '<h3>jqXHR</h3>'
				+ '<pre>'+JSON.stringify(jqXHR, null, '  ')+'</pre>'
				+ '<h3>textStatus</h3>'
				+ '<pre>'+textStatus+'</pre>'
				+ '<h3>errorThrown</h3>'
				+ '<pre>'+errorThrown+'</pre>');
		self.showErrorBlockAlert(message);
	};
};

var WiseGuiNavigationViewer = function(navigationData) {

	this.navigationData = navigationData;

	this.view = null;
	this.buildView();
};

WiseGuiNavigationViewer.prototype.buildView = function() {

	this.view = $(
			  '<div class="topbar-wrapper" style="z-index: 5;">'
			+ '	<div class="topbar" data-dropdown="dropdown">'
			+ '		<div class="topbar-inner">'
			+ '			<div class="container">'
			+ '				<ul class="nav"></ul>'
			+ '				<ul class="nav secondary-nav"></ul>'
			+ '			</div>'
			+ '		</div>'
			+ '	</div>'
			+ '</div>'
	);

	var primaryMenu = this.view.find('ul.nav:not(ul.secondary-nav)').first();
	var secondaryMenu = this.view.find('ul.secondary-nav').first();

	if (this.navigationData.nav == 'overview') {

		primaryMenu.append('<li class="active"><a href="#nav=overview">Testbed Overview</a></li>');

	} else if (this.navigationData.nav == 'testbed') {

		primaryMenu.append('<li><a href="#nav=overview">Back</a></li>');
		secondaryMenu.append('<li><a href="#" class="reservationsMenuEntry">Reservations</a></li>');

		this.view.find('.reservationsMenuEntry').bind(
				'click',
				this.navigationData.testbedId,
				function(e) { showReservationsDialog(e.data); }
		);

		var loginDialog = getLoginDialog(this.navigationData.testbedId);

		if (loginDialog.isLoggedIn()) {

			var experimentDropDown = new WiseGuiExperimentDropDown(this.navigationData.testbedId);
			primaryMenu.append(experimentDropDown.view);

			secondaryMenu.append('<li><a href="javascript:;" id="WisebedLogoutButton-'+this.navigationData.testbedId+'">Logout</a></li>');

			$('#WisebedLogoutButton-'+this.navigationData.testbedId+':first').bind(
					'click',
					this.navigationData.testbedId,
					function(e) {
						loginDialog.doLogout();
						delete loginDialogs[e.data];
						$(window).trigger('hashchange');
					}
			)

		} else {
			secondaryMenu.append('<li><a href="javascript:;" id="WisebedLoginButton-'+this.navigationData.testbedId+'">Login</a></li>');
			$('#WisebedLoginButton-'+this.navigationData.testbedId+':first').bind(
					'click',
					this.navigationData.testbedId,
					function(e) { loginDialog.show(); }
			);
		}
	}

	$('.tabs').tabs();
};

/**
 * #################################################################
 * WiseGuiLoginObserver
 * #################################################################
 *
 * Listens to WiseGui events 'wisegui-logged-in' and 'wisegui-logged-out'. The former carries an object
 *
 * {
 *   testbedId : "uzl",
 *   loginData : {
 * 	   authenticationData :
 * 	   [
 *       {
 *         urnPrefix : 'urn:wisebed:uzl1:',
 *         username  : 'bla',
 *         password  : 'blub'
 *       }
 * 	   ]
 *   }
 * }
 */
var WiseGuiLoginObserver = function() {
	this.isObserving = false;
	this.loginData   = {};
	this.schedules   = {};
	this.interval    = 10 * 1000;
};

WiseGuiLoginObserver.prototype.renewLogin = function(testbedId) {
	console.log('TODO should renew login for ' + testbedId);
};

WiseGuiLoginObserver.prototype.onLoggedInEvent = function(data) {

	console.log('LoginObserver received login event: ' + JSON.stringify(data));
	var self = this;
	this.loginData[data.testbedId] = data.loginData;
	this.schedules[data.testbedId] = window.setInterval(
			function() { self.renewLogin(data.testbedId); },
			self.interval
	);
};

WiseGuiLoginObserver.prototype.onLoggedOutEvent = function(data) {

	console.log('LoginObserver received logout event: ' + JSON.stringify(data));
	if (this.schedules[data.testbedId]) {
		window.clearInterval(this.schedules[data.testbedId]);
		delete this.schedules[data.testbedId];
	}
};

WiseGuiLoginObserver.prototype.startObserving = function() {

	console.log('LoginObserver starts observing');
	this.isObserving = true;

	var self = this;
	$(window).bind('wisegui-logged-in', function(e, data) { self.onLoggedInEvent(data); });
	$(window).bind('wisegui-logged-out', function(e, data) { self.onLoggedOutEvent(data); });
};

WiseGuiLoginObserver.prototype.stopObserving = function() {

	console.log('LoginObserver stops observing');
	this.isObserving = false;

	$(this.schedules, function(testbedId, schedule) {
		window.clearInterval(schedule);
	});
	this.schedules = {};
};

/**
 * #################################################################
 * WiseGuiLoginDialog
 * #################################################################
 */
var WiseGuiLoginDialog = function(testbedId) {

	this.testbedId = testbedId;
	this.loginFormRows = {};
	this.loginData = { authenticationData : [] };

	this.view = $('<div id="WisebedLoginDialog-'+this.testbedId+'" class="modal hide"></div>');

	var self = this;
	Wisebed.getTestbeds(function(testbeds){self.buildView(testbeds)}, WiseGui.showAjaxError);
};

WiseGuiLoginDialog.prototype.doLogin = function() {
	var self = this;
	$.ajax({
		url			: "/rest/2.3/" + this.testbedId + "/login",
		type		: "POST",
		data		: JSON.stringify(this.loginData, null, '  '),
		contentType	: "application/json; charset=utf-8",
		dataType	: "json",
		error		: WiseGui.showAjaxError,
		success		: function() {
			self.hide();
			$(window).trigger('wisegui-logged-in', {testbedId : self.testbedId, loginData : self.loginData});
			$(window).trigger('hashchange');
		}
	});
};

WiseGuiLoginDialog.prototype.isLoggedIn = function() {
	return Wisebed.hasSecretAuthenticationKeyCookie(this.testbedId);
};

WiseGuiLoginDialog.prototype.doLogout = function() {
	Wisebed.deleteSecretAuthenticationKeyCookie(this.testbedId);
	$(window).trigger('wisegui-logged-out', {testbedId : this.testbedId});
};

WiseGuiLoginDialog.prototype.hide = function() {
	this.view.hide();
	this.view.remove();
};

WiseGuiLoginDialog.prototype.show = function() {
	$(document.body).append(this.view);
	this.view.show();
};

WiseGuiLoginDialog.prototype.updateLoginDataFromForm = function() {

	for (var i=0; i<this.loginFormRows[this.testbedId].length; i++) {

		this.loginData.authenticationData[i] = {
			urnPrefix : this.loginFormRows[this.testbedId][i].inputUrnPrefix.value,
			username  : this.loginFormRows[this.testbedId][i].inputUsername.value,
			password  : this.loginFormRows[this.testbedId][i].inputPassword.value
		};
	}
};

WiseGuiLoginDialog.prototype.addRowToLoginForm = function(tbody, urnPrefix, username, password) {

	var tr = $('<tr/>');

	if (!this.loginFormRows[this.testbedId]) {this.loginFormRows[this.testbedId] = [];}

	var i = this.loginFormRows[this.testbedId].length;

	var inputUrnPrefix = $('<input type="text" id="urnprefix'+i+'" name="urnprefix'+i+'" value="'+urnPrefix+'" readonly/>');
	var inputUsername = $('<input type="text" id="username'+i+'" name="username'+i+'" value="'+username+'"/>');
	var inputPassword = $('<input type="password" id="password'+i+'" name="password'+i+'" value="'+password+'"/>');

	this.loginFormRows[this.testbedId][this.loginFormRows[this.testbedId].length] = {
		"tr" : tr,
		"inputUrnPrefix" : inputUrnPrefix[0],
		"inputUsername" : inputUsername[0],
		"inputPassword" : inputPassword[0]
	};

	var tdUrnPrefix = $('<td/>');
	var tdUsername = $('<td/>');
	var tdPassword = $('<td/>');

	tdUrnPrefix.append(inputUrnPrefix);
	tdUsername.append(inputUsername);
	tdPassword.append(inputPassword);

	tr.append($('<td>'+(this.loginFormRows[this.testbedId].length)+'</td>'));
	tr.append(tdUrnPrefix);
	tr.append(tdUsername);
	tr.append(tdPassword);

	tbody.append(tr);
};

WiseGuiLoginDialog.prototype.buildView = function(testbeds) {

	var dialogHeader = $('<div class="modal-header"><h3>Login to Testbed ' + this.testbedId + '</h3></div>');

	var dialogBody = $('<div class="modal-body WiseGuiLoginDialog"/>'
			+ '		<form id="WisebedLoginDialogForm-'+this.testbedId+'">'
			+ '		<table id="WisebedLoginDialogFormTable-'+this.testbedId+'">'
			+ '			<thead>'
			+ '				<tr>'
			+ '					<th>Testbed</th>'
			+ '					<th>URN Prefix</th>'
			+ '					<th>Username</th>'
			+ '					<th>Password</th>'
			+ '				</tr>'
			+ '			</thead>'
			+ '			<tbody>'
			+ '			</tbody>'
			+ '		</table>'
			+ '		</form>'
			+ '	</div>');

	var cancelButton = $('<a class="btn secondary">Cancel</a>');
	var okButton = $('<a class="btn primary">OK</a>');

	cancelButton.bind('click', this, function(e) {
		e.data.hide();
	});

	okButton.bind('click', this, function(e) {
		e.data.updateLoginDataFromForm();
		e.data.doLogin();
	});

	var dialogFooter = $('<div class="modal-footer"/>');
	dialogFooter.append(cancelButton, okButton);
	this.view.append(dialogHeader, dialogBody, dialogFooter);

	var loginFormTableBody = this.view.find('#WisebedLoginDialogFormTable-'+this.testbedId+' tbody');
	var urnPrefixes = testbeds.testbedMap[this.testbedId].urnPrefixes;

	for (var i=0; i<urnPrefixes.length; i++) {
		this.addRowToLoginForm(loginFormTableBody, urnPrefixes[i], "", "");
	}
};

/**
 * #################################################################
 * WiseGuiNodeTable
 * #################################################################
 */
var WiseGuiNodeTable = function (wiseML, parent, showCheckboxes, showFilter) {
	this.checkboxes = [];
	this.wiseML = wiseML;
	this.showCheckboxes = showCheckboxes;
	this.lastWorkingFilterExpr = null;

	this.html = $("<div></div>");
	parent.append(this.html);
	this.filter = null;
	this.table = null;

	if(showFilter) this.generateHeader();
	this.generateTable(null);
};

WiseGuiNodeTable.prototype.generateHeader = function (f) {
	that = this;

	// Filter
	this.filter = $("<p></p>");

	filter_input = $('<input type"text" style="width:100%;padding-left:0px;padding-right:0px;">');
	// Key up event if enter is pressed
	filter_input.keyup(function(event) {
		if (event.keyCode == 13) {
			that.generateTable(filter_input.val());
		}
	});

	this.filter.append(filter_input);
	this.html.append(this.filter);
}

h = 0;
WiseGuiNodeTable.prototype.generateTable = function (f) {

	// TODO: use buildTable(...)

	var that = this;
	var nodes = this.wiseML.setup.node;

	if(f != null && f.length > 0) {
		// Filter
		var errorOccured = false;
		nodes = $(nodes).filter(function(index) {
			e = this;
			ret = true;
			try {
				ret = eval(f);
			} catch (ex) {
				errorOccured = true;
				ret = null;
			}

			if(typeof(ret) != "boolean") {
				if(that.lastWorkingFilterExpr != null) {
					ret = eval(that.lastWorkingFilterExpr);
				} else {
					return true;
				}
			}

			return ret;
		});
		if(errorOccured) {
			//alert("Filter expression not valid.");
			return;
		} else {
			this.lastWorkingFilterExpr = f;
		}
	}

	if(this.table != null) {
		this.table.remove();
	}

	this.table = $('<table class="bordered-table zebra-striped"></table>');

	// Generate table header
	var thead = $('<thead></thead>');
	var thead_tr = $('<tr></tr>');
	if(this.showCheckboxes) {
		var thead_th_checkbox = $('<th class="header"></th>');
		var thead_th_checkbox_checkbox = $('<input type="checkbox"/>');

		thead_th_checkbox_checkbox.click(function() {
			var checked = $(this).is(':checked');
			if(that.table != null) {
				var inputs = that.table.find("input");
				inputs.each(function() {
					$(this).attr('checked', checked);
				});
			}
		});
		thead_th_checkbox.append(thead_th_checkbox_checkbox);

		thead_tr.append(thead_th_checkbox);
	}

	var thead_th_node_urn = $('<th class="header">Node URN</th>');
	var thead_th_type = $('<th class="header">Type</th>');
	var thead_th_position = $('<th class="header">Position</th>');
	var thead_th_sensors = $('<th class="header">Sensors</th>');
	thead_tr.append(thead_th_node_urn);
	thead_tr.append(thead_th_type);
	thead_tr.append(thead_th_position);
	thead_tr.append(thead_th_sensors);
	thead.append(thead_tr);
	this.table.append(thead);

	// Generate table body
	var tbody = $('<tbody></tbody>');
	this.table.append(tbody);

	// Iterate all nodes and add the to the table
	this.checkboxes = [];
	for(i = 0; i < nodes.length; i++) {
		var n = nodes[i];

		var cap = [];
		for(j = 0; j < n.capability.length; j++) {
			parts = explode(":", n.capability[j].name);
			cap[j] = parts[parts.length-1];
		}

		if(this.showCheckboxes) {
			var checkbox = $('<input type="checkbox" name="' + n.id + '"/>');
			this.checkboxes[i] = checkbox;
			var td_checkbox = $('<td></td>');
			td_checkbox.append(checkbox);
		}

		var td_id = $('<td>' + n.id + '</td>')
		var td_type = $('<td>' + n.nodeType + '</td>')
		var td_position = $('<td>(' + n.position.x + ',' + n.position.x + ',' + n.position.x + ')</td>')
		var td_sensors = $('<td>' + implode(",", cap) + '</td>')

		var tr = $("<tr></tr>");
		tr.append(td_checkbox);
		tr.append(td_id);
		tr.append(td_type);
		tr.append(td_position);
		tr.append(td_sensors);

		tbody.append(tr);
	}

	this.html.append(this.table);

	if(this.showCheckboxes) {
		$(this.table).tablesorter({headers:{0:{sorter:false}}});
	} else {
		$(this.table).tablesorter();
	}
};

WiseGuiNodeTable.prototype.getSelectedNodes = function () {
	var selected = [];
	if(this.table != null) {
		this.table.find("input:checked").each(function() {
			var name = $(this).attr('name');

			// Ignore the checkbox from the header, which doesn't have any name
			if(typeof(name) != "undefined") {
				selected.push(name);
			}
		});
	}
	return selected;
};

/**
 * #################################################################
 * WiseGuiReservationObserver
 * #################################################################
 */

var WiseGuiReservationObserver = function() {
	this.lastKnownReservations = {};
	this.isObserving           = false;
	this.schedules             = {};
};

WiseGuiReservationObserver.prototype.fetchReservationsAndProcess = function(testbedId) {
	var self = this;
	Wisebed.reservations.getPersonal(
			testbedId,
			null,
			null,
			function(reservations) {self.processReservationsFetched(testbedId, reservations.reservations)},
			null
	);
};

WiseGuiReservationObserver.prototype.processReservationsFetched = function(testbedId, reservations) {

	var newReservations = [];

	for (var i=0; i<reservations.length; i++) {

		var knownReservation = false;

		if (!this.lastKnownReservations[testbedId]) {
			this.lastKnownReservations[testbedId] = [];
		}

		for (var j=0; j<this.lastKnownReservations[testbedId].length; j++) {
			if (Wisebed.reservations.equals(reservations[i], this.lastKnownReservations[testbedId][j])) {
				knownReservation = true;
				break;
			}
		}

		if (!knownReservation) {
			newReservations.push(reservations[i]);
		}
	}

	if (newReservations.length > 0) {
		$(window).trigger('wisegui-reservations-changed-'+testbedId, {reservations:reservations});
	}

	for (var k=0; k<newReservations.length; k++) {

		$(window).trigger('wisegui-reservation-added-'+testbedId, newReservations[k]);

		// schedule events for reservation started and ended in order to e.g. display user notifications
		var nowInMillis = new Date().valueOf();
		if (nowInMillis < newReservations[k].from) {

			var triggerReservationStarted = (function(reservation) {
				return function() {$(window).trigger('wisegui-reservation-started-'+testbedId, reservation);}
			})(newReservations[k]);

			setTimeout(triggerReservationStarted, (newReservations[k].from - nowInMillis));
		}

		if (nowInMillis < newReservations[k].to) {

			var triggerReservationEnded = (function(reservation) {
				return function() {$(window).trigger('wisegui-reservation-ended-'+testbedId, reservation);}
			})(newReservations[k]);

			setTimeout(triggerReservationEnded, (newReservations[k].to - nowInMillis));
		}

		this.lastKnownReservations[testbedId].push(newReservations[k]);
	}
};

WiseGuiReservationObserver.prototype.startObserving = function() {

	this.isObserving = true;

	var self = this;

	$(window).bind('wisegui-logged-in', function(e, data) {
		self.startObservationOf(data.testbedId);
		console.log('WiseGuiReservationObserver beginning to observe reservations for testbedId "'+data.testbedId+'"');
	});

	$(window).bind('wisegui-logged-out', function(e, data) {
		self.stopObservationOf(data.testbedId);
		console.log('WiseGuiReservationObserver stopped to observe reservations for testbedId "'+data.testbedId+'"');
	});

	console.log('WiseGuiReservationObserver started observing');
};

WiseGuiReservationObserver.prototype.stopObserving = function() {

	this.isObserving = false;

	var self = this;
	$.each(this.schedules, function(testbedId, schedule) { self.stopObservationOf(testbedId) });

	console.log('WiseGuiReservationObserver stopped observing');
};
WiseGuiReservationObserver.prototype.startObservationOf = function(testbedId) {
	var self = this;
	this.schedules[testbedId] = window.setInterval(function() {self.fetchReservationsAndProcess(testbedId)}, 60 * 1000);
	this.fetchReservationsAndProcess(testbedId);
};

WiseGuiReservationObserver.prototype.stopObservationOf = function(testbedId) {
	window.clearInterval(this.schedules[testbedId]);
	delete this.schedules[testbedId];
};

/**
 * #################################################################
 * WiseGuiNotificationsViewer
 * #################################################################
 *
 * Consumes wisegui events of type 'wisegui-notification' and displays them in a notification area.
 * A 'wisegui-notification' event has to carry data of the following type:
 *
 * {
 *  type     : "alert"|"block-alert"
 *  severity : "warning"|"error"|"success"|"info"
 *  message  : "Oh snap! Change this and that and try again."
 *  actions  : an array of buttons (only for block-alerts)
 * }
 *
 */

var WiseGuiNotificationsViewer = function() {

	this.view = null;
	this.buildView();

	var self = this;
	$(window).bind('wisegui-notification', function(e, data) {
		self.showNotification(data);
	});
};

WiseGuiNotificationsViewer.prototype.showNotification = function(notification) {
	if (notification.type == 'alert') {
		this.showAlert(notification);
	} else if (notification.type == 'block-alert') {
		this.showBlockAlert(notification);
	}
};

WiseGuiNotificationsViewer.prototype.showAlert = function(alert) {
	var alertDiv = $('<div class="alert-message '+alert.severity+'">'
			+ '<a class="close" href="#">&times;</a>'
			+ '<p>'+alert.message+'</p>'
			+ '</div>');
	this.view.append(alertDiv);
	alertDiv.alert();
};

WiseGuiNotificationsViewer.prototype.showBlockAlert = function(alert) {
	var blockAlertDiv = $('<div class="alert-message block-message '+alert.severity+'">'
			+ '	<a class="close" href="#">&times;</a>'
			+ '	<p></p>'
			+ '	<div class="alert-actions">'
			+ '	</div>'
			+ '</div>');
	if (alert.message instanceof Array) {
		for (var i=0; i<alert.message.length; i++) {
			blockAlertDiv.find('p').append(alert.message[i]);
		}
	} else {
		blockAlertDiv.find('p').append(alert.message);
	}
	var actionsDiv = blockAlertDiv.find('.alert-actions');
	if (alert.actions) {
		for (var i=0; i<alert.actions.length; i++) {
			actionsDiv.append(alert.actions[i]);
			actionsDiv.append(' ');
		}
	}
	this.view.append(blockAlertDiv);
	blockAlertDiv.alert();
};

WiseGuiNotificationsViewer.prototype.buildView = function() {
	this.view = $('<div id="WiseGuiNotificationsDiv"></div>');
};

/**
 * #################################################################
 * WiseGuiExperimentDropDown
 * #################################################################
 *
 * Consumes wisegui events of type 'wisegui-reservation-ended', 'wisegui-reservation-started', 'wisegui-reservation-added'.
 *
 */

var WiseGuiExperimentDropDown = function(testbedId) {

	this.testbedId = testbedId;
	this.view = null;

	var self = this;
	$(window).bind('wisegui-reservations-changed-'+testbedId, function(e, reservations) {
		self.onReservationsChangedEvent(reservations.reservations)
	});
	$(window).bind('wisegui-navigation-event', function(e, navigationData) {
		if (navigationData.testbedId = self.testbedId) {
			self.update();
		}
	});

	this.buildView();
};

WiseGuiExperimentDropDown.prototype.update = function() {
	var self = this;
	Wisebed.reservations.getPersonal(this.testbedId, null, null, function(reservations) {
		self.onReservationsChangedEvent(reservations);
	});
};

WiseGuiExperimentDropDown.prototype.onReservationsChangedEvent = function(reservations) {

		console.log(reservations);

		this.view.find('.dropdown-menu li').remove();

		for (var i=0; i<reservations.length; i++) {

			var reservation = reservations[i];
			var fromStr = $.format.date(new Date(reservation.from), "yyyy-MM-dd HH:mm");
			var toStr = $.format.date(new Date(reservation.to), "yyyy-MM-dd HH:mm");

			var li = $('<li><a href="#">' + fromStr + ' - ' + toStr + ' | ' + reservation.userData + '</a></li>');
			var self = this;
			li.find('a').bind('click', reservation, function(e) {
				e.preventDefault();
				navigateToExperiment(self.testbedId, e.data);
			});

			this.view.find('.dropdown-menu').append(li);
		}
};

WiseGuiExperimentDropDown.prototype.buildView = function() {
	this.view = $('<li class="dropdown">'
			+ '	<a href="#" class="dropdown-toggle">Experiments</a>'
			+ '	<ul class="dropdown-menu">' 
			+ '	</ul>'
			+ '</li>');
};

/**
 * #################################################################
 * WiseGuiNodeSelectionDialog
 * #################################################################
 */

var WiseGuiNodeSelectionDialog = function(testbedId, experimentId, headerHtml, bodyHtml) {

	this.testbedId = testbedId;
	this.experimentId = experimentId;
	this.table = null;

	this.dialogDivId = 'WiseGuiNodeSelectionDialog-' + Math.random();

	this.dialogDiv = $('<div id="'+this.dialogDivId+'" class="modal hide WiseGuiNodeSelectionDialog">'
			+ '	<div class="modal-header">'
			+ '		<h3>' + headerHtml + '</h3>'
			+ '	</div>'
			+ '	<div class="modal-body">'
			+ '		<p>' + bodyHtml + '</p>'
			+ '		<img class="ajax-loader" src="img/ajax-loader-big.gif" width="32" height="32"/>'
			+ '	</div>'
			+ ' <div class="modal-footer">'
			+ '		<a class="btn secondary">Cancel</a>'
			+ '		<a class="btn primary">OK</a>'
			+ '	</div>'
			+ '</div>');
};

WiseGuiNodeSelectionDialog.prototype.show = function(callbackOK, callbackCancel) {

	$(document.body).append(this.dialogDiv);
	var self = this;

	function showDialogInternal(wiseML) {

		self.dialogDiv.show();

		self.dialogDiv.find('.ajax-loader').attr('hidden', 'true');
		self.table = new WiseGuiNodeTable(wiseML, self.dialogDiv.find('.modal-body').first(), true);

		self.dialogDiv.find('.modal-footer .secondary').first().bind(
				'click',
				{dialog : self},
				function(event) {
					event.data.dialog.dialogDiv.hide();
					event.data.dialog.dialogDiv.remove();
					if (callbackCancel) {
						callbackCancel();
					}
				}
		);

		self.dialogDiv.find('.modal-footer .primary').first().bind(
				'click',
				self,
				function(event) {
					event.data.dialogDiv.hide();
					event.data.dialogDiv.remove();
					callbackOK(event.data.table.getSelectedNodes());
				}
		);
	}

	Wisebed.getWiseMLAsJSON(this.testbedId, this.experimentId, showDialogInternal,
			function(jqXHR, textStatus, errorThrown) {
				console.log('TODO handle error in WiseGuiNodeSelectionDialog');
			}
	);
};


var WiseGuiTestbedsView = function(testbeds) {

	this.testbeds = testbeds;
	this.view = $('<table class="WisebedOverviewTable zebra-striped">'
			+ '	<thead>'
			+ '		<tr>'
			+ '			<td>Name</td>'
			+ '			<td>URN prefixes</td>'
			+ '			<td>Session Management Endpoint URL</td>'
			+ '		</tr>'
			+ '	</thead>'
			+ '	<tbody>'
			+ '	</tbody>'
			+ '</table>');
	this.buildView();
};

WiseGuiTestbedsView.prototype.buildView = function() {
	var self = this;
	$.each(testbeds.testbedMap, function(key, value) {
		var tr = $('<tr/>');
		var tdName = $('<td><a href="#nav=testbed&testbedId='+key+'">'+value.name+'</a></td>');
		var tdUrnPrefixes = $('<td>'+value.urnPrefixes+'</td>');
		var tdSessionManagementEndpointUrl = $('<td>'+value.sessionManagementEndpointUrl+'</td>');
		tr.append(tdName, tdUrnPrefixes, tdSessionManagementEndpointUrl);
		self.view.find('tbody').append(tr);
	});
};

/**
 * #################################################################
 * WiseGuiExperimentationView
 * #################################################################
 */

var WiseGuiExperimentationView = function(testbedId, experimentId) {

	this.testbedId = testbedId;
	this.experimentId = experimentId;

	this.experimentationDivId    = 'WisebedExperimentationDiv-'+testbedId+'-'+experimentId;
	this.tabsControlsDivId       = this.experimentationDivId+'-tabs-controls';
	this.tabsOutputsDivId        = this.experimentationDivId+'-tabs-outputs';
	this.outputsDivId            = this.experimentationDivId+'-outputs';
	this.notificationsDivId      = this.experimentationDivId+'-notifications';
	this.outputsTextAreaId       = this.experimentationDivId+'-outputs-textarea';
	this.notificationsTextAreaId = this.experimentationDivId+'-notifications-textarea';
	this.sendDivId               = this.experimentationDivId+'-send';
	this.flashDivId              = this.experimentationDivId+'-flash';
	this.resetDivId              = this.experimentationDivId+'-reset';
	this.scriptingDivId          = this.experimentationDivId+'-scripting';

	this.view = $('<div id="'+this.experimentationDivId+'"/>');

	this.flashSelectedNodeUrns = null;
	this.resetSelectedNodeUrns = null;
	this.socket = null;

	this.buildView();
	this.connectToExperiment();
};

WiseGuiExperimentationView.prototype.onWebSocketMessageEvent = function(event) {

	var message = JSON.parse(event.data);

	if (!message.type) {
		console.log('Received message with unknown content: ' + event.data);
		return;
	}

	if (message.type == 'upstream') {

		this.outputsTextArea.append(
				message.timestamp           + " | " +
				message.sourceNodeUrn       + " | " +
				atob(message.payloadBase64) + '\n'
		);

		this.outputsTextArea.scrollTop(this.outputsTextArea[0].scrollHeight);

	} else if (message.type == 'notification') {

		this.notificationsTextArea.append(
				message.timestamp + " | " +
				message.message   + '\n'
		);
	}
};

WiseGuiExperimentationView.prototype.onWebSocketOpen = function(event) {

	this.outputsTextArea.attr('disabled', false);
	this.notificationsTextArea.attr('disabled', false);
};

WiseGuiExperimentationView.prototype.onWebSocketClose = function(event) {

	this.outputsTextArea.attr('disabled', true);
	this.notificationsTextArea.attr('disabled', true);
};

WiseGuiExperimentationView.prototype.connectToExperiment = function() {

	if (!window.WebSocket) {
		window.WebSocket = window.MozWebSocket;
	}

	if (window.WebSocket) {

		var self = this;

		this.socket = new WebSocket('ws://localhost:8880/ws/experiments/'+this.experimentId);
		this.socket.onmessage = function(event) {self.onWebSocketMessageEvent(event)};
		this.socket.onopen = function(event) {self.onWebSocketOpen(event)};
		this.socket.onclose = function(event) {self.onWebSocketClose(event)};

	} else {
		alert("Your browser does not support Web Sockets.");
	}

	/*function send(message) {
		if (!window.WebSocket) { return; }
		if (socket.readyState == WebSocket.OPEN) {
			socket.send(message);
		} else {
			alert("The socket is not open.");
		}
	}

	sendMessagesDiv.find('form').first().submit(function(event){
		var message = {
			targetNodeUrn : event.target.elements.nodeUrn.value,
			payloadBase64 : btoa(event.target.elements.message.value)
		};
		socket.send(JSON.stringify(message));
	});*/

};

WiseGuiExperimentationView.prototype.showFlashNodeSelectionDialog = function() {

	this.setFlashSelectNodesButtonDisabled(true);
	var self = this;
	Wisebed.getWiseMLAsJSON(
			this.testbedId,
			this.experimentId,
			function(wiseML) {

				self.setFlashSelectNodesButtonDisabled(false);

				var selectionDialog = new WiseGuiNodeSelectionDialog(
						self.testbedId,
						self.experimentId,
						'Flash Nodes',
						'Please select the nodes you want to flash.'
				);

				selectionDialog.show(function(selectedNodeUrns) { self.updateFlashSelectNodeUrns(selectedNodeUrns); });

			}, function(jqXHR, textStatus, errorThrown) {
				self.setFlashSelectNodesButtonDisabled(false);
				self.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

WiseGuiExperimentationView.prototype.updateFlashSelectNodeUrns = function(selectedNodeUrns) {
	this.flashSelectedNodeUrns = selectedNodeUrns;
	if (selectedNodeUrns.length > 0) {
		this.setFlashButtonDisabled(false);
	}
	var selectNodeUrnsDiv = this.view.find('#'+this.flashDivId+' .selectedNodeUrnsDiv').first();
	selectNodeUrnsDiv.empty();
	selectNodeUrnsDiv.append(selectedNodeUrns.join(","));
};

WiseGuiExperimentationView.prototype.setFlashSelectNodesButtonDisabled = function(disabled) {
	this.view.find('#'+this.flashDivId + ' button.selectNodeUrns').first().attr('disabled', disabled);
};

WiseGuiExperimentationView.prototype.setFlashButtonDisabled = function(disabled) {
	this.view.find('#'+this.flashDivId + ' button.flashNodeUrns').first().attr('disabled', disabled);
};

WiseGuiExperimentationView.prototype.executeFlashNodes = function() {

	this.setFlashButtonDisabled(true);
	var self = this;
	Wisebed.experiments.flashNodes(
			this.testbedId,
			this.experimentId,
			this.flashSelectedNodeUrns,
			function(result) {
				self.setFlashButtonDisabled(false);
				WiseGui.showInfoAlert(JSON.stringify(result, null, '  '));
			},
			function(jqXHR, textStatus, errorThrown) {
				self.setResetButtonDisabled(false);
				alert('TODO handle error in WiseGuiExperimentationView');
			}
	);
};

/**********************************************************************************************************************/

WiseGuiExperimentationView.prototype.updateResetSelectNodeUrns = function(selectedNodeUrns) {
	this.resetSelectedNodeUrns = selectedNodeUrns;
	if (selectedNodeUrns.length > 0) {
		this.setResetButtonDisabled(false);
	}
	var selectNodeUrnsDiv = this.view.find('#'+this.resetDivId+' .selectedNodeUrnsDiv').first();
	selectNodeUrnsDiv.empty();
	selectNodeUrnsDiv.append(selectedNodeUrns.join(","));
};

WiseGuiExperimentationView.prototype.showResetNodeSelectionDialog = function() {

	this.setResetSelectNodesButtonDisabled(true);
	var self = this;
	Wisebed.getWiseMLAsJSON(
			this.testbedId,
			this.experimentId,
			function(wiseML) {

				self.setResetSelectNodesButtonDisabled(false);

				var selectionDialog = new WiseGuiNodeSelectionDialog(
						self.testbedId,
						self.experimentId,
						'Reset Nodes',
						'Please select the nodes you want to reset.'
				);

				selectionDialog.show(function(selectedNodeUrns) { self.updateResetSelectNodeUrns(selectedNodeUrns); });

			}, function(jqXHR, textStatus, errorThrown) {
				self.setResetSelectNodesButtonDisabled(false);
				self.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

WiseGuiExperimentationView.prototype.setResetSelectNodesButtonDisabled = function(disabled) {
	this.view.find('#'+this.resetDivId + ' button.selectNodeUrns').first().attr('disabled', disabled);
};

WiseGuiExperimentationView.prototype.setResetButtonDisabled = function(disabled) {
	this.view.find('#'+this.resetDivId + ' button.resetNodeUrns').first().attr('disabled', disabled);
};

WiseGuiExperimentationView.prototype.executeResetNodes = function() {

	this.setResetButtonDisabled(true);
	var self = this;
	Wisebed.experiments.resetNodes(
			this.testbedId,
			this.experimentId,
			this.resetSelectedNodeUrns,
			function(result) {
				self.setResetButtonDisabled(false);
			},
			function(jqXHR, textStatus, errorThrown) {
				self.setResetButtonDisabled(false);
				alert('TODO handle error in WiseGuiExperimentationView');
			}
	);
};

WiseGuiExperimentationView.prototype.buildView = function() {

	var controlsTabsDiv = $('<div id="'+this.tabsControlsDivId+'">'
			+ '	<ul class="tabs">'
			+ '		<li class="active"><a href="#'+this.sendDivId+'">Send Message</a></li>'
			+ '		<li><a href="#'+this.flashDivId+'">Flash</a></li>'
			+ '		<li><a href="#'+this.resetDivId+'">Reset</a></li>'
			+ '		<li><a href="#'+this.scriptingDivId+'">Scripting</a></li>'
			+ '	</ul>'
			+ '	<div class="tab-content">'
			+ '		<div class="active tab-pane" id="'+this.sendDivId+'"></div>'
			+ '		<div class="tab-pane" id="'+this.flashDivId+'">'
			+ '			<div class="well" style="padding: 14px 19px;">' 
			+ '				<form id="flashForm" name="flashForm">' 
			+ '					<div class="row" style="border: 1px solid #dddddd;">'
			+ '						<div class="span10">'
			+ '							<button class="btn span1 addSet"> + </button>'
			+ '							<button class="btn span1 removeSet"> - </button>'
			+ '							<button class="btn span3 loadConfiguration">Load</button>'
			+ '							<button class="btn span3 saveConfiguration">Save</button>'
			+ '						</div>'
			+ '						<div class="pull-right span5">'
			+ '							<button class="btn primary flashNodes span3 offset3">Flash</button>'
			+ '						</div>'
			+ '					</div>'
			+ '					<div class="row">'
		+ '							<table class="zebra-striped">'
		+ '								<thead>'
		+ '									<tr>'
		+ '										<th class="span1">Set</th>'
		+ '										<th class="span4">Node URNs</th>'
		+ '										<th class="span5">Image File</th>'
		+ '										<th class="span6">Flashing Progress</th>'
		+ '									</tr>'
		+ '								</thead>'
		+ '								<tbody>'
		+ '									<tr>'
		+ '										<td>1</td>'
		+ '										<td><button class="btn span3 selectNodeUrns">Select</button></td>'
		+ '										<td><input type="file" id="image" name="image"/></td>'
		+ '										<td id="progressBarTd"></td>'
		+ '									</tr>'
		+ '								</tbody>'
		+ '							</table>'
			+ '					</div>'
			+ '				</form>'
			+ '			</div>'
			+ '		</div>'
			+ '		<div class="tab-pane" id="'+this.resetDivId+'">'
			+ '			<div class="well" style="padding: 14px 19px;">'
			+ '				<button class="btn selectNodeUrns span4">Select Nodes</button> <button class="btn primary resetNodeUrns span4" disabled>Reset Nodes</button>'
			+ '				<h4>Selected Nodes:</h4> <div class="selectedNodeUrnsDiv" style="overflow:auto;"></div>'
			+ '			</div>'
			+ '		</div>'
			+ '		<div class="tab-pane" id="'+this.scriptingDivId+'"></div>'
			+ '	</div>'
			+ '</div>');

	var outputsTabsDiv = $('<div id="'+this.tabsOutputsDivId+'">'
			+ '	<ul class="tabs">'
			+ '		<li class="active"><a href="#'+this.outputsDivId+'">Node Outputs</a></li>'
			+ '		<li><a href="#'+this.notificationsDivId+'">Backend Notifications</a></li>'
			+ '	</ul>'
			+ '	<div class="tab-content">'
			+ '		<div class="active tab-pane" id="'+this.outputsDivId+'">'
			+ '			<textarea id="'+this.outputsTextAreaId+'" style="width: 100%; height:300px;" readonly disabled></textarea>'
			+ '		</div>'
			+ '		<div class="tab-pane" id="'+this.notificationsDivId+'">'
			+ '			<textarea id="'+this.notificationsTextAreaId+'" style="width: 100%; height:300px;" readonly disabled></textarea>'
			+ '		</div>'
			+ '	</div>'
			+ '</div>');

	var self = this;

	controlsTabsDiv.find('#'+this.flashDivId + ' button.selectNodeUrns').first().bind(
			'click', self, function(e) {e.data.showFlashNodeSelectionDialog()}
	);

	controlsTabsDiv.find('#'+this.flashDivId + ' button.flashNodeUrns').first().bind(
			'click', self, function(e) {e.data.executeFlashNodes()}
	);

	controlsTabsDiv.find('#'+this.resetDivId + ' button.selectNodeUrns').first().bind(
			'click', self, function(e) {e.data.showResetNodeSelectionDialog()}
	);

	controlsTabsDiv.find('#'+this.resetDivId + ' button.resetNodeUrns').first().bind(
			'click', self, function(e) {e.data.executeResetNodes()}
	);

	var controlsDiv = $('<div class="WiseGuiExperimentationViewControlsDiv"><h2>Controls</h2></div>');
	controlsDiv.append(controlsTabsDiv);

	var outputsDiv = $('<div class="WiseGuiExperimentationViewOutputsDiv"><h2>Live Data</h2></div>');
	outputsDiv.append(outputsTabsDiv);

	this.view.append(outputsDiv, controlsDiv);

	this.outputsTextArea = this.view.find('#'+this.outputsTextAreaId);
	this.notificationsTextArea = this.view.find('#'+this.notificationsTextAreaId);

	/*var sendMessagesDiv = $('<div id="'+sendMessagesDivId+'">'
	 + '	<h3>Send Messages</h3>#'
	 + '	Message must consist of comma-separated bytes in base_10 (no prefix), base_2 (prefix 0b) or base_16 (prefix 0x).<br/>'
	 + '	Example: <code>0x0A,0x1B,0b11001001,40,40,0b11001001,0x1F</code>'
	 + '	<form>'
	 + '		<fieldset>'
	 + '			<select name="nodeUrn" id="nodeUrn" class="span4"></select>'
	 + '			<input type="text" id="message"  name="message" value="" class="span8"/>'
	 + '			<input type="submit" value="Send to Node" class="span4"/>'
	 + '		</fieldset>'
	 + '	</form>'
	 + '</div>');*/
};

function loadTestbedDetailsContainer(navigationData, parentDiv) {

	parentDiv.append($('<h1>Testbed Details '+navigationData.testbedId+'</h1>'));

	var tabs = $('<ul class="tabs">'
			+ '	<li class="active"><a href="#WisebedTestbedDetailsDescription-'+navigationData.testbedId+'">Description</a></li>'
			+ '	<li><a href="#WisebedTestbedDetailsNodes-'+navigationData.testbedId+'">Nodes</a></li>'
			+ '	<li><a href="#WisebedTestbedDetailsReservations-'+navigationData.testbedId+'">Reservations</a></li>'
			+ '	<li><a href="#WisebedTestbedDetailsWiseMLJSON-'+navigationData.testbedId+'">WiseML (JSON)</a></li>'
			+ '	<li><a href="#WisebedTestbedDetailsWiseMLXML-'+navigationData.testbedId+'">WiseML (XML)</a></li>'
			+ '</ul>'
			+ '<div class="tab-content">'
			+ '	<div class="tab-pane active" id="WisebedTestbedDetailsDescription-'+navigationData.testbedId+'"/>'
			+ '	<div class="tab-pane" id="WisebedTestbedDetailsNodes-'+navigationData.testbedId+'"/>'
			+ '	<div class="tab-pane" id="WisebedTestbedDetailsReservations-'+navigationData.testbedId+'"/>'
			+ '	<div class="tab-pane" id="WisebedTestbedDetailsWiseMLJSON-'+navigationData.testbedId+'"/>'
			+ '	<div class="tab-pane" id="WisebedTestbedDetailsWiseMLXML-'+navigationData.testbedId+'"/>'
			+ '</div>');

	parentDiv.append(tabs);

	Wisebed.getWiseMLAsJSON(
			navigationData.testbedId,
			null,
			function(wiseML) {

				var jsonTab = $('#WisebedTestbedDetailsWiseMLJSON-'+navigationData.testbedId);
				jsonTab.append($('<pre>'+JSON.stringify(wiseML, null, '  ')+'</pre>'));

				var descriptionTab = $('#WisebedTestbedDetailsDescription-'+navigationData.testbedId);
				descriptionTab.append(wiseML.setup.description);

				var nodesTab = $('#WisebedTestbedDetailsNodes-'+navigationData.testbedId);
				new WiseGuiNodeTable(wiseML, nodesTab, false, true);
			},
			WiseGui.showAjaxError
	);

	Wisebed.getWiseMLAsXML(
			navigationData.testbedId,
			null,
			function(wiseML) {
				var xmlTab = $('#WisebedTestbedDetailsWiseMLXML-'+navigationData.testbedId);
				xmlTab.append($('<pre lang="xml">'+new XMLSerializer().serializeToString(wiseML).replace(/</g,"&lt;")+'</pre>'));
			},
			WiseGui.showAjaxError
	);

	var now = new Date();
	var tomorrowSameTime = new Date();
	tomorrowSameTime.setDate(now.getDate() + 1);

	Wisebed.reservations.getPublic(
			navigationData.testbedId,
			now,
			tomorrowSameTime,
			function(data) {

				var reservations = data.reservations;
				var reservationsTab = $('#WisebedTestbedDetailsReservations-'+navigationData.testbedId);

				var tableHead = ["From", "Until", "User Data", "Node URNs"];
				var tableRows = [];
				for (var i=0; i<reservations.length; i++) {
					tableRows[i] = [];
					tableRows[i][0] = new Date(reservations[i].from).toString();
					tableRows[i][1] = new Date(reservations[i].to).toString();
					tableRows[i][2] = reservations[i].userData;

					var nodesContainer = $('<div>'
							+ reservations[i].nodeURNs.length + ' nodes.<br/>'
							+ '<a href="#">Show URNs</a>'
							+ '</div>');

					var nodesLink = nodesContainer.find('a');
					nodesLink.first().bind(
							'click',
							{link:nodesLink, container:nodesContainer, reservation:reservations[i]},
							function(e) {
								e.preventDefault();
								e.data.link.remove();
								e.data.container.append(
										e.data.reservation.nodeURNs.join("<br/>")
								);
							}
					);
					tableRows[i][3] = nodesContainer;
				}

				var table = buildTable(tableHead, tableRows);
				reservationsTab.append(table);
				if (tableRows.length > 0) {
					table.tablesorter({ sortList: [[0,0]] });
				}
			},
			WiseGui.showAjaxError
	);
}

function buildTable(tableHead, tableRows) {

	var table = $('<table class="zebra-striped"/>"');
	var thead = $('<thead/>');
	var theadRow = $('<tr/>');
	thead.append(theadRow);

	for (var i=0; i<tableHead.length; i++) {
		theadRow.append('<th>'+tableHead[i]+'</th>');
	}

	var tbody = $('<tbody/>');
	for (var k=0; k<tableRows.length; k++) {
		var row = $('<tr/>');
		tbody.append(row);
		for (var l=0; l<tableRows[k].length; l++) {
			var td = $('<td/>');
			row.append(td);
			td.append(tableRows[k][l]);
		}
	}

	table.append(thead, tbody);

	return table;
}

function assureReservationObserverRunning() {

	var navigationData = getNavigationData();
	if (!reservationObservers[navigationData.testbedId] || !reservationObservers[navigationData.testbedId].isObserving) {

		var reservationObserver = new WiseGuiReservationObserver(navigationData.testbedId);
		reservationObservers[navigationData.testbedId] = reservationObserver;
		reservationObserver.startObserving();
		console.log('Started observing reservations for testbed "'+navigationData.testbedId+'"');
	}
}

function loadExperimentContainer(navigationData, parentDiv) {

	var experimentationView = new WiseGuiExperimentationView(navigationData.testbedId, navigationData.experimentId);
	parentDiv.append(experimentationView.view);
}

function loadTestbedOverviewContainer(navigationData, parentDiv) {

	var testbedsView = new WiseGuiTestbedsView(testbeds);
	parentDiv.append(testbedsView.view);
}

function getNavigationKey(navigationData) {
	if (navigationData.nav == 'overview') {
		return 'overview';
	} else if (navigationData.nav == 'testbed' && navigationData.experimentId == '') {
		return 'testbedId=' + navigationData.testbedId;
	} else if (navigationData.nav == 'testbed' && navigationData.experimentId != '') {
		return 'testbedId=' + navigationData.testbedId + '&experimentId=' + navigationData.experimentId;
	}
	return undefined;
}

function getCreateContentFunction(navigationData) {
	if (navigationData.nav == 'overview') {return loadTestbedOverviewContainer;}
	if (navigationData.nav == 'testbed' && navigationData.experimentId == '') {return loadTestbedDetailsContainer;}
	if (navigationData.nav == 'testbed' && navigationData.experimentId != '') {return loadExperimentContainer;}
	return undefined;
}

function showReservationsDialog(testbedId) {
	alert('TODO reservation dialog for ' + testbedId);
}

function getLoginDialog(testbedId) {
	var loginDialog = loginDialogs[testbedId];
	if (!loginDialog) {
		loginDialog = new WiseGuiLoginDialog(testbedId);
		loginDialogs[testbedId] = loginDialog;
	}
	return loginDialog;
}

function navigateToExperiment(testbedId, reservation) {

	Wisebed.experiments.getUrl(
			testbedId,
			reservation,
			function(experimentUrl){

				var experimentId = experimentUrl.substr(experimentUrl.lastIndexOf('/') + 1);
				var navigationData = getNavigationData();
				navigationData.experimentId = experimentId;
				$.bbq.pushState(navigationData);

			},
			WiseGui.showAjaxError
	);
}

function getNavigationData() {

	return {
		nav          : $.bbq.getState('nav')          || 'overview',
		testbedId    : $.bbq.getState('testbedId')    || '',
		experimentId : $.bbq.getState('experimentId') || ''
	};
}

function switchNavigationContainer(navigationData, navigationKey) {

	$('#WisebedContainer .WiseGuiNavigationContainer').hide();

	if (!navigationContainers[navigationKey]) {
		navigationContainers[navigationKey] = createNavigationContainer(navigationData);
	}

	$(navigationContainers[navigationKey]).show();
}

function createNavigationContainer(navigationData) {

	var containerDivId = 'WiseGuiNavigationContainer-' + (navigationData.testbedId ?
			('testbed-' + navigationData.testbedId) : 'testbeds');
	var container = $('<div class="WiseGuiNavigationContainer" id="'+containerDivId+'"/>');

	container.hide();

	$('#WisebedContainer').append(container);

	var navigationViewer = new WiseGuiNavigationViewer(navigationData);
	container.append(navigationViewer.view);

	return container;
}

function switchContentContainer(navigationData, navigationKey) {

	$('#WisebedContainer .WisebedContentContainer').hide();

	if (!contentContainers[navigationKey]) {
		contentContainers[navigationKey] = createContentContainer(navigationData);
	}

	$(contentContainers[navigationKey]).show();
}

function createContentContainer(navigationData) {

	var containerDivId = 'WisebedContentContainer-' + (navigationData.testbedId ?
			('testbed-' + navigationData.testbedId) : 'testbeds');
	var container = $('<div class="WisebedContentContainer" id="'+containerDivId+'"/>');

	container.hide();

	$('#WisebedContainer').append(container);

	var createContentFunction = getCreateContentFunction(navigationData);
	createContentFunction(navigationData, container);

	$('.tabs').tabs();

	return container;
}

function onHashChange(e) {

	$(window).trigger('wisegui-navigation-event', getNavigationData());

	var navigationData = getNavigationData();
	var navigationKey  = getNavigationKey(navigationData)

	switchNavigationContainer(navigationData, navigationKey);
	switchContentContainer(navigationData, navigationKey);
}

var navigationContainers = {};
var contentContainers    = {};
var loginDialogs         = {};

var loginObserver        = new WiseGuiLoginObserver();
var reservationObserver  = new WiseGuiReservationObserver();
var notificationsViewer  = new WiseGuiNotificationsViewer();

var testbeds             = null;

$(function () {

	$('#WisebedContainer').append(notificationsViewer.view);

	Wisebed.getTestbeds(
			function(testbedsLoaded) {

				testbeds = testbedsLoaded;

				reservationObserver.startObserving();
				loginObserver.startObserving();

				$(window).bind('hashchange', onHashChange);
				$(window).trigger('hashchange');
			},
			WiseGui.showAjaxError
	);
});