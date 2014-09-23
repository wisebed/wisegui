/**
 * #################################################################
 * WiseGuiNodeSelectionSaveButton
 * #################################################################
 */

var WiseGuiNodeSelectionSaveButton = function(getSelectionCallback) {
	this.view = $('<button class="btn">Save Selection</button>');
	this.view.bind('click', this, function(e) {
		var selection = getSelectionCallback();
		window.localStorage.setItem("wisegui.nodeselections", JSON.stringify(selection));
		$(window).trigger('wisegui-nodeselection-storage-changed');
	});
};