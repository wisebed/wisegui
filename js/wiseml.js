/**
 * Parses WiseML
 *
 */
var WiseMLParser = function(wisemlParameter, parentDiv) {
	this.wiseml = wisemlParameter;
	this.origin = null;
	this.predLat = "http://www.w3.org/2003/01/geo/wgs84_pos#lat";
	this.predLong = "http://www.w3.org/2003/01/geo/wgs84_pos#long";
	this.nodes = [];
	this.markersArray = [];
	this.map = null;
	this.infoWindows = {};

	this.view = null;

	this.parse();
	this.buildView(parentDiv);

};

WiseMLParser.prototype.parse = function() {

	if (!this.wiseml.setup || !this.wiseml.setup.origin || !this.wiseml.setup.origin.outdoorCoordinates) {
		this.origin = new Coordinate(0, 0, 0, 0, 0, 0, 0, 0);
		return;
	}

	this.origin = new Coordinate(
			this.wiseml.setup.origin.outdoorCoordinates.latitude,
			this.wiseml.setup.origin.outdoorCoordinates.longitude,
			this.wiseml.setup.origin.outdoorCoordinates.x,
			this.wiseml.setup.origin.outdoorCoordinates.y,
			this.wiseml.setup.origin.outdoorCoordinates.z,
			this.wiseml.setup.origin.outdoorCoordinates.phi,
			this.wiseml.setup.origin.outdoorCoordinates.theta,
			this.wiseml.setup.origin.outdoorCoordinates.rho
	);

	this.wiseml.setup.node.forEach(this.addNodeIfHasPosition, this);
};

WiseMLParser.prototype.addNodeIfHasPosition = function(node) {
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

WiseMLParser.prototype.buildView = function(parentDiv) {
	this.view = $('<div class="gMap" style="height:500px;"/>');
	parentDiv.append(this.view);

	this.initMap();

	// Delete old overlays
	this.deleteOverlays();
	this.nodes.forEach(this.addMarker, this);

	// Adjust map
	this.setBounds();
};

/**
 * Adds a Marker to the map
 *
 */
WiseMLParser.prototype.addMarker = function(node) {

	var markerLatLng = new google.maps.LatLng(node.c.latitude, node.c.longitude);

	// Sample custom marker code created with Google Map Custom Marker Maker
	// http://powerhut.co.uk/googlemaps/custom_markers.php

	var image = new google.maps.MarkerImage(
			'img/node.png',
			new google.maps.Size(25, 19),
			new google.maps.Point(0, 0),
			new google.maps.Point(13, 19)
	);

	var shadow = new google.maps.MarkerImage(
			'img/node_shadow.png',
			new google.maps.Size(39, 19),
			new google.maps.Point(0, 0),
			new google.maps.Point(13, 19)
	);

	var shape = {
		coord : [
			18, 2, 20, 3, 22, 4, 23, 5, 23, 6, 22, 7, 21, 8, 20, 9, 19, 10, 18, 11, 16, 12, 16, 13, 14, 14, 14, 15, 14,
			16, 11, 16, 11, 15, 11, 14, 9, 13, 9, 12, 7, 11, 7, 10, 5, 9, 4, 8, 2, 7, 2, 6, 2, 5, 3, 4, 5, 3, 7, 2, 18,
			2
		],
		type : 'poly'
	};

	var marker = new google.maps.Marker({
		position : markerLatLng,
		map : this.map,
		title : "Sensor: " + node.id,
		icon : image,
		shadow : shadow,
		shape : shape,
		urn : node.id
	});

	this.infoWindows[node.id] = new google.maps.InfoWindow();
	this.infoWindows[node.id].setContent(
			'<h5>' + node.id + '</h5>'
			+ (JSON.stringify(node.c) + '</br>')
			+ (node.desc ? node.desc + '</br>' : '')
	);

	var self = this;
	google.maps.event.addListener(marker, 'click', function() {
		for (var nodeUrn in self.infoWindows) {
			self.infoWindows[nodeUrn].close();
		}
		self.infoWindows[node.id].open(self.map, marker);
	});

	this.markersArray.push(marker);
};

/**
 * Initializes the google map
 *
 */
WiseMLParser.prototype.initMap = function() {
	// House 64
	var latlng = new google.maps.LatLng(0, 0);

	var myOptions = {
		zoom : 17,
		center : latlng,
		mapTypeId : google.maps.MapTypeId.HYBRID
	};

	this.markersArray = [];
	this.map = new google.maps.Map(this.view.get()[0], myOptions);
};

/**
 * Deletes all markers in the array by removing references to them
 *
 */
WiseMLParser.prototype.deleteOverlays = function() {

	$.each(this.markersArray, function(index, marker) {
		marker.setMap(null);
	});

	this.markersArray = [];
};

/**
 * Centers, pans and zooms the map such that all markers are visible
 *
 */
WiseMLParser.prototype.setBounds = function() {

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
WiseMLParser.prototype.rdf = function() {
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

/**
 * Represents a location
 *
 */
function Coordinate(latitude, longitude, x, y, z, phi, theta, rho) {
	this.latitude = latitude;
	this.longitude = longitude;
	this.x = x;
	this.y = y;
	this.z = z;
	this.phi = phi;
	this.theta = theta;
	this.rho = rho;
}

/**
 * Represents a node and its location
 *
 */
function Node(id, desc, c) {
	this.id = id;
	this.desc = desc;
	this.c = c;
}

/**
 * Helper class with functions for location-calculations
 *
 */
var coordinates = {
	WGS84_CONST : 298.257222101,
	WGS84_ALPHA : 0.003352810681182319,
	WGS84_A : 6378137.0,
	WGS84_B : 6356752.314140356,
	WGS84_C : 6399593.625864023,

	blh2xyz : function(coordinate) {
		var roh = Math.PI / 180.0;

		var i = (this.WGS84_A * this.WGS84_A) - (this.WGS84_B * this.WGS84_B);
		var e = Math.sqrt(i / (this.WGS84_B * this.WGS84_B));

		var b = coordinate.x * roh;
		var l = coordinate.y * roh;

		var eta2 = e * e * Math.pow(Math.cos(b), 2);
		var v = Math.sqrt(1.0 + eta2);
		var n = this.WGS84_C / v;

		var h = coordinate.z;
		var x = (n + h) * Math.cos(b) * Math.cos(l);
		var y = (n + h) * Math.cos(b) * Math.sin(l);
		var z = (Math.pow(this.WGS84_B / this.WGS84_A, 2) * n + h)
				* Math.sin(b);
		return new Coordinate(x, y, z, coordinate.phi, coordinate.theta);
	},

	xyz2blh : function(coordinate) {
		var x = coordinate.x;
		var y = coordinate.y;
		var z = coordinate.z;

		var roh = 180.0 / Math.PI;

		var e0 = (this.WGS84_A * this.WGS84_A) - (this.WGS84_B * this.WGS84_B);
		var e1 = Math.sqrt(e0 / (this.WGS84_A * this.WGS84_A));
		var e2 = Math.sqrt(e0 / (this.WGS84_B * this.WGS84_B));

		var p = Math.sqrt((x * x) + (y * y));

		var theta = Math.atan((z * this.WGS84_A) / (p * this.WGS84_B));

		var l = Math.atan(y / x) * roh;
		var b = Math
				.atan((z + (e2 * e2 * this.WGS84_B * Math.pow(Math.sin(theta),
						3)))
						/ (p - (e1 * e1 * this.WGS84_A * Math.pow(Math
						.cos(theta), 3))));

		var eta2 = e2 * e2 * Math.pow(Math.cos(b), 2);
		var v = Math.sqrt(1.0 + eta2);
		var n = this.WGS84_C / v;

		var h = (p / Math.cos(b)) - n;
		return new Coordinate(b * roh, l, h, coordinate.phi, coordinate.theta);
	},

	toRad : function(phi) {
		return phi * Math.PI / 180;
	},

	rotate : function(coordinate, phi) {
		var rad = this.toRad(phi);
		var cos = Math.cos(rad);
		var sin = Math.sin(rad);
		var x = coordinate.x * cos - coordinate.y * sin;
		var y = coordinate.y * cos + coordinate.x * sin;
		return new Coordinate(x, y, coordinate.z, coordinate.phi,
				coordinate.theta);
	},

	absolute : function(origin, coordinate) {
		var y = coordinate.y + origin.y;
		var x = coordinate.x + origin.x;
		return new Coordinate(x, y, origin.z, origin.phi, origin.theta);
	}
}
