/**
 * #################################################################
 * WiseGuiScriptingView
 * #################################################################
 */

var WiseGuiScriptingView = function(reservation) {

	this.reservation     = reservation;
	this.experimentId    = reservation.experimentId;

	this.userScript      = {};

	this.editorView      = null;
	this.editorDiv       = null;
	this.editorDivId     = 'WiseGuiScriptingView-editor-'+this.experimentId;
	this.editorHelpModal = null;
	this.buildEditorView();

	this.outputView      = null;
	this.outputDiv       = null;
	this.outputDivId     = 'WiseGuiScriptingView-output-'+this.experimentId;
	this.buildOutputView();
};

WiseGuiScriptingView.prototype.buildEditorView = function() {

	this.editorView = $(
			  '<div class="row" style="padding-bottom:10px;">'
			+ '	<div class="span6">'
			+ '		<a class="btn span2 WiseGuiScriptingViewHelpButton" href="#" data-toggle="modal" data-target="#scriptingHelpModal">Help</a>'
			+ '	</div>'
			+ '	<div class="span6" style="text-align:right;">'
			+ '		<button class="btn btn-danger span2 WiseGuiScriptingViewStopButton">Stop</button>'
			+ '		<button class="btn btn-success span2 WiseGuiScriptingViewStartButton">Start</button>'
			+ '	</div>'
			+ '</div>'
			+ '<div class="row">'
			+ '		<div class="span12 WiseGuiScriptingViewEditorRow"></div>'
			+ '</div>');

	// ******* start ACE displaying error workaround ********
	// ace editor is not correctly displayed if parent tab is hidden when creating it. therefore we need to workaround
	// by attaching it to the body (invisible on z-index -1), making the div an ace editor, removing the z-index and
	// moving the element in the dom to its final destination
	this.editorRow         = this.editorView.find('div.WiseGuiScriptingViewEditorRow').first();
	this.editorStopButton  = this.editorView.find('button.WiseGuiScriptingViewStopButton').first();
	this.editorStartButton = this.editorView.find('button.WiseGuiScriptingViewStartButton').first();
	this.editorHelpButton  = this.editorView.find('button.WiseGuiScriptingViewScriptingHelpButton').first();
	this.editorDiv         = $(
			  '<div class="WiseGuiScriptingViewEditor" style="z-index:-1;">'
			+ 'WiseGuiUserScript = function() {\n'
			+ '  console.log("WiseGuiUserScript instantiated...");\n'
			+ '  this.experimentId = null;\n'
			+ '  this.webSocket = null;\n'
			+ '  this.outputDiv = null;\n'
			+ '  this.outputTextArea = null;\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.start = function(env) {\n'
			+ '  console.log("Starting user script...");\n'
			+ '  this.experimentId = env.experimentId;\n'
			+ '  this.outputDiv = env.outputDiv;\n'
			+ '  this.outputDiv.empty();\n'
			+ '  this.outputTextArea = $("&lt;textarea class=\'span12\' style=\'height:500px\'/>");\n'
			+ '  this.outputDiv.append(this.outputTextArea);\n'
			+ '  \n'
			+ '  var self = this;\n'
			+ '  this.webSocket = new wisebed.WebSocket(\n'
			+ '      this.experimentId,\n'
			+ '      function() {self.onmessage(arguments);},\n'
			+ '      function() {self.onopen(arguments);},\n'
			+ '      function() {self.onclosed(arguments);}\n'
			+ '  );\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.stop = function() {\n'
			+ '  console.log("Stopping user script...");\n'
			+ '  this.webSocket.close();\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.onmessage = function(message) {\n'
			+ '  console.log(message);\n'
			+ '  this.outputTextArea.html(this.outputTextArea.html() + "\\n" + JSON.stringify(message));\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.onopen = function(event) {\n'
			+ '  console.log(event);\n'
			+ '  this.outputTextArea.html(this.outputTextArea.html() + "\\nConnection opened!");\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '\n'
			+ 'WiseGuiUserScript.prototype.onclosed = function(event) {\n'
			+ '  console.log(event);\n'
			+ '  this.outputTextArea.html(this.outputTextArea.html() + "\\nConnection closed!");\n'
			+ '  // TODO implement me\n'
			+ '};\n'
			+ '</div>');

	$(document.body).append(this.editorDiv);

	var JavaScriptMode = require("ace/mode/javascript").Mode;

	this.editor = ace.edit(this.editorDiv[0]);
	this.editor.setTheme("ace/theme/textmate");
	this.editor.getSession().setMode(new JavaScriptMode());
	this.editorDiv.attr('style', '');
	this.editorRow.append(this.editorDiv);

	// ******* end ACE displaying error workaround ********

	this.editorHelpModal =
				  '<div id="scriptingHelpModal" class="modal hide">'
				+ '<div class="modal-header">'
				+ '  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
				+ '	 <h1>How to use the scripting environment?</h1>'
				+ '</div>'
				+ '<div class="modal-body">'
				+ 'The scripting environment allows the user to write arbitrary JavaScript code into the editor. This '
				+ 'functionality can e.g., be used to connect to the currently running experiment via WebSockets and '
				+ 'process the messages received from the sensor nodes to e.g., build visualizations or statistical '
				+ 'evaluations during the runtime of the experiment while data is flowing.'
				+ ''
				+ '<h3>Using lifecycle callbacks</h3>'
				+ 'If a script conforms to a certain class name and function skeleton the scripting environment '
				+ 'provides additional support for object-oriented scripting and lifecycle hooks. To get this support '
				+ 'base your script on the skeleton below:'
				+ ''
				+ '<pre>\n'
				+ 'WiseGuiUserScript = function() {\n'
				+ '  console.log("WiseGuiUserScript instantiated...");\n'
				+ '};\n'
				+ '\n'
				+ 'WiseGuiUserScript.prototype.start = function(env) {\n'
				+ '  console.log("WiseGuiUserScript started, connecting to reservation...");\n'
			    + '  this.onmessage = function(message) { console.log(message); }\n'
				+ '  this.onopen = function(event) { console.log(event); }\n'
				+ '  this.onclose = function(event) { console.log(event); }\n'
				+ '  this.webSocket = new wisebed.WebSocket(\n'
				+ '    env.experimentId,\n'
				+ '    this.onmessage,\n'
				+ '    this.onopen,\n'
				+ '    this.onclose\n'
				+ '  );\n'
				+ '};\n'
				+ '\n'
				+ 'WiseGuiUserScript.prototype.stop = function() {\n'
				+ '  console.log("WiseGuiUserScript stopped...");\n'
				+ '};\n'
				+ '</pre>'
				+ ''
				+ 'This way the environment can "start" the users script by calling '
				+ '<code>var userScript = new WiseGuiUserScriptClass(); userScript.start(env)</code> where '
				+ '<code>env</code> is a JavaScript object containing informations about the enironment (see below).<br/>'
				+ '<br/>'
				+ 'When the user stops the script the environment will call <code>userScript.stop()</code>, remove '
				+ 'the <code>&lt;script></code> tag from the DOM, and clean up by calling <code>delete userScript;</code> '
				+ 'and <code>delete WiseGuiUserScript;</code>.<br/>'
				+ ''
				+ '<h3>What type of events are received over the WebSocket connection?</h3>'
				+ 'The testbed back end produces several types of events, an example of each listed below:<br/>'
				+ '<ul>'
				+ '  <li>'
				+ '    <emph>Devices attached/detached</emph>: produced whenever one or more devices are attached or detached from '
				+ '    the back end. This can either be the case if a wired device gets physically or logically '
				+ '    attached/detached. A logical detach can e.g., happen if a mobile device moves out of communication'
				+ '    range of a gateway or if the back end software on the gateway crashes or is shut down. Example:'
				+ '<pre>'
				+ '{\n'
				+ '  "type":"devicesDetached",\n'
				+ '  "nodeUrns":["urn:wisebed:uzl1:0x2069"],\n'
				+ '  "timestamp":"2013-07-11T09:39:02.226+02:00"\n'
				+ '}\n'
				+ '</pre>'
				+ '<pre>'
				+ '{\n'
				+ '  "type":"devicesAttached",\n'
				+ '  "nodeUrns":["urn:wisebed:uzl1:0x2069"],\n'
				+ '  "timestamp":"2013-07-11T09:39:07.558+02:00"\n'
				+ '}\n'
				+ '</pre>'
				+ '  </li>'
				+ '  <li>'
				+ '    <emph>Device outputs</emph>: produced whenever a device outputs data on e.g., its serial port which'
				+ '    is then forwarded as an event to the user. Example:<br/>'
				+ '<pre>'
				+ '{\n'
				+ '  "type":"upstream",\n'
				+ '  "payloadBase64":"EAJoAGlTZXJBZXJpYWxBcHAgQm9vdGluZywgaWQ9MHgyMDY5EAM=",\n'
				+ '  "sourceNodeUrn":"urn:wisebed:uzl1:0x2069",\n'
				+ '  "timestamp":"2013-07-11T09:39:07.589+02:00"\n'
				+ '}'
				+ '</pre>'
				+ '  </li>'
				+ '  <li>'
				+ '    <emph>Reservation started/ended</emph>: produced when a reservation time stamp starts or ends. Example:<br/>'
				+ '<pre>'
				+ '{\n'
				+ '  "type":"reservationEnded",\n'
				+ '  "timestamp":"2013-07-11T08:42:00.000+02:00"\n'
				+ '}\n'
				+ '</pre>'
				+ '<pre>'
				+ '{\n'
				+ '  "type":"reservationStarted",\n'
				+ '  "timestamp":"2013-07-11T09:45:00.000+02:00"\n'
				+ '}\n'
				+ '</pre>'
				+ '  </li>'
				+ '</ul>'
				+ ''
				+ '<h3>How does the scripting environment look like?</h3>'
				+ 'The <code>env</code> variable that is passed to the <code>start()</code> function of the users script '
				+ 'contains information about the environment/context in which the script is executed. Below you see an '
				+ 'example <code>env</code> content:'
				+ ''
				+ '<pre>'
				+ '{\n'
				+ '  experimentId : ABCD1234567890EF,\n'
				+ '  outputDivId  : \'WiseGuiExperimentsViewScriptingOutputTab-ABCD1234567890EF\',\n'
				+ '  outputDiv    : {...}\n'
				+ '}'
				+ '</pre>'
				+ '<code>env.experimentId</code> can e.g., be used to call the '
				+ 'functions of wisebed.js to e.g., connect to the currently running experiments using WebSockets. '
				+ '<code>env.outputDivId</code> is the ID of the <code>&lt;div></code>DOM element that represents the '
				+ '"Scripting Output" tab so you can access it using <code>document.getElementById(env.outputDivId)</code> '
				+ 'or using the jQuery-based variant <code>$(env.outputDivId)</code> (which is identical to '
				+ '<code>env.outputDiv</code>).<br/>'
				+ '<br/>'
				+ 'Please note that your script may use all JavaScript libraries currently loaded in the document such '
				+ 'as jQuery or Twitter Bootstrap GUI elements and scripts.'
				+ ''
				+ '<h3>How is the code executed?</h3>'
				+ 'The scripting environment takes the code from the editor and attaches it the current documents DOM '
				+ 'using a <code>&lt;script></code> tag whereby the user-supplied script is automatically executed '
				+ '(i.e. evaluated). So either you include function calls to your self-written functions in your script '
				+ 'or base your script on the template as described above to make sure something is actually executed.'
				+ ''
				+ '<h3>Please be aware...</h3>'
				+ '... that there\'s no way yet to really clean up after running a user-provided '
				+ 'JavaScript script. Therefore, if your script doesn\'t cleanly shut down or breaks something the only '
				+ 'thing that definitely helps is to reload the browser tab to set the application back to a clean state!'
				+ '</div>'
				+ '</div>';

	$(document.body).append(this.editorHelpModal);
	
	var self = this;
	this.editorStopButton.attr('disabled', true);
	this.editorStartButton.bind('click', self, function(e) { self.startUserScript(); });
	this.editorStopButton.bind('click', self, function(e) { self.stopUserScript(); });

	WiseGui.bindToReservationState(this.editorStartButton, this.experimentId);
};

WiseGuiScriptingView.prototype.startUserScript = function() {

	this.stopUserScript();

	this.editorStartButton.attr('disabled', true);

	this.userScriptDomElem = document.createElement('script');
	this.userScriptDomElem.text = this.editor.getSession().getValue();
	this.userScriptDomElem.id = 'WiseGuiUserScriptDomElem-' + this.experimentId;

	document.body.appendChild(this.userScriptDomElem);

	this.editorStartButton.attr('disabled', true);
	this.editorStopButton.attr('disabled', false);

	if (typeof(WiseGuiUserScript) == 'function') {

		this.userScript = new WiseGuiUserScript();

		if (typeof(this.userScript) == 'object') {

			if ('start' in this.userScript && typeof(this.userScript.stop) == 'function') {
				this.userScript.start({
					experimentId : this.experimentId,
					outputDivId  : this.outputDivId,
					outputDiv    : this.outputDiv
				});
			}

		} else {
			alert("error");
		}
	}
};

WiseGuiScriptingView.prototype.stopUserScript = function() {

	this.editorStopButton.attr('disabled', true);
	this.editorStartButton.attr('disabled', false);

	if (this.userScript && "stop" in this.userScript && typeof(this.userScript.stop) == "function") {
		this.userScript.stop();
	}

	var userScriptDomElem = document.getElementById('WiseGuiUserScriptDomElem-' + this.experimentId);
	if (this.userScriptDomElem && userScriptDomElem) {
		document.body.removeChild(userScriptDomElem);
	}

	if (this.userScript) {
		delete this.userScript;
	}

	if (typeof(WiseGuiUserScript) != 'undefined') {
		delete WiseGuiUserScript;
	}
};

WiseGuiScriptingView.prototype.buildOutputView = function() {
	this.outputDiv = $('<div id="'+this.outputDivId+'"/>');
	this.outputView = this.outputDiv;
};