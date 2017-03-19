// var common = require(['./scripts/modules/common']);

// common.init();

// var uberData = {
// 	'apr14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-apr14.csv',
// 	'may14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-may14.csv',
// 	'jun14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-jun14.csv',
// 	'jul14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-jul14.csv',
// 	'aug14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-aug14.csv',
// 	'sep14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-sep14.csv',
// };

var drawMap = function(mapData, data, htmlID, color, lon, lat) {

    var container = $(htmlID);

    // data = _.chunk(data, 25000)[0];

    // console.log(data);

    // data.map(function(d) {
    // 	var day = moment(d["Date/Time"]).day();
    // 	console.log(day);
    // });

	/* draw map */
	var width = container.width(),
	    height = container.height(),
	    center = d3.geoCentroid(mapData),
	    offset = [width / 2, height / 2],
	    scale = 125000,
	    precision = 0.1

    var svg = d3.select(htmlID)
    		    .append('svg')
    			    .attr('width', width)
    			    .attr('height', height);

	// var color = d3.scaleSequential(d3.interpolateReds);
	// var color = d3.scaleOrdinal(d3.schemeCategory20);
	// var color = d3.scaleOrdinal(d3.schemePastel1);

	/* map projection */
	var projection = d3.geoMercator()
	// var projection = d3.geoAlbers()
	// var projection = d3.geoNaturalEarth()
					.scale(scale)
					// .translate([width / 2, height / 2]);
					.center(center)
					.precision(precision)
					.translate(offset);

	var path = d3.geoPath()
	    		.projection(projection);

	// var playersCount = _.countBy(data, key);

	// var maxCount = Math.max.apply(null, Object.keys(playersCount).map(function(key) { return playersCount[key]; }));

	// svg.append("defs").append("path")
	// 			    .datum({type: "Sphere"})
	// 			    .attr("id", "sphere")
	// 			    .attr("d", path);

	// svg.append("use")
	//     .attr("class", "bound")
	//     .attr("xlink:href", "#sphere");

	/* append to svg */
	svg.append('g')
	    .selectAll('path')
	    .data(mapData.features)
	    // .datum(mapData.features)
	    .enter().append('path')
		    .attr('fill', function(d) {
		    	// return color(d.properties.CTY_FIPS);
		    	return 'white';
		    })
		    .attr('d', path)
		    .attr('stroke', 'grey')
			.attr('stroke-width', 0.5)
		    .attr('class', function(d) { return d.id })
		    .append('title')
		    	.text(function(d) {
		        	return d.properties.borough;
		        	// return (_.isNil(playersCount[d.properties.name])) ? "" : d.properties.name + ": " + playersCount[d.properties.name];
		    	});

	// plotting points
    svg.selectAll('circle')
		.data(data)
		.enter().append('circle')
		.attr('r', '0.5px')
		// .attr('cx', function (d) { return projection([d.Lon, d.Lat])[0]; })
		// .attr('cy', function (d) { return projection([d.Lon, d.Lat])[1]; })
		.attr('transform', function(d) {
		            return 'translate(' + projection([d[lon], d[lat]]) + ')'; })
		            // return "translate(" + projection([d.Lon, d.Lat]) + ")"; })
		.attr('fill', function(d) {
			return color;
		});
}

var dataViz = function(errors, mapData, fhvBases, zones, uber, lyft) {

    if (errors) throw errors;

    // lyft = _.orderBy(lyft, ["time_of_trip"], ["asc"]);
    // lyft = _.orderBy(_.filter(lyft, function(d) { return (moment(new Date(d.time_of_trip)).month() === 8 && moment(new Date(d.time_of_trip)).date() === 1); }), ['time_of_trip'], ['asc']);
    // uber = _.orderBy(_.filter(uber, function(d) { return (moment(new Date(d['Date/Time'])).date() === 1); }), ['Date/Time'], ['asc']);

    // console.log(lyft);

    // drawMap(mapData, lyft, '#nyc-lyft', 'red', 'start_lng', 'start_lat');
    // drawMap(mapData, uber, '#nyc-uber', 'red', 'Lon', 'Lat');

    // console.log(moment(lyft[0]["time_of_trip"]).month() === 8);

    // var manhattan = _.filter(mapData.features, function(d) {
    // 	return d.properties.borough === "Manhattan";
    // });

    // var manhattan = {
    // 	"type": "FeatureCollection",
    // 	"features": manhattan
    // };

    // uber = _.filter(uber, function(d) {
    // 	console.log(d3.polygonContains(manhattan.features[1].geometry.coordinates, [d.Lon, d.Lat]));
    // 	// manhattan.features.map(function(polygon) {
    // 	// 	return (d3.polygonContains(polygon.geometry, [d.Lon, d.Lat])) ? true : false;
    // 	// });
    // });

    console.log(uber);

    // drawMap(manhattan, uber, '#nyc-uber', 'red', 'Lon', 'Lat');

    // console.log(manhattan);
}

// var pointInPolygon = function(point, vs) {
//     // ray-casting algorithm based on
//     // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
//     var xi, xj, i, intersect,
//         x = point[0],
//         y = point[1],
//         inside = false;
//     for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
//         xi = vs[i][0],
//             yi = vs[i][1],
//             xj = vs[j][0],
//             yj = vs[j][1],
//             intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
//         if (intersect) inside = !inside;
//     }
//     return inside;
// }

d3.queue()
	.defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/nyc.geo.json')
    .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv_bases.csv')
    .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/taxi-zone-lookup-with-ntacode.csv')
    // .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-jan-june15.csv')
    .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-sep14.csv')
    // .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv/Lyft_B02510.csv')
    .await(dataViz);

