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
	    scale = 75000,
	    precision = 0.1;

    var svg = d3.select(htmlID)
    		    .append('svg')
    			    .attr('width', width)
    			    .attr('height', height);

	// var color = d3.scaleSequential(d3.interpolateReds);
	// var color = d3.scaleOrdinal(d3.schemeCategory20);

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
		.attr('fill', function(d) {
			return color;
		});

	// return [svg, projection];
}

var dataViz = function(errors, mapData, fhvBases, zones, uber, lyft) {

    if (errors) throw errors;

    // lyft = _.orderBy(lyft, ["time_of_trip"], ["asc"]);
    // lyft = _.orderBy(_.filter(lyft, function(d) { return (moment(new Date(d.time_of_trip)).month() === 8 && moment(new Date(d.time_of_trip)).date() === 1); }), ['time_of_trip'], ['asc']);

    var days = [];

    var uber = _.orderBy(_.filter(uber, function(d) { return (moment(new Date(d['Date/Time'])).date() === 1); }), ['Date/Time'], ['asc']);

    // for (var i = 1; i <= 30; i++) {
    // 	days[i] = _.orderBy(_.filter(uber, function(d) { return (moment(new Date(d['Date/Time'])).date() === i); }), ['Date/Time'], ['asc']);
    // }

    // drawMap(mapData, lyft, '#nyc-lyft', 'red', 'start_lng', 'start_lat');
    // drawMap(mapData, uber, '#nyc-uber', 'red', 'Lon', 'Lat');

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

    // var uberJan15 = _.filter(uber, function(d) {
    // 	return (moment(new Date(d.Pickup_date)).month() === 0);
    // });

    // var map = drawMap(mapData, uber, '#nyc-uber', 'red', 'Lon', 'Lat');

    drawMap(mapData, uber, '#nyc-uber', 'red', 'Lon', 'Lat');

    // for (var i = 1; i <= days.length; i++) {

    // 	var projection = map[1];

    //     map[0].selectAll('circle')
    // 		.data(days[i])
    // 		.enter().append('circle')
    // 		.attr('r', '0.5px')
    // 		// .attr('cx', function (d) { return projection([d.Lon, d.Lat])[0]; })
    // 		// .attr('cy', function (d) { return projection([d.Lon, d.Lat])[1]; })
    // 		.attr('transform', function(d) { return 'translate(' + projection([d.Lon, d.Lat]) + ')'; })
    // 		.attr('fill', "red");

    // }

}

// var getData = function() {
// 	var months = [0, 1, 2, 3, 4, 5];

// 	for (var i = 0; i < months.length; i++) {
// 		for (var j = 1; j <= 2; j++) {
// 			months[i] = getMonth("https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-jan-june15/" + j + ".csv", i);
// 		}
// 		// var uberJan15;
// 		// d3.csv("https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-jan-june15/" + i + ".csv", function(data) {
// 		// 	var tmp = _.filter(data, function(d) {
// 		// 	    return (moment(new Date(d.Pickup_date)).month() === 1);
// 		// 	});
// 		// 	uberJan15 = _.union(uberJan15, tmp);

// 		// 	var args = {
// 		// 		data: uberJan15,
// 		// 		filename: 'uberJan15.csv'
// 		// 	};
// 		// 	downloadCSV(args);
// 		// });
// 	}

// };

// var getMonth = function(url, month) {
// 	d3.csv(url, function(data) {
// 		month = _.filter(data, function(d) {
// 		    return (moment(new Date(d.Pickup_date)).month() === month);
// 		});
// 		return month;
// 	});
// }

d3.queue()
	.defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/nyc.geo.json')
    .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv_bases.csv')
    .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/taxi-zone-lookup-with-ntacode.csv')
    // .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-jan-june15/1.csv')
    .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-sep14.csv')
    // .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv/Lyft_B02510.csv')
    .await(dataViz);

