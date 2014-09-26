/**
 * #################################################################
 * WiseGuiNodeSelectionDialog
 * #################################################################
 */

var WiseGuiNodeSelectionDialog = function(experimentId, headerHtml, bodyHtml, preSelected, storageKeyPrefix) {

	this.experimentId = experimentId;
	this.table = null;

	this.preSelected = preSelected;
	this.storageKeyPrefix = storageKeyPrefix;

	this.dialogDivId = 'WiseGuiNodeSelectionDialog-' + Math.random();

	this.dialogDiv = $('<div id="'+this.dialogDivId+'" class="modal hide WiseGuiNodeSelectionDialog"></div>');

	var bodyHeader = $(
		'<div class="modal-header">' +
		'	<h3>' + headerHtml + '</h3>' +
		'</div>'
	);

	var body = $(
		'<div class="modal-body">' +
		'	<p>' + bodyHtml + '</p>' +
		'</div>'
	);

	var imgAjaxLoader = $('<img class="ajax-loader" width="32" height="32"/>');
	imgAjaxLoader.attr("src", "img/ajax-loader-big.gif");
	body.append(imgAjaxLoader);

	var bodyFooter = $(
		'<div class="modal-footer">' +
		'	<a class="modal-cancel btn">Cancel</a>' +
		'	<a class="modal-ok btn btn-primary">OK</a>' +
		'</div>'
	);

	this.dialogDiv.append(bodyHeader, body, bodyFooter);

	this.nodeUrns = undefined;
	this.callbackCancel = undefined;
	this.callbackOK = undefined;
	this.callbacksReady = [];

	var self = this;
	wisebed.getWiseMLAsJSON(
			this.experimentId,
			function(wiseML) {
				self.constructDialogInternal(wiseML);
				self.callbacksReady.forEach(function(callback) { callback(); });
			},
			function(jqXHR, status, error) {
				self.hide();
				WiseGui.showAjaxError(jqXHR, status, error);
			}
	);
};

WiseGuiNodeSelectionDialog.prototype.setSelection = function(nodeUrns) {
	if (nodeUrns !== null && nodeUrns.length > 0) {
		window.localStorage.setItem(this.storageKeyPrefix + this.experimentId, nodeUrns.join(","));
		this.table.applySelected(function(data) { return nodeUrns.indexOf(data.id) > -1; });
	} else {
		window.localStorage.removeItem(this.storageKeyPrefix + this.experimentId);
		this.table.applySelected(function() { return false; });
	}
};

WiseGuiNodeSelectionDialog.prototype.getSelection = function() {
	var nodeUrnsString = window.localStorage.getItem(this.storageKeyPrefix + this.experimentId);
	return nodeUrnsString === null ? [] : nodeUrnsString.split(",");
};

WiseGuiNodeSelectionDialog.prototype.areSomeSelected = function() {
	return this.getSelection().length > 0;
};

WiseGuiNodeSelectionDialog.prototype.areAllSelected = function() {
	return this.getSelection().length == this.nodeUrns.length;
};

WiseGuiNodeSelectionDialog.prototype.constructDialogInternal = function(wiseML) {

	this.nodeUrns = wiseML.setup.node.map(function(node) { return node.id; });

	this.dialogDiv.on('hide', function() {
		if (this.callbackCancel) {
			this.callbackCancel();
		}
	});

	this.dialogDiv.find('.ajax-loader').attr('hidden', 'true');
	this.table = new WiseGuiNodeTable(wiseML, this.dialogDiv.find('.modal-body').first(), true, true);

	// Apply preselected
	if(typeof(this.preSelected) == "function") {
		this.table.applySelected(this.preSelected);
	} else if (this.storageKeyPrefix) {
		this.setSelection(this.getSelection());
	}

	this.nodeSelectionSaveButton = new WiseGuiNodeSelectionSaveButton(this.table.getSelectedNodes.bind(this.table));
	this.nodeSelectionLoadButton = new WiseGuiNodeSelectionLoadButton(this.table.setSelectedNodes.bind(this.table));
	
	this.dialogDiv.find('.modal-footer').prepend(this.nodeSelectionSaveButton.view);
	this.dialogDiv.find('.modal-footer').prepend(this.nodeSelectionLoadButton.view);

	// Cancel clicked
	this.dialogDiv.find('.modal-cancel').first().bind(
			'click',
			{dialog : this},
			function(event) {
				// reset to last selection set
				event.data.dialog.setSelection(event.data.dialog.getSelection());
				event.data.dialog.dialogDiv.modal('hide');
				if (event.data.dialog.callbackCancel) {
					event.data.dialog.callbackCancel();
				}
			}
	);

	// OK clicked
	this.dialogDiv.find('.modal-ok').first().bind(
			'click',
			{dialog : this},
			function(event) {
				var dialog = event.data.dialog;
				var selectedNodes = dialog.table.getSelectedNodes();
				dialog.dialogDiv.modal('hide');
				if (dialog.storageKeyPrefix) {
					dialog.setSelection(selectedNodes);
				}
				if (event.data.dialog.callbackOK) {
					event.data.dialog.callbackOK(selectedNodes);
				}
			}
	);

	if (!document.body.contains(this.dialogDiv)) {
		$(document.body).append(this.dialogDiv);
	}
};

WiseGuiNodeSelectionDialog.prototype.hide = function() {
	this.dialogDiv.modal('hide');
};

WiseGuiNodeSelectionDialog.prototype.show = function(callbackOK, callbackCancel) {
	this.callbackOK = callbackOK;
	this.callbackCancel = callbackCancel;
	this.dialogDiv.modal('show');
};

WiseGuiNodeSelectionDialog.prototype.onReady = function(callback) {
	this.callbacksReady.push(callback);
};