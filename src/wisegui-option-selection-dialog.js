
var WiseGuiOptionSelectionDialog = function(options, selectedCallback, cancelledCallback, dialogOptions) {

	var self = this;

	dialogOptions.title = dialogOptions.title || 'Please Select';
	dialogOptions.cancelButtonLabel = dialogOptions.cancelButtonLabel || 'Cancel';
	dialogOptions.selectButtonLabel = dialogOptions.selectButtonLabel || 'Select';
	dialogOptions.textbox = dialogOptions.textbox || false;
	
	this.cancelled = false;
	this.selected = undefined;

	// set up modal dialog
	var dialog = $(
		'<div class="modal hide wisegui-option-selection-dialog" id="myModal">' +
		'	<div class="modal-header">' +
		'		<button type="button" class="close" data-dismiss="modal">×</button>' +
		'		<h3>' + dialogOptions.title +'</h3>' +
		'	</div>' +
		'	<div class="modal-body">' +
		'		<form><fieldset></fieldset></form>' +
		'	</div>' +
		'	<div class="modal-footer">' +
		'		<a href="#" class="btn btn-cancel" data-dismiss="modal">' + dialogOptions.cancelButtonLabel + '</a>' +
		'		<a href="#" class="btn btn-primary btn-select" disabled="disabled">' + dialogOptions.selectButtonLabel + '</a>' +
		'	</div>' +
		'</div>');
	dialog.modal({
		backdrop : 'static'
	});
	// make dialog show on top of other "first-level" modal dialogs
	dialog.addClass('modalmodal');
	dialog.prev('div.modal-backdrop').addClass('modalmodal');

	// set up modal dialog content
	var form = dialog.find('div.modal-body fieldset');
	var loadButton = dialog.find('a.btn-select');
	var cancelButton = dialog.find('a.btn-cancel');
	
	var select = $('<select>').append('<option/>');
	for (var name in options) {
		select.append($("<option></option>").attr("value", name).text(name));
	}
	var selectLabel = $('<label class="control-label" for="'+textId+'">Choose an existing</label>');
	form.append($('<div class="control-group"/>').append(selectLabel, $('<div class="controls"/>').append(select)));

	select.change(function() {
		var selectedOption = select.find('option:selected');
		if (selectedOption.exists() && selectedOption.attr('value')) {
			loadButton.removeAttr('disabled');
			self.selected = selectedOption.attr('value');
		} else {
			loadButton.attr('disabled', 'disabled');
			self.selected = undefined;
		}
	});
	select.trigger('change');

	// set up textbox for creating a "new selection" if configured
	if (dialogOptions.textbox) {
		var textId = 'wisegui_option_selection_dialog_text_' + Math.floor(Math.random() * 100000);
		var text = $('<input type="text" id="'+textId+'"/>');
		text.on('keyup', function(e) {
			
			if(e.keyCode == 13) { // enter

				e.preventDefault();
				loadButton.click();

			} else {

				if (text.val()) {
					select.attr('disabled','disabled');
					text.parent('control-group').addClass('success');
					select.parent('control-group').addClass('error');
					loadButton.removeAttr('disabled');
					self.selected = text.val();
				} else {
					select.removeAttr('disabled');
					select.parent('control-group').removeClass('error');
					text.parent('control-group').removeClass('success');
					loadButton.attr('disabled','disabled');
					self.selected = undefined;
				}
			}
		});
		var textLabel = $('<label class="control-label" for="'+textId+'">... or pick a new one</label>');
		form.append($('<div class="control-group"/>').append(textLabel, $('<div class="controls"/>').append(text)));
	}

	// configure button actions
	loadButton.on('click', function(e) {
		e.preventDefault();
		if (!loadButton.attr('disabled')) {
			selectedCallback(self.selected);
			dialog.modal('hide');
			dialog.remove();
		}
	});

	if (cancelledCallback) {
		this.cancelled = true;
		cancelButton.on('click', cancelledCallback);
		dialog.on('hidden', function() {
			if (self.cancelled) {
				cancelledCallback();
			}
		});
	}

	dialog.on('hidden', function() {
		dialog.remove();
	});

	this.show = function() {
		dialog.modal('show');
	};
};