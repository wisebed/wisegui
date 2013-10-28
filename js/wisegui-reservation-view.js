/**
 * #################################################################
 * WiseGuiReservationView
 * #################################################################
 */

var WiseGuiReservationView = function(reservation) {

	this.reservation             = reservation;
	this.experimentId            = reservation.experimentId;

	this.reservationViewDivId    = 'WiseGuiReservationView-'+this.experimentId.replace(/=/g, '');
	this.progressBarId           = this.reservationViewDivId+'-progress-bar';
	this.outputsTextAreaId       = this.reservationViewDivId+'-outputs-textarea';
	this.sendDivId               = this.reservationViewDivId+'-send';
	this.flashDivId              = this.reservationViewDivId+'-flash';
	this.resetDivId              = this.reservationViewDivId+'-reset';
	this.scriptingEditorDivId    = this.reservationViewDivId+'-scripting-editor';
	this.scriptingOutputDivId    = this.reservationViewDivId+'-scripting-output';
	this.wisemlJsonDivId         = this.reservationViewDivId+'-wiseml-json';
	this.wisemlXmlDivId          = this.reservationViewDivId+'-wiseml-xml';

	this.view = $('<div class="WiseGuiReservationView"/>');

	this.buildView();
	this.loadWisemlViews();
};

WiseGuiReservationView.prototype.loadWisemlViews = function() {
	var self = this;
	wisebed.getWiseMLAsJSON(this.experimentId, function(wiseML) {
		var jsonTab = $('#' + self.wisemlJsonDivId);
		jsonTab.append($('<pre class="WiseGuiReservationViewWiseMLJSON">'+JSON.stringify(wiseML, wiseMLNullFilter, '  ')+'</pre>'));
		jsonTab.append($('<a href="'+wisebedBaseUrl + '/experiments/'+self.experimentId+'/network.json" target="_blank" class="btn btn-primary pull-right">Download</a>'));
	}, WiseGui.showAjaxError);
	wisebed.getWiseMLAsXML(this.experimentId, function(wiseML) {
		var xmlTab = $('#' + self.wisemlXmlDivId);
		xmlTab.append($('<pre class="WiseGuiReservationViewWiseMLXML">'+new XMLSerializer().serializeToString(wiseML).replace(/</g,"&lt;")+'</pre>'));
		xmlTab.append($('<a href="'+wisebedBaseUrl + '/experiments/'+self.experimentId+'/network.xml" target="_blank" class="btn btn-primary pull-right">Download</a>'));
	}, WiseGui.showAjaxError);
};

WiseGuiReservationView.prototype.buildView = function() {
	
	this.consoleView = new WiseGuiConsoleView(this.reservation);
	this.view.append(this.consoleView.view);

	this.view.append(
			  ' <div class="WiseGuiReservationViewControls"><h2>Controls</h2></div>'
			+ '	 <div>'
			+ '		<ul class="nav nav-tabs">'
			+ '			<li class="active"    ><a href="#'+this.flashDivId+'">Flash</a></li>'
			+ '			<li                   ><a href="#'+this.resetDivId+'">Reset</a></li>'
			+ '			<li                   ><a href="#'+this.sendDivId+'">Send Message</a></li>'
			+ '			<li                   ><a href="#'+this.scriptingEditorDivId+'">Scripting Editor</a></li>'
			+ '			<li                   ><a href="#'+this.scriptingOutputDivId+'">Scripting Output</a></li>'
			+ '         <li class="pull-right"><a href="#'+this.wisemlXmlDivId+'">WiseML (XML)</a></li>'
			+ '         <li class="pull-right"><a href="#'+this.wisemlJsonDivId+'">WiseML (JSON)</a></li>'
			+ '		</ul>'
			+ '		<div class="tab-content">'
			+ '			<div class="active tab-pane WiseGuiConsoleViewFlashControl" id="'+this.flashDivId+'"></div>'
			+ '			<div class="       tab-pane WiseGuiConsoleViewResetControl" id="'+this.resetDivId+'"></div>'
			+ '			<div class="       tab-pane WiseGuiConsoleViewSendControl" id="'+this.sendDivId+'"/>'
			+ '			<div class="       tab-pane WiseGuiConsoleViewScriptingControl" id="'+this.scriptingEditorDivId+'"/>'
			+ '			<div class="       tab-pane WiseGuiConsoleViewScriptingOutputTab" id="'+this.scriptingOutputDivId+'"/>'
			+ '			<div class="       tab-pane WiseGuiConsoleViewWisemlXmlTab" id="'+this.wisemlXmlDivId+'"/>'
			+ '			<div class="       tab-pane WiseGuiConsoleViewWisemlJsonTab" id="'+this.wisemlJsonDivId+'"/>'
			+ '		</div>'
			+ '	</div>'
			+ '</div>');
	
	// attach views
	this.flashView = new WiseGuiFlashView(this.reservation);
	this.view.find('#'+this.flashDivId).append(this.flashView.view);

	this.resetView = new WiseGuiResetView(this.reservation);
	this.view.find('#'+this.resetDivId).append(this.resetView.view);

	this.sendView = new WiseGuiSendView(this.reservation);
	this.view.find('#'+this.sendDivId).append(this.sendView.view);

	//this.channelPipelinesView = new WiseGuiChannelPipelinesView(this.reservation);
	//this.view.find('#'+this.channelPipelinesDivId).append(this.channelPipelinesView.view);

	this.scriptingView = new WiseGuiScriptingView(this.reservation);
	this.view.find('#'+this.scriptingEditorDivId).append(this.scriptingView.editorView);
	this.view.find('#'+this.scriptingOutputDivId).append(this.scriptingView.outputView);

	// bind some actions

	var self = this;
	var tabs = this.view.find('.nav-tabs').first();

	tabs.find('a').click(function (e) {
		e.preventDefault();
		var navigationData = getNavigationData();
		navigationData.tab = e.target.hash.substring(1);
		window.location.hash = $.param(navigationData);
	});

	$(window).bind('wisegui-navigation-event', function(e, navigationData) {
		if (navigationData.tab) {
			tabs.find('a[href="#'+navigationData.tab+'"]').tab('show');
		}
	});
};