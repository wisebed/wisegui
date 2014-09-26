/**
 * #################################################################
 * WiseGuiResetView
 * #################################################################
 */

var WiseGuiResetView = function(reservation) {
	
	this.reservation              = reservation;
	this.experimentId             = reservation.experimentId;

	this.view                     = null;
	this.resetNodeSelectionButton = null;
	this.resetResetButton         = null;
	this.resetNodeSelectionDialog = null;

	this.resetSelectedNodeUrns    = [];

	this.buildView();
};

WiseGuiResetView.prototype.buildView = function() {

 	this.view = $(
 		  '<div class="row">'
		+ '	<div class="span4">'
		+ '		<button class="btn WiseGuiResetViewNodeSelectionButton span4">Select Nodes</button>'
		+ '	</div>'
		+ '	<div class="span4">'
		+ '		<button class="btn btn-primary WiseGuiResetViewResetButton span4" disabled>Reset Nodes</button>'
		+ '	</div>'
		+ '</div>');

 	this.resetNodeSelectionButton = this.view.find('button.WiseGuiResetViewNodeSelectionButton').first();
	this.resetResetButton         = this.view.find('button.WiseGuiResetViewResetButton').first();

	this.resetNodeSelectionDialog = new WiseGuiNodeSelectionDialog(
			this.experimentId,
			'Reset Nodes',
			'Please select the nodes you want to reset.',
			this.resetSelectedNodeUrns,
			'nodeselection.reset.'
	);

	this.resetNodeSelectionButton.bind('click', this, function(e) {
		e.data.showResetNodeSelectionDialog();
	});

	this.updateResetSelectNodeUrns();

	this.resetResetButton.bind('click', this, function(e) {
		e.data.executeResetNodes();
	});

	WiseGui.bindToReservationState(this.view.find('button'), this.experimentId);
};

WiseGuiResetView.prototype.updateResetSelectNodeUrns = function() {
	this.resetSelectedNodeUrns = this.resetNodeSelectionDialog.getSelection();
	this.setResetButtonDisabled(this.resetSelectedNodeUrns.length == 0);
	this.resetNodeSelectionButton.html((this.resetSelectedNodeUrns.length == 1 ?
			'1 node selected' :
			this.resetSelectedNodeUrns.length + ' nodes selected'
	));
};

WiseGuiResetView.prototype.showResetNodeSelectionDialog = function() {

	this.setResetSelectNodesButtonDisabled(true);
	var self = this;
	wisebed.getWiseMLAsJSON(
			this.reservation.experimentId,
			function(wiseML) {

				self.setResetSelectNodesButtonDisabled(false);

				// TODO: Refactor, also used in addFlashConfiguration
				if(self.resetSelectedNodeUrns != null && self.resetSelectedNodeUrns.length > 0) {
					preSelected = function(data) {
						var nodeids = self.resetSelectedNodeUrns;
						for(var i = 0; i < nodeids.length; i++) {
							if(data.id == nodeids[i]) return true;
						}
						return false;
					};
				}

				self.resetNodeSelectionDialog.show(function() {
					self.updateResetSelectNodeUrns();
				});

			}, function(jqXHR, textStatus, errorThrown) {
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};

WiseGuiResetView.prototype.setResetSelectNodesButtonDisabled = function(disabled) {
	this.resetResetButton.attr('disabled', disabled);
};

WiseGuiResetView.prototype.setResetButtonDisabled = function(disabled) {
	this.resetResetButton.attr('disabled', disabled);
};

WiseGuiResetView.prototype.executeResetNodes = function() {

	this.setResetButtonDisabled(true);
	var self = this;
	wisebed.experiments.resetNodes(
			this.reservation.experimentId,
			this.resetSelectedNodeUrns,
			function(result) {
				var progressView = new WiseGuiOperationProgressView(
						self.resetSelectedNodeUrns, 1,
						"All nodes were successfully reset."
				);
				progressView.update(result);
				self.setResetButtonDisabled(false);
			},
			function(jqXHR, textStatus, errorThrown) {
				self.setResetButtonDisabled(false);
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};