// var common = require(['./scripts/modules/common']);

// common.init();

var uberData = {
	'apr14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-apr14.csv',
	'may14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-may14.csv',
	'jun14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-jun14.csv',
	'jul14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-jul14.csv',
	'aug14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-aug14.csv',
	'sep14' : 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-sep14.csv',
};

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
		.attr("transform", function(d) {
		            return "translate(" + projection([d[lon], d[lat]]) + ")"; })
		            // return "translate(" + projection([d.Lon, d.Lat]) + ")"; })
		.attr('fill', color);
}

var dataViz = function(errors, mapData, fhvBases, zones, uberSep14, lyft14) {

    if (errors) throw errors;

    // lyft14 = _.orderBy(lyft14, ["time_of_trip"], ["asc"]);
    lyft14 = _.orderBy(_.filter(lyft14, function(d) { return (moment(new Date(d.time_of_trip)).month() === 8 && moment(new Date(d.time_of_trip)).date() === 1); }), ["time_of_trip"], ["asc"]);
    uberSep14 = _.orderBy(_.filter(uberSep14, function(d) { return (moment(new Date(d["Date/Time"])).date() === 1); }), ["Date/Time"], ["asc"]);

    // console.log(lyft14);
    // console.log(uberSep14);

    drawMap(mapData, lyft14, '#nyc-lyft', "red", "start_lng", "start_lat");
    drawMap(mapData, uberSep14, '#nyc-uber', "red", "Lon", "Lat");

    // console.log(moment(lyft14[0]["time_of_trip"]).month() === 8);
}

d3.queue()
	.defer(d3.json, 'http://data.beta.nyc//dataset/3bf5fb73-edb5-4b05-bb29-7c95f4a727fc/resource/6df127b1-6d04-4bb7-b983-07402a2c3f90/download/f4129d9aa6dd4281bc98d0f701629b76nyczipcodetabulationareas.geo.json')
	// .defer(d3.json, "https://cdn.rawgit.com/johan/world.geo.json/master/countries.geo.json")
    // .defer(d3.json, "https://gist.githubusercontent.com/mbostock/8423351/raw/fb182232861027a6adecf8b2182ee7b3ef41c751/ny.json")
    .defer(d3.csv, 'https://raw.githubusercontent.com/toddwschneider/nyc-taxi-data/master/data/fhv_bases.csv')
    .defer(d3.csv, 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/taxi-zone-lookup.csv')
    .defer(d3.csv, 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/uber-trip-data/uber-raw-data-sep14.csv')
    .defer(d3.csv, 'https://raw.githubusercontent.com/fivethirtyeight/uber-tlc-foil-response/master/other-FHV-data/Lyft_B02510.csv')
    .await(dataViz);
