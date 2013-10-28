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
	var t = new WiseGuiTable (this.wiseML.setup.node, header, rowProducer, null, null, this.showCheckboxes, this.showFilter);
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