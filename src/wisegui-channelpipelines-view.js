/**
 * #################################################################
 * WiseGuiChannelPipelinesView
 * #################################################################
 */

var WiseGuiChannelPipelinesView = function(reservation) {

	this.reservation  = reservation;
	this.experimentId = reservation.experimentId;

	this.view         = null;
	this.getButton    = null;

	this.buildView();
};

WiseGuiChannelPipelinesView.prototype.buildView = function() {
	this.view = $('<div><button class="btn span2 WiseGuiChannelPipelinesViewGetButton">Get Channel Pipelines</button></div>');
	this.getButton = this.view.find('button.WiseGuiChannelPipelinesViewGetButton').first();

	var self = this;
	this.getButton.bind('click', function() {
		wisebed.experiments.getNodeUrns(
				self.experimentId,
				function(nodeUrns) {
					wisebed.experiments.getChannelPipelines(
							self.experimentId,
							nodeUrns,
							function(channelPipelines) {
								console.log(channelPipelines);
							},
							WiseGui.showAjaxError
					);
				},
				WiseGui.showAjaxError
		);
	});
};

module.exports = WiseGuiChannelPipelinesView;