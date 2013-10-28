/**
 * #################################################################
 * WiseGuiFlashView
 * #################################################################
 */

var WiseGuiFlashView = function(reservation) {
	
	this.reservation              = reservation;
	this.configurations           = [];

	this.addSetButton             = null;
	this.removeSetButton          = null;
	this.loadConfigurationButton  = null;
	this.saveConfigurationButton  = null;
	this.flashButton              = null;
	this.configurationsTableBody  = null;
	this.view                     = null;

	this.buildView();
};

WiseGuiFlashView.prototype.buildView = function() {
	this.view = $(
		  '<div class="row">'
		+ '	<div class="span3">'
		+ '		<button class="btn WiseGuiFlashViewAddSetButton"> + </button>'
		+ '		<button class="btn WiseGuiFlashViewRemoveSetButton"> - </button>'
		+ '		<button class="btn WiseGuiFlashViewLoadConfigurationButton">Load</button>'
		+ '		<button class="btn WiseGuiFlashViewSaveConfigurationButton">Save</button>'
		+ '	</div>'
		+ '	<div class="span3">'
		+ '		<button class="btn btn-primary WiseGuiFlashViewFlashButton span2">Flash</button>'
		+ '	</div>'
		+ '</div>'
		+ '<div class="row">'
		+ '	<div class="span12">'
		+ '		<table class="table table-striped">'
		+ '			<thead>'
		+ '				<tr>'
		+ '					<th>Set</th>'
		+ '					<th>Selected Nodes</th>'
		+ '					<th>Image File</th>'
		+ '					<th class="span5"></th>'
		+ '				</tr>'
		+ '			</thead>'
		+ '			<tbody>'
		+ '			</tbody>'
		+ '		</table>'
		+ '	</div>'
		+ '</div>');

	this.addSetButton            = this.view.find('button.WiseGuiFlashViewAddSetButton').first();
	this.removeSetButton         = this.view.find('button.WiseGuiFlashViewRemoveSetButton').first();
	this.loadConfigurationButton = this.view.find('button.WiseGuiFlashViewLoadConfigurationButton').first();
	this.saveConfigurationButton = this.view.find('button.WiseGuiFlashViewSaveConfigurationButton').first();
	this.flashButton             = this.view.find('button.WiseGuiFlashViewFlashButton').first();
	this.configurationsTableBody = this.view.find('table tbody').first();

	var self = this;

	// bind actions for flash tab buttons
	this.addSetButton.bind('click', self, function(e) {
		self.addConfiguration();
	});

	this.removeSetButton.bind('click', self, function(e) {
		self.removeConfiguration();
	});

	this.loadConfigurationButton.bind('click', self, function(e) {
		self.loadConfiguration(self.loadConfigurationButton);
	});

	this.saveConfigurationButton.bind('click', self, function(e) {
		self.saveConfiguration();
	});

	this.flashButton.bind('click', self, function(e) {
		self.executeFlashNodes();
	});

	this.addConfiguration();
};

WiseGuiFlashView.prototype.getFormData = function() {

	var formData = {
		configurations : []
	};

	for (var i=0; i<this.configurations.length; i++) {
		formData.configurations.push(this.configurations[i].config);
	}

	return formData;
};

WiseGuiFlashView.prototype.saveConfiguration = function(button) {

	var json = {
		configurations : []
	};

	for (var i=0; i<this.configurations.length; i++) {
		json.configurations.push(this.configurations[i].config);
	}
	var jsonString = JSON.stringify(json);

	//if(window.MozBlobBuilder) {
	//	var uriContent = "data:application/octet-stream;base64," + btoa(json);
	//	//window.open(uriContent, 'configuration.json');
	//	window.location = uriContent;
	//} else {
		var bb = new BlobBuilder();
		bb.append(jsonString);
		saveAs(bb.getBlob("text/plain;charset=utf-8"), "configuration.json");
	//}
};

WiseGuiFlashView.prototype.loadConfiguration = function(button) {

	button.attr("disabled", "true");

	var self = this;

	// @param: Type is conf-object
	var dialog;
	dialog = new WiseGuiLoadConfigurationDialog(
			function(data, textStatus, jqXHR) {

				dialog.hide();
				button.removeAttr("disabled");

				if(data == null) {
					return;
				}

				var configurations = data.configurations;

				// Reset
				self.configurationsTableBody.empty();
				self.configurations = [];

				// Iterate all configurations
				for(var i = 0; i < configurations.length; i++) {
					self.addConfiguration(configurations[i]);
				}
			},
			function(jqXHR, textStatus, errorThrown) {

				dialog.hide();
				button.removeAttr("disabled");
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
	dialog.view.on('hide', function() {
		button.removeAttr("disabled");
	});
	dialog.show();
};

// @see: http://stackoverflow.com/a/5100158/605890
WiseGuiFlashView.prototype.dataURItoBlob = function(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new BlobBuilder();
    bb.append(ab);
    return bb.getBlob(mimeString);
};

WiseGuiFlashView.prototype.addConfiguration = function(conf) {

	// build and append the gui elements
	var nodeSelectionButton   = $('<button class="btn nodeSelectionButton span3">Select Nodes</button>');
	var imageFileInput        = $('<input type="file" style="opacity: 0; width: 0px; position:absolute; top:-100px;"/>');
	var imageFileButton       = $('<button class="btn fileSelectionButton span3">Select Image</button>');
	var imageFileInfoLabel    = $('<div/>');
	var tr                    = $('<tr/>');

	var setNumberTd           = $('<td>' + (this.configurations.length + 1) + '</td>');
	var nodeSelectionButtonTd = $('<td/>');
	var imageFileInputTd      = $('<td/>');
	var imageFileInfoLabelTd  = $('<td/>');

	nodeSelectionButtonTd.append(nodeSelectionButton);

	imageFileInputTd.append(imageFileInput);
	imageFileInputTd.append(imageFileButton);
	imageFileInfoLabelTd.append(imageFileInfoLabel);

	tr.append(setNumberTd, nodeSelectionButtonTd, imageFileInputTd, imageFileInfoLabelTd);
	this.configurationsTableBody.append(tr);

	// build and remember the configuration
	var configuration = {
		nodeSelectionButton : nodeSelectionButton,
		imageFileInput      : imageFileInput,
		imageFileButton     : imageFileButton,
		imageFileLabel      : imageFileInfoLabel,
		tr                  : tr,
		config              : { nodeUrns : null, image : null }
	};

	if(typeof(conf) == "object") {
		// Set the image
		if(conf.image != null) {
			configuration.config.image = conf.image;
			var blob = this.dataURItoBlob(configuration.config.image);
			imageFileInfoLabel.append(
					'<strong>' + blob.name + '</strong> (' + (blob.type || 'n/a') + ')<br/>'
					+ blob.size + ' bytes'
			);
		}
		// Set the node URNs
		if(conf.nodeUrns != null) {

			var checkNodes = function(data) {

				var reservedNodeUrns = [];
				for(var i = 0; i < data.setup.node.length; i++) {
					reservedNodeUrns.push(data.setup.node[i].id);
				}

				var preSelectedNodeUrns = [];
				for(var k = 0; k < conf.nodeUrns.length; k++) {
					if($.inArray(conf.nodeUrns[k], reservedNodeUrns) >= 0) {
						preSelectedNodeUrns.push(conf.nodeUrns[k]);
					}
				}

				configuration.config.nodeUrns = preSelectedNodeUrns;

				var nodeSelectionButtonText = configuration.config.nodeUrns.length == 1 ?
						'1 node selected' :
						configuration.config.nodeUrns.length + ' nodes selected';

				nodeSelectionButton.html(nodeSelectionButtonText);
			};

			wisebed.getWiseMLAsJSON(this.reservation.experimentId, checkNodes, WiseGui.showAjaxError);
		}
	}

	this.configurations.push(configuration);

	// bind actions to buttons
	var self = this;

	nodeSelectionButton.bind('click', function() {

		var nodeSelectionDialog = new WiseGuiNodeSelectionDialog(
				self.experimentId,
				'Select Nodes',
				'Please select the nodes you want to flash.',
				configuration.config.nodeUrns
		);

		nodeSelectionButton.attr('disabled', true);
		nodeSelectionDialog.show(
			function(nodeUrns) {
				nodeSelectionButton.attr('disabled', false);
				configuration.config.nodeUrns = nodeUrns;
				nodeSelectionButton.html((nodeUrns.length == 1 ? '1 node selected' : (nodeUrns.length + ' nodes selected')));
			}, function() {
				nodeSelectionButton.attr('disabled', false);
			}
		);
	});

	imageFileButton.bind('click', function() {
		configuration.imageFileInput.click();
	});

	imageFileInput.bind('change', function() {

		var imageFile       = imageFileInput[0].files[0];
		var imageFileReader = new FileReader();

		imageFileReader.onerror = function(progressEvent) {
			configuration.config.image = null;
			WiseGui.showWarningAlert('The file "' + imageFile.name+ '" could not be read!');
		};

		imageFileReader.onloadend = function(progressEvent) {
			configuration.config.image = imageFileReader.result;
			imageFileInfoLabel.empty();
			imageFileInfoLabel.append(
					'<strong>' + imageFile.name + '</strong> (' + (imageFile.type || 'n/a') + ')<br/>'
					+ imageFile.size + ' bytes'

					// last modified: ' +
					// imageFile.lastModifiedDate.toLocaleDateString()
					//
					// Crashes in FF. Even if the File interface specifies a
					// lastModifiedDate,
					// it is not working/existing in FF.
					//
					// @see https://github.com/wisebed/rest-ws/issues/32
			);
		};

		imageFileReader.readAsDataURL(imageFile);

	});

	return configuration;
};

WiseGuiFlashView.prototype.removeConfiguration = function() {
	if (this.configurations.length > 1) {
		var configuration = this.configurations.pop();
		configuration.tr.remove();
		return configuration;
	}
	return null;
};

WiseGuiFlashView.prototype.executeFlashNodes = function() {

	var formData = this.getFormData();

	var allNodeUrns = [];
	$.each(formData.configurations, function(index, configuration) {
		$.each(configuration.nodeUrns, function(index, nodeUrn) {
			allNodeUrns.push(nodeUrn);
		});
	});

	var progressViewer = new WiseGuiOperationProgressView(
			allNodeUrns, 100,
			"All nodes were successfully flashed."
	);

	var self = this;
	self.flashButton.attr('disabled', true);
	
	wisebed.experiments.flashNodes(
			this.reservation.experimentId,
			formData,
			function(result) {
				self.flashButton.attr('disabled', false);
				progressViewer.update(result);
			},
			function(progress) {
				progressViewer.update(progress);
			},
			function(jqXHR, textStatus, errorThrown) {
				self.flashButton.attr('disabled', false);
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}
	);
};