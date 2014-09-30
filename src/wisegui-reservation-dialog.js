var WiseGuiNodeTable = require('./wisegui-node-table.js');
var WiseGuiGoogleMapsView = require('./wisegui-google-maps-view.js');
var WiseGuiNodeSelectionSaveButton = require('./wisegui-nodeselection-save-button.js');
var WiseGuiNodeSelectionLoadButton = require('./wisegui-nodeselection-load-button.js');

/**
 * #################################################################
 * WiseGuiReservationDialog
 * #################################################################
 */

var WiseGuiReservationDialog = function() {
	this.table = null;
	this.view = $('<div id="WiseGuiReservationDialog" class="modal hide reservation"></div>');
	$(document.body).append(this.view);
	this.buildView();
	this.show();
};

WiseGuiReservationDialog.prototype.hide = function() {
	this.view.modal('hide');
};

WiseGuiReservationDialog.prototype.show = function() {
	this.view.modal('show');
};

WiseGuiReservationDialog.prototype.buildView = function() {

	Array.prototype.diff = function(a) {
	    return this.filter(function(i) { return a.indexOf(i) <= -1; });
	};

	var that = this;

	var dialogHeader = $('<div class="modal-header"><h3>Make a reservation</h3></div>');

	var now = new Date();
	now.setSeconds(0);

	var format = function(val) {
		// Prepend a zero
		if(val >=0 && val <= 9) {
			return "0" + val;
		} else {
			return val;
		}
	};

	var yyyy = now.getFullYear();
	var mm = (now.getMonth());
	var dd = now.getDate();
	var ii = now.getMinutes();
	var hh = now.getHours();

	// Hint: it works even over years
	var in_one_hour = new Date(yyyy,mm,dd,hh+1,ii,0);

	var date_start = format(dd) + "." + format(mm+1) + "." + yyyy;
	var time_start = format(hh) + ":" + format(ii);

	var date_end = format(in_one_hour.getDate()) + "." + format(in_one_hour.getMonth() +1) + "." + in_one_hour.getFullYear();
	var time_end = format(in_one_hour.getHours()) + ":" + format(in_one_hour.getMinutes());

	
	// Create the inputs
	var input_date_start = $('<input type="text" value="' + date_start + '" id="input_date_start" style="width:75px"/>');
	var input_time_start = $('<input type="text" value="' + time_start + '" id="input_time_start" style="width:40px"/>');
	var input_date_end =   $('<input type="text" value="' + date_end + '" id="input_date_end" style="width:75px"/>');
	var input_time_end =   $('<input type="text" value="' + time_end + '" id="input_time_end" style="width:40px"/>');
	var input_desciption = $('<input type="text" id="description" style="width:280px"/>');

	var p_nodes = $("<p></p>");

	var tabs = $(
			'<ul class="nav nav-tabs">' +
			'	<li class="active"><a href="#WiseGuiTestbedMakeReservationList" data-toggle="tab">List</a></li>' +
			'	<li><a href="#WiseGuiTestbedMakeReservationMap" data-toggle="tab">Map</a></li>' +
			'</ul>' +
			'<div class="tab-content">' +
			'	<div class="tab-pane active" id="WiseGuiTestbedMakeReservationList"></div>' +
			'	<div class="tab-pane" id="WiseGuiTestbedMakeReservationMap"></div>' +
			'</div>'
	);
	
	tabs.find('#WiseGuiTestbedMakeReservationList').append(p_nodes);

	tabs.find('a').click(function (e) {
		e.preventDefault();
		$(this).tab('show');
	});

	var showTable = function (wiseML) {
		that.table = new WiseGuiNodeTable(wiseML, p_nodes, true, true);
	};
	
	var createMap = function() {
		wisebed.getWiseMLAsJSON(null, showMap,
				function(jqXHR, textStatus, errorThrown) {
					console.log('TODO handle error in WiseGuiReservationDialog');
					WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
				}
		);
	};

	wisebed.getWiseMLAsJSON(null, showTable,
			function(jqXHR, textStatus, errorThrown) {
				console.log('TODO handle error in WiseGuiReservationDialog');
				WiseGui.showAjaxError(jqXHR, textStatus, errorThrown);
			}, createMap
	);

	 //Show specialized google map for reservation 
	var showMap = function(wiseML){
		
		that.mapsView = new WiseGuiGoogleMapsView(wiseML, tabs.find('#WiseGuiTestbedMakeReservationMap'));
		var mapsView = that.mapsView;

		if (mapsView.map !== null) {

			mapsView.map.enableKeyDragZoom();
			mapsView.map.selectedURNs = [];
			
			var ICON_SELECTED   = 'img/maps/yellow-dot.png';
			var ICON_DESELECTED = 'img/maps/red-dot.png';
			
			$.each(mapsView.markersArray, function (index, marker) {

				mapsView.mapSpiderfier.clearListeners('click');
				mapsView.mapSpiderfier.addListener('click', function(marker, event) {

					if (marker.getIcon() == ICON_SELECTED){
						mapsView.map.selectURNs([marker.urn], true);
					} else {
						mapsView.map.selectURNs([marker.urn], false);
					}

					var selectedFun = function(data) {
						var nodeids = mapsView.map.selectedURNs;
						for(var i = 0; i < nodeids.length; i++) {
							if(data.id == nodeids[i]) return true;
						}
						return false;
					};

					that.table.applySelected(selectedFun);
				});
	        });
			
			mapsView.map.selectURNs = function(urns, deselect){
				
				//loop over markers and set new image
				$.each(mapsView.markersArray, function (index, marker) {
					if (urns.indexOf(marker.urn) > -1) {
						marker.setIcon(deselect ? ICON_DESELECTED : ICON_SELECTED);
					}
	            });
				
				//loop over selected urns and insert them to model if necessary
				$.each(urns, function(idx, urn) {
					var index = mapsView.map.selectedURNs.indexOf(urn);
					if(index == -1) {
						if (!deselect) {
							mapsView.map.selectedURNs.push(urn);
						} else {
							mapsView.map.selectedURNs.splice(index,1);
						}
					} else {
						if (deselect) {
							mapsView.map.selectedURNs.splice(index,1);
						}
					}	
				});
			};

			//Filter out all markers but the ones with the urns given
			mapsView.map.filter = function(urns){
				//loop over markers and set new image
				var markersArray = mapsView.markersArray;
				$.each(markersArray, function (index, marker) {
					if(urns.indexOf(marker.urn)==-1){
			            marker.setMap(null);
					}else{
						marker.setMap(mapsView.map);
					}
			    });
			};
			
			that.table.table.addSelectionListener(mapsView.map.selectURNs);
			that.table.table.addFilterListener(mapsView.map.filter);
			
			var dz = mapsView.map.getDragZoomObject();
			
			google.maps.event.addListener(dz, 'dragend', function(bounds) {       
	            var selectedURNs = [];
	            var deselectedURNs = [];
	            
	            // get nodes that have been (de-)selected
	            mapsView.markersArray.forEach(function(marker) {
	            	if (bounds.contains(marker.getPosition()) && marker.getMap() !== null) {
	                    if (marker.getIcon() == ICON_DESELECTED) {
	                    	selectedURNs.push(marker.urn);
	                    } else {
	                    	deselectedURNs.push(marker.urn);
	                    }
	                }
	            });
	            
	            // update the map
	            mapsView.map.selectURNs(selectedURNs);
	            mapsView.map.selectURNs(deselectedURNs, true);
	            
	            //remove all deselected nodes
	            mapsView.map.selectedURNs = mapsView.map.selectedURNs.diff(deselectedURNs);
	            //update selection in table
	            var selectedFun =function(data) {
					var nodeids = mapsView.map.selectedURNs;
					for(var i = 0; i < nodeids.length; i++) {
						if(data.id == nodeids[i]) return true;
					}
					return false;
				};
	            
	           that.table.applySelected(selectedFun);
	    	});
			
			tabs.find('li a[href=#WiseGuiTestbedMakeReservationMap]').on('shown', function(e) {
				google.maps.event.trigger(that.mapsView.map, 'resize');
				that.mapsView.setBounds();
			});
		}
	};

	tabs.find('#WiseGuiTestbedMakeReservationMap').append("<h4>Click on single nodes or Shift+Click for bounding box</h4>");

	// Add the picker
    input_date_start.datepicker({dateFormat: 'dd.mm.yy'});
    input_date_end.datepicker({dateFormat: 'dd.mm.yy'});
    input_time_start.timePicker({step: 5});
    input_time_end.timePicker({step: 5});

    var h4_nodes = $("<h4>Select the nodes to reserve</h4>");

    var onError = function (msg) {

		dialogBody.prepend($(
			'<div class="alert alert-error">' +
			'	<a class="close" data-dismiss="alert" href="#">&times;</a>' +
			' <p>'+msg+'</p>' +
			'</div>'
		));

		okButton.removeAttr("disabled");
		cancelButton.removeAttr("disabled");
    };

    var span_start = $('<span>Start: </span>');
    var span_end = $('<span style="margin-left:10px;">End: </span>');
    var span_description = $('<span style="margin-left:10px;">Description: </span>');

	var dialogBody = $('<div class="modal-body reservation-body"/></div>');
	dialogBody.append(span_start, input_date_start, input_time_start);
	dialogBody.append(span_end, input_date_end, input_time_end);
	dialogBody.append(span_description, input_desciption);
	
	dialogBody.append(h4_nodes);
	dialogBody.append(tabs);

	
	var okButton = $('<input class="btn btn-primary" value="Reserve" style="width:50px;text-align:center;">');
	var cancelButton = $('<input class="btn" value="Cancel" style="width:45px;text-align:center;">');

	okButton.bind('click', this, function(e) {

		okButton.attr("disabled", "true");
		cancelButton.attr("disabled", "true");

		input_date_start.removeClass("error");
		input_date_end.removeClass("error");
		input_time_start.removeClass("error");
		input_time_end.removeClass("error");

		var dateStart = explode(".", input_date_start.val());
		var dateEnd = explode(".", input_date_end.val());

		var timeStart = explode(":", input_time_start.val());
		var timeEnd = explode(":", input_time_end.val());

		var nodes = that.table.getSelectedNodes();

		if(dateStart.length != 3) {
			input_date_start.addClass("error");
			onError("Start date incorrect.");
			return;
		} else if (dateEnd.length != 3) {
			input_date_end.addClass("error");
			onError("End date incorrect.");
			return;
		} else if (timeStart.length != 2) {
			input_time_start.addClass("error");
			onError("Start time incorrect.");
			return;
		} else if (timeEnd.length != 2){
			input_time_end.addClass("error");
			onError("End time incorrect.");
			return;
		}

		var from = new Date(dateStart[2], dateStart[1]-1, dateStart[0], timeStart[0], timeStart[1], 0);
		var to = new Date(dateEnd[2], dateEnd[1]-1, dateEnd[0], timeEnd[0], timeEnd[1], 0);

		if(to <= from) {
			input_date_start.addClass("error");
			input_date_end.addClass("error");
			input_time_start.addClass("error");
			input_time_end.addClass("error");
			onError("End date must after the start date.");
			return;
		} else if(nodes.length <= 0) {
			onError("You must select at least one node");
			return;
		}

		var callbackError = function(jqXHR, textStatus, errorThrown) {
			onError(jqXHR.responseText);
		};

		var callbackDone = function() {

			okButton.removeAttr("disabled");
			cancelButton.removeAttr("disabled");

			that.hide();

			// Refresh the reservation table
			$(window).trigger('wisegui-reservations-changed');

			// Refresh the experiments tab in the menu
			$(window).trigger('wisegui-navigation-event', getNavigationData());
		};

		// TODO support key-value pairs in "options" field
		wisebed.reservations.make(
			from,
			to,
			nodes,
			input_desciption.val(),
			[],
			callbackDone,
		    callbackError
		);
	});

	cancelButton.bind('click', this, function(e) {
		e.data.hide();
	});

	var nodeSelectionSaveButton = new WiseGuiNodeSelectionSaveButton(function() {
		return that.table.getSelectedNodes();
	});

	var nodeSelectionLoadButton = new WiseGuiNodeSelectionLoadButton(function(selection) {
		that.table.setSelectedNodes(selection);
	});

	var dialogFooter = $('<div class="modal-footer"/>');
	dialogFooter.append(nodeSelectionLoadButton.view, nodeSelectionSaveButton.view, okButton, cancelButton);
	this.view.append(dialogHeader, dialogBody, dialogFooter);
};

module.exports = WiseGuiReservationDialog;