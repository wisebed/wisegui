/**
 * #################################################################
 * WiseGuiOperationProgressView
 * #################################################################
 */

var WiseGuiOperationProgressView = function(nodeUrns, operationMaxValue, successMessage) {

	this.view = $('<div class="WiseGuiOperationProgressView"/>');
	this.successMessage = successMessage;
	this.visible = false;

	this.contents = {};

	for (var i=0; i<nodeUrns.length; i++) {

		var row = $(
			'<table>' +
			'	<tr>' +
			'	<td class="span1 nodUrnTd">'+nodeUrns[i]+'</td>' +
			'	<td class="span4 progressTd"><progress value="0" min="0" max="'+operationMaxValue+'"/></td>' +
			'	<td class="span1 statusTd"></td>' +
			'	<td class="span6 messageTd"></td>' +
			'	</tr>' +
			'</table>'
		);

		this.contents[nodeUrns[i]] = {
			row         : row,
			progressBar : row.find('progress').first(),
			statusTd    : row.find('.statusTd').first(),
			messageTd   : row.find('.messageTd').first()
		};

		this.view.append(row);
	}
};

WiseGuiOperationProgressView.prototype.update = function(operationStatus) {

	var self = this;
	var allSuccessful = true;

	$.each(operationStatus, function(nodeUrn, nodeStatus) {
		var content = self.contents[nodeUrn];
		if (content) {
			if (nodeStatus.status == 'SUCCESS') {
				content.row.remove();
				delete self.contents[nodeUrn];
			} else {
				content.progressBar[0].value = nodeStatus.statusCode;
				content.statusTd.html(nodeStatus.status);
				content.messageTd.html(nodeStatus.message);
				allSuccessful = false;
			}
		}
	});

	if (allSuccessful && this.successMessage) {
		self.view.parent().remove();
		WiseGui.showSuccessAlert(this.successMessage);
	}

	if (!allSuccessful && !this.visible) {
		WiseGui.showInfoBlockAlert(this.view);
		this.visible = true;
	}
};

module.exports = WiseGuiOperationProgressView;