/**
 * Represents a location
 */
function Coordinate(latitude, longitude, x, y, z, phi, theta, rho) {

	// geographical coordinates
	this.latitude = latitude;
	this.longitude = longitude;

	// cartesian coordinates
	this.x = x;
	this.y = y;
	this.z = z;

	// spherical coordinates
	this.phi = phi;
	this.theta = theta;
	this.rho = rho;
}

/**
 * Represents a node and its location
 */
function Node(id, desc, c) {
	this.id = id;
	this.desc = desc;
	this.c = c;
	this.hasLatLng = function() {
		return c.latitude !== undefined && c.longitude !== undefined;
	};
}

/**
 * Parses WiseML
 */
var WiseGuiGoogleMapsView = function(wisemlParameter, parentDiv) {
	this.wiseml = wisemlParameter;
	this.origin = null;
	this.nodes = [];
	this.markersArray = [];
	this.map = null;
	this.infoWindows = {};
	this.view = null;
	this.parse();
	this.buildView(parentDiv);

};

WiseGuiGoogleMapsView.prototype.hasOrigin = function() {
	return this.origin.latitude !== undefined && this.origin.longitude !== undefined;
};

WiseGuiGoogleMapsView.prototype.parse = function() {

	if (!this.wiseml.setup || !this.wiseml.setup.origin || !this.wiseml.setup.origin.outdoorCoordinates) {
		this.origin = new Coordinate(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
	} else {
		var c = this.wiseml.setup.origin.outdoorCoordinates;
		this.origin = new Coordinate(
				(c.latitude == null ? undefined : c.latitude),
				(c.longitude == null ? undefined : c.longitude),
				(c.x == null ? undefined : c.x),
				(c.y == null ? undefined : c.y),
				(c.z == null ? undefined : c.z),
				(c.phi == null ? undefined : c.phi),
				(c.theta == null ? undefined : c.theta),
				(c.rho == null ? undefined : c.rho)
		);
	}

	this.wiseml.setup.node.forEach(this.addNodeIfHasPosition, this);
};

WiseGuiGoogleMapsView.prototype.addNodeIfHasPosition = function(node) {
	if (!node.position) {
		console.log("Not adding node \"%s\" to map as position data is missing", node.id);
	} else if (node.position.indoorCoordinates) {
		console.log("Not adding node \"%s\" to map as indoor coordinates are not supported", node.id);
	} else if (node.position.outdoorCoordinates) {
		var id = node.id;
		var coordinate = new Coordinate(
				node.position.outdoorCoordinates.latitude,
				node.position.outdoorCoordinates.longitude,
				node.position.outdoorCoordinates.x,
				node.position.outdoorCoordinates.y,
				node.position.outdoorCoordinates.z,
				node.position.outdoorCoordinates.phi,
				node.position.outdoorCoordinates.theta,
				node.position.outdoorCoordinates.rho
		);
		this.nodes.push(new Node(id, node.description, coordinate));
	}
};

WiseGuiGoogleMapsView.prototype.hasNodePositions = function() {
	for (var i=0; i<this.nodes.length; i++) {
		if (this.nodes[i].hasLatLng()) {
			return true;
		}
	}
	return false;
};

WiseGuiGoogleMapsView.prototype.buildView = function(parentDiv) {
	
	var hasNodePositions = this.hasNodePositions();
	var hasOrigin = this.hasOrigin();

	if (hasNodePositions || hasOrigin) {

		this.view = $('<div class="gMap" style="height:500px;"/>');
		parentDiv.append(this.view);

		this.initMap();

		// Delete old overlays
		this.deleteOverlays();

		if (hasNodePositions) {
			this.nodes.forEach(this.addMarker, this);
		}

		// Adjust map
		this.setBounds();
	} else {
		this.view = $('<div class="gMap" style="height:500px;">'
			+ '<span class="label label-warning">Map View Not Available</span>'
			+ '<p>'
			+ 'The testbed meta data does not contain any information about the testbeds location or the location '
			+ 'of the nodes therein. Therefore the map can not be rendered.'
			+ '</p>'
			+ '</div>');
		parentDiv.append(this.view);
	}
};

/**
 * Calculates latitude and longitude for a node.
 *
 * @param node a google.maps.LatLng instance
 */
WiseGuiGoogleMapsView.prototype.getLatLng = function(node) {
	if (node.c.latitude && node.c.longitude) {
		return new google.maps.LatLng(node.c.latitude, node.c.longitude);
	} else if (node.c.x && node.c.y && node.c.z) {
		console.log('Ignoring cartesian coordinates for map view for "%s": not implemented', node.id);
		return null;
	} else if (node.c.phi && node.c.theta && node.c.rho) {
		console.log('Ignoring spherical coordinates for map view for "%s": not implemented', node.id);
		return null;
	}
	return null;
};

/**
 * Adds a Marker to the map
 *
 */
WiseGuiGoogleMapsView.prototype.addMarker = function(node) {

	var markerLatLng = this.getLatLng(node);

	if (!markerLatLng) {
		return;
	}

	var marker = new google.maps.Marker({
		position : markerLatLng,
		map      : this.map,
		urn      : node.id,
		icon     : 'img/maps/red-dot.png'
	});

	this.infoWindows[node.id] = new google.maps.InfoWindow();
	this.infoWindowRenderer = function(key,value) {
		if (value == null || value === undefined) {
			return undefined;
		} else {
			return value;
		}
	};

	var infoWindowContent = '<h5>' + node.id + '</h5>'
					+ (JSON.stringify(node.c, this.infoWindowRenderer, '  ').replace(/\n/g, "<br/>") + '</br>')
					+ (node.desc ? node.desc + '</br>' : '');
	this.infoWindows[node.id].setContent(infoWindowContent);

	var self = this;
	this.mapSpiderfier.addListener('click', function(marker, event) {
		for (var nodeUrn in self.infoWindows) {
			self.infoWindows[nodeUrn].close();
		}
		self.infoWindows[marker.urn].open(self.map, marker);
	});

	this.markersArray.push(marker);
	this.mapSpiderfier.addMarker(marker);
	this.markerCluster.addMarker(marker);
};

/**
 * Initializes the google map
 *
 */
WiseGuiGoogleMapsView.prototype.initMap = function() {

	var self = this;
	var latlng = this.hasOrigin() ?
			new google.maps.LatLng(this.origin.latitude, this.origin.longitude) :
			new google.maps.LatLng(0, 0);

	var myOptions = {
		zoom : 17,
		center : latlng,
		mapTypeId : google.maps.MapTypeId.HYBRID
	};

	this.markersArray = [];
	this.map = new google.maps.Map(this.view.get()[0], myOptions);

	var spiderfierOptions = {
		markersWontMove: false,
		markersWontHide: true,
		keepSpiderfied:  true,
		nearByDistance:  10
	};
	this.mapSpiderfier = new OverlappingMarkerSpiderfier(this.map, spiderfierOptions);

	var clusterOptions = {
		//maxZoom:     19,
		gridSize:    10,
		zoomOnClick: false
    };
	this.markerCluster = new MarkerClusterer(this.map, [], clusterOptions);

	// handle clicks on clusters: zoom to cluster or spiderfy if near enough
	google.maps.event.addListener(this.markerCluster, "click", function (c) {

		var hideAndSpiderfy = function() {
			var clustered = c.getMarkers();
			$.each(clustered, function(index, marker) {
				marker.setMap(self.map);
			});
			c.clusterIcon_.hide();
			google.maps.event.trigger(clustered[0], 'click');
		};

		if ( self.map.getZoom() > 19 ) {
			hideAndSpiderfy();
		} else {
			self.map.fitBounds(c.getBounds());
		}
		
	});

	this.mapSpiderfier.addListener('unspiderfy', function(markers) {
		self.markerCluster.repaint();
	});
};

/**
 * Deletes all markers in the array by removing references to them
 *
 */
WiseGuiGoogleMapsView.prototype.deleteOverlays = function() {

	$.each(this.markersArray, function(index, marker) {
		marker.setMap(null);
	});

	this.markersArray = [];
	this.mapSpiderfier.clearMarkers();
	this.markerCluster.clearMarkers();
};

/**
 * Centers, pans and zooms the map such that all markers are visible
 *
 */
WiseGuiGoogleMapsView.prototype.setBounds = function() {

	if (this.markersArray.length > 1) {
		var bounds = new google.maps.LatLngBounds();

		$.each(this.markersArray, function(index, marker) {
			bounds.extend(marker.getPosition());
		});

		this.map.fitBounds(bounds);

	} else if (this.markersArray.length == 1) {
		this.map.setCenter(this.markersArray[0].getPosition());
	}
};

/**
 * Produces rdf from the nodes
 *
 */
WiseGuiGoogleMapsView.prototype.rdf = function() {
	var rdf = "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n";

	for (var j = 0; j < nodes.length; j++) {
		rdf += "<" + nodes[j].id + "> ";
		rdf += "<" + predLat + "> ";
		rdf += "\"" + nodes[j].c.x + "\"^^xsd:double .\n";
		rdf += "<" + nodes[j].id + "> ";
		rdf += "<" + predLong + "> ";
		rdf += "\"" + nodes[j].c.y + "\"^^xsd:double .\n";
	}
	return rdf;
};
