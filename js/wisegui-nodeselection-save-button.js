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
			$(window).trigger('wisegui-nodeselection-storage-changed');
		};
		var dialogOptions = {
			'title' : 'Pick a name',
			'selectButtonLabel' : 'Save',
			'textbox' : true
		};
		new WiseGuiOptionSelectionDialog(storedNodeSelections, callback, undefined, dialogOptions).show();
	});
};