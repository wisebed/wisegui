
var WiseGuiNodeSelectionSelectDialog = function(selectionCallback) {

	// set up modal dialog
	var dialog = $(
		'<div class="modal hide" id="myModal">' +
		'	<div class="modal-header">' +
		'		<button type="button" class="close" data-dismiss="modal">×</button>' +
		'		<h3>Select Node Selection</h3>' +
		'	</div>' +
		'	<div class="modal-body"></div>' +
		'	<div class="modal-footer">' +
		'		<a href="#" class="btn" data-dismiss="modal">Cancel</a>' +
		'		<a href="#" class="btn btn-primary btn-load" disabled="disabled">Load</a>' +
		'	</div>' +
		'</div>');
	dialog.modal({
		backdrop : 'static'
	});
	// make dialog show on top of other "first-level" modal dialogs
	dialog.addClass('modalmodal');
	dialog.prev('div.modal-backdrop').addClass('modalmodal');

	// set up modal dialog content
	var dialogBody = dialog.find('div.modal-body');
	var loadButton = dialog.find('a.dialog-btn-load');
	var nodeSelections = window.localStorage.getItem('wisegui.nodeselections');
	
	if (!nodeSelections) {
		
		dialogBody.append('<p><span class="label label-warning">No saved node selections available!</span></p>');
		dialogBody.append('<p>Node selections are stored in the Browsers "localStorage" object and are not ' +
			'synchronized with your user account on the testbed servers.');
		
	} else {

		var select = $('<select/>');
		for (var name in nodeSelections) {
			select.append($("<option></option>").attr("value", name).text(name));
		}
		dialogBody.append(select);

		select.change(function() {
			if (select.find('option:selected').exists()) {
				loadButton.removeAttr('disabled');
			} else {
				loadButton.attr('disabled', 'disabled');
			}
		});
	}

	// configure button actions
	loadButton.on('click', function() {
		var selectedSelection = dialogBody.find('select option:selected').attr('value');
		if (!loadButton.attr('disabled')) {
			var nodeSelections = JSON.parse(window.localStorage.getItem("wisegui.nodeselections")) || {};
			selectionCallback(nodeSelection[selectedSelection]);
		}
	});

	this.show = function() {
		dialog.modal('show');
	};
};