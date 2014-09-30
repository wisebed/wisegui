var WiseGuiOptionSelectionDialog = require('./wisegui-option-selection-dialog.js');
var WiseGuiEvents = require('./wisegui-events.js');

/**
 * #################################################################
 * WiseGuiNodeSelectionSaveButton
 * #################################################################
 */

var WiseGuiNodeSelectionSaveButton = function(getSelectionCallback) {
	this.view = $('<button class="btn">Save Selection</button>');
	this.view.bind('click', this, function(e) {
		var selection = getSelectionCallback();
		var storedNodeSelections = JSON.parse(window.localStorage.getItem("wisegui.nodeselections")) || {};
		var callback = function(name) {
			storedNodeSelections[name] = selection;
			window.localStorage.setItem("wisegui.nodeselections", JSON.stringify(storedNodeSelections));
			$(window).trigger(WiseGuiEvents.EVENT_NODESELECTIONS_STORAGE_CHANGED);
		};
		var dialogOptions = {
			'title' : 'Pick a name',
			'selectButtonLabel' : 'Save',
			'textbox' : true
		};
		new WiseGuiOptionSelectionDialog(storedNodeSelections, callback, undefined, dialogOptions).show();
	});
};

module.exports = WiseGuiNodeSelectionSaveButton;