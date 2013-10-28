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
 * WiseGuiNodeTable
 * #################################################################
 */

var TableElem = function (data) {
	this.data = data;
	this.row = null;
	this.isVisible = true;
	this.checkbox = null;
};

/**
 * Model: Object[] headers: String[] rowProducer: fun(obj) -> String[]
 * preFilterFun: fun(obj) -> true | false preSelectFun: fun(obj) -> true | false
 * showCheckBoxes: true | false showFilterBox: true | false
 */
var Table = function (model, headers, rowProducer, preFilterFun, preSelectFun, showCheckBoxes, showFilterBox) {

	this.model = model;
	this.headers = headers;
	this.rowProducer = rowProducer;
	this.preFilterFun = preFilterFun;
	this.preSelectFun = preSelectFun;
	this.showCheckBoxes = showCheckBoxes;

	this.html = $("<div></div>");
	this.table = null;
	this.filter = null;
	this.data = [];
	this.selectionListeners = [];
	this.filterListeners = [];

	this.filter_input = null;
	this.input_checkbox_th = null;

	if(showFilterBox) {
		this.lastWorkingFilterExpr = null;
		this.filter_checkbox = null;
		this.generateFilter();
	}

	this.generateTable();

	if(this.preFilterFun) {
		this.setFilterFun(this.preFilterFun);
	}

	if(this.preSelectFun) {
		this.setSelectFun(this.preSelectFun);
	}

	return this;
};

Table.prototype.generateFilter = function () {
	var that = this;

	// Filter
	this.filter = $('<p style="margin-top:3px;"></p>');

	var img_help = $('<img class="WiseGuiNodeTable" style="float:right;cursor:pointer;margin-top:5px;">');
	img_help.attr("src", "img/famfamfam/help.png");

	var div_help = $('<div style="margin-right:95px;"></div>');
	var div_adv = $('<div style="float:right;margin-top:3px;margin-right:2px;">Advanced</div>');

	this.filter_checkbox = $('<input type="checkbox" style="float:right;margin-top:7px;margin-right:3px;">');
	this.filter.append(img_help, div_adv, this.filter_checkbox, div_help);

	var filter_input = $('<input type="text" placeholder="Filter displayed nodes...">');
	// Key up event if enter is pressed
	filter_input.keyup(function(e) {
		if ((e.keyCode || e.which) == 13) {
			var filter_fun = that.setFilterFun.bind(that);
			var val = filter_input.val();
			filter_fun(val);
		}
	});
	this.filter_input = filter_input;

	var helpTooltipIsVisable = false;
	img_help.click(function() {
		img_help.popover(helpTooltipIsVisable ? 'hide' : 'show');
		helpTooltipIsVisable = !helpTooltipIsVisable;
	});

	var helpText = '<h3>Normal mode</h3>';
	helpText += 'In normal mode, the filter is a full text search.';
	helpText += '<h3>Advanced mode</h3>';
	helpText += 'In advanced mode, the filter is using <a href="http://api.jquery.com/filter/" target="_blank">jQuery.filter()</a> on the given data structure.';

	if(this.model.length > 0) {
		helpText += '<br>The data structure looks as follows:';
		helpText += "<pre style=\"overflow:auto;height:50px;margin:0px;\">" + JSON.stringify(this.model[0], wiseMLNullFilter, '  ') + "</pre>";
	}

	helpText += '<h5>Some examples:</h5>';

	helpText += '<ul style="margin-bottom:0px;font-family: monospace;">';
	helpText += '<li>e.nodeType == "isense"';
	helpText += '<li>e.position.x == 25';
	helpText += '<li>e.id.indexOf("0x21") > 0';
	helpText += '<li>($(e.capability).filter(function (i) {return this.name.indexOf("temperature") > 0;}).length > 0)';
	helpText += '</ul>';

	img_help.popover({
		placement:'left',
		animation:true,
		trigger: 'manual',
		content: helpText,
		title: "Filter Help"
	});
	div_help.append(filter_input);
	this.html.append(this.filter);
};

Table.prototype.generateTable = function () {
	var that = this;

	// Prepare the TableElems
	$(this.model).each(
		function() {
			that.data.push(new TableElem(this));
		}
	);

	this.table = $('<table class="table table-bordered"></table>');

	/*
	 * Generate table header
	 */
	var thead = $('<thead></thead>');
	var tr_thead = $('<tr></tr>');
	thead.append(tr_thead);

	// Reusable stuff
	var th = $('<th class="header"></th>');
	var input_checkbox = $('<input type="checkbox"/>');

	// Append the checkbox to the header
	if(this.showCheckBoxes) {
		var th_checkbox = th.clone();
		var input_checkbox_th = input_checkbox.clone();

		input_checkbox_th.click(function() {
			var checked = $(this).is(':checked');
			if(that.table != null) {
				// .find("input")
				var inputs = that.table.find('tr:visible').find('input:checkbox');
				inputs.each(function(index, input) {
					$(this).attr('checked', checked);
					if(index>0) // first checkbox does not belong to a specific node and has no urn
					that.callSelectionListeners(input.attributes["urn"].nodeValue,!checked);
				});
			}
		});
		th_checkbox.append(input_checkbox_th);
		this.input_checkbox_th = input_checkbox_th;
		tr_thead.append(th_checkbox);
	}

	$.each(this.headers,
		function(key, value) {
			var th_local = th.clone();
			th_local.append(value);
			tr_thead.append(th_local);
		}
	);

	/*
	 * Generate the table body
	 */
	var tbody = $('<tbody></tbody>');

	if(this.rowProducer != null) {
		for ( var i = 0; i < this.data.length; i++) {

			var data = this.data[i].data;

			var row = null;
			if(this.rowProducer != null) {
				row = this.rowProducer.bind(data)(data);
			}

			var tr = $("<tr></tr>");

			if(this.showCheckBoxes) {
				var checkbox = $('<input type="checkbox"/>');
				checkbox.attr("name", i);
				checkbox.attr("urn", data.id);
				checkbox.click(function(){
					var checked = $(this).is(':checked');
					that.callSelectionListeners(this.attributes["urn"].nodeValue,!checked);
				});
				data.checkbox = checkbox;
				var td_checkbox = $('<td></td>');
				td_checkbox.append(checkbox);
				tr.append(td_checkbox);
			}

			for(var j = 0; j<row.length; j++) {
				var td = $('<td></td>');
				td.append(row[j]);
				tr.append(td);
			}
			this.data[i].row = tr;
			tbody.append(tr);
		}
	}

	this.table.append(thead);
	this.table.append(tbody);
	this.html.append(this.table);

	// add link for json representation of selected nodes
	var jsonLink = $('<a href="#" title="Opens a new window containing the selected NodeUrns as JSON">Get JSON representation</a>');
	jsonLink.click(function(e) {
		e.preventDefault();

		var obj = {"nodeUrns": $.map(that.getSelectedRows(), function(val,i) {
			return val.id;
		})}

		var json = JSON.stringify(obj);
		var w = window.open();
		$(w.document.body).html(json);
	});
	this.html.append(jsonLink);

	if(this.showCheckBoxes) {
		this.table.tablesorter({
			headers:{0:{sorter:false}},
			sortList: [[2,0]]
		});
	} else {
		this.table.tablesorter({sortList: [[1,0]]});
	}
};

Table.prototype.addSelectionListener = function (listener) {
	this.selectionListeners.push(listener);
};

Table.prototype.addFilterListener = function ( listener) {
	this.filterListeners.push(listener);
};

Table.prototype.callSelectionListeners = function(urn, deselected){
	var that = this;
	for (var i =0; i<that.selectionListeners.length;i++){
		that.selectionListeners[i](urn, deselected);
	}
};

Table.prototype.callFilterListeners = function(urns){
	var that = this;
	for (var i =0; i<that.filterListeners.length;i++){
		that.filterListeners[i](urns);
	}
};

Table.prototype.getSelectedRows = function () {

	var that = this;

	var selected = [];
	if(this.data != null && this.table != null) {
		this.table.find("input:checked").each(function() {
			var name = $(this).attr('name');
			// Ignore the checkbox from the header, which doesn't have any name
			if(typeof(name) != "undefined") {
				var index = parseInt(name);
				selected.push(that.data[index].data);
			}
		});
	}
	return selected;
};

Table.prototype.setFilterFun = function (fn) {

	this.preFilterFun = fn;

	for ( var i = 0; i < this.data.length; i++) {
		var d = this.data[i];
		d.isVisible = true; // Reset

		if(fn != null && typeof(fn) == "function") {
			d.isVisible = d.isVisible && fn.bind(d.data)(d.data);
		} else if(fn != null && typeof(fn) == "string" && fn.length > 0 && this.filter_checkbox.is(':checked')) {
			// Filter
			var errorOccured = false;

			var fil = function(e) {
				ret = true;
				try {
					ret = eval(fn);
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
				} else {
					return ret;
				}
			};

			d.isVisible = d.isVisible && fil(d.data);

			if(errorOccured) {
				WiseGui.showErrorAlert("Filter expression invalid.");
				return;
			} else {
				this.lastWorkingFilterExpr = fn;
			}
		}

		// Simple filter
		if(fn != null && typeof(fn) == "string" && fn.length > 0 && !this.filter_checkbox.is(':checked')) {
			if(this.rowProducer != null) {
				var row = this.rowProducer(d.data);
				if(implode(" ", row).toLowerCase().indexOf(fn.toLowerCase()) < 0) {
					d.isVisible = false;
				}
			}
		}

		if(d.isVisible) {
			d.row.show();
		} else {
			d.row.hide();
		}
	}

	if(this.showCheckBoxes) {
		this.input_checkbox_th.attr('checked', false);
	}
	var urns = [];
	for ( var i = 0; i < this.data.length; i++) {
		var d = this.data[i];
		if(d.isVisible==true){
			urns.push(d.data.id);}
		}
	this.callFilterListeners(urns);
};

Table.prototype.setSelectFun = function (fn) {

	this.preSelectFun = fn;

	for ( var i = 0; i < this.data.length; i++) {
		var data = this.data[i].data;
		var bool = false;
		if(fn != null) {
			bool = fn.bind(data)(data);
		}
		var checkbox = this.data[i].row.find('input:checkbox');
		checkbox.attr('checked', bool);
	}
};

Table.prototype.getFilterFun = function () {
	return this.preFilterFun;
};

Table.prototype.getSelectFun = function () {
	return this.preSelectFun;
};

/**
 * #################################################################
 * WiseGuiNodeTable
 * #################################################################
 */
var WiseGuiNodeTable = function (wiseML, parent, showCheckboxes, showFilter) {
	this.table = null;
	this.wiseML = wiseML;
	this.showCheckboxes = showCheckboxes;
	this.showFilter = showFilter;
	this.parent = parent;
	this.generateTable();
};

WiseGuiNodeTable.prototype.generateTable = function () {

	var that = this;

	// The header
	var header = [' ', 'Node URN','Type','Position','Sensors'];

	var nodeUrns = this.wiseML.setup.node.map(function (node) { return node.id;	});
	var connectionStatus = {};
	nodeUrns.forEach(function(nodeUrn) {
		connectionStatus[nodeUrn] = $('<div class="connectionStatus" />');
		connectionStatus[nodeUrn].append(new WiseGuiNodeStatusIcon(nodeUrn).view);
	});

	if(nodeUrns.length == 0){
		console.warn("No sensor nodes found");
		return;
	}

	wisebed.experiments.areNodesConnected(nodeUrns, function(result) {

		var attached = [];
		var detached = [];

		for (var node in result) {
			if (result.hasOwnProperty(node) && result[node].statusCode == 1) {
				attached.push(node);
			}
			else {
				detached.push(node);
			}
		}

		// emulate devicesAttachedEvent
		$(window).trigger('wisegui-devices-attached-event', {
			type : 'devicesAttached',
			timestamp : new Date().toISOString(),
			nodeUrns : attached
		});

		// emulate devicesDetachedEvent
		$(window).trigger('wisegui-devices-detached-event', {
			type : 'devicesAttached',
			timestamp : new Date().toISOString(),
			nodeUrns : detached
		});

	}, function(jqXHR, textStatus, errorThrown) {
		WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
	});

	// The row producer gives something like
	// ["", "id", "type", "(x,y,z)", "a,b,c"]
	var rowProducer = function (node) {
		var data = [];
		var capabilities = [];

		if(node.capability != null) {
			for(var j = 0; j < node.capability.length; j++) {
				parts = explode(":", node.capability[j].name);
				capabilities[j] = parts[parts.length-1];
			}
		}

		data.push(connectionStatus[node.id]);
		data.push(node.id);
		data.push(node.nodeType);

		if (node.position != null && node.position.outdoorCoordinates) {

			var c = node.position.outdoorCoordinates;

			if (c.latitude && c.longitude) {
				data.push('(' + c.latitude + ',' + c.longitude+ ')')
			} else if (c.x && c.y && c.z) {
				data.push('[' + c.x + ',' + c.y + ',' + c.z + ']');
			} else if (c.x && c.y) {
				data.push('[' + c.x + ',' + c.y + ',0]');
			} else {
				data.push(JSON.stringify({rho: c.rho, phi: c.phi, theta: c.theta}));
			}

		} else if (node.position != null && node.position.indoorCoordinates) {
			data.push(JSON.stringify(node.position.indoorCoordinates));
		} else {
			data.push('');
		}

		if(capabilities.length > 0) {
			data.push(implode(",", capabilities));
		} else {
			data.push('');
		}

		return data;
	};

	// Use the usual table
	var t = new Table (this.wiseML.setup.node, header, rowProducer, null, null, this.showCheckboxes, this.showFilter);
	this.table = t;

	// This vars store the predefined filters
	var predefined_filter_types = [];
	var predefined_filter_functions = [];

	// Add type filters
	$(this.wiseML.setup.node).each(
		function() {
			var t = this.nodeType;
			var text = "Only nodes of type " + t;
			if($.inArray(text, predefined_filter_types) < 0) {
				predefined_filter_types.push(text);
				var fn = function(e) {
					return e.nodeType == t;
				};
				predefined_filter_functions.push(fn);
			}
		}
	);

	// Other filters can be added here

	// Here the select will be generated
	var select = $('<select style="width:39%;background-color:#FFF;margin-left:1px;vertical-align:bottom;height:28px;"></select>');
	select.change(
		function () {
			var idx = parseInt($(this).val());
			var fn = predefined_filter_functions[idx];
			that.table.setFilterFun(fn);
		}
	);

	var option = $('<option value="">Nodes of every type</option>');
	select.append(option);

	var index = 0;
	$(predefined_filter_types).each(
		function() {
			var option = $('<option value="' + (index++) + '">' + this + '</option>');
			select.append(option);
		}
	);

	t.filter_input.css("width", "59%");
	t.filter_input.after(select);
	this.parent.append(t.html);
};

WiseGuiNodeTable.prototype.getSelectedNodes = function () {
	var ids = [];
	$(this.table.getSelectedRows()).each(function() {
		ids.push(this.id);
	});
	return ids;
};

WiseGuiNodeTable.prototype.applyFilter = function (fn) {
	this.table.setFilterFun(fn);
};

WiseGuiNodeTable.prototype.applySelected = function (fn) {
	this.table.setSelectFun(fn);
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
