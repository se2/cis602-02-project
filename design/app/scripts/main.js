var drawMap = function(mapData, data, zones, months, htmlID, lon, lat) {

    var container = $(htmlID);
    var totalUberPickups = $("#totalUberPickups");
    var monthOf2015 = $("#monthOf2015");
    var month = months[0];

    var data = _.orderBy(_.filter(data, function(d) { return (moment(new Date(d['Pickup_date'])).month() === month.key); }), ['Pickup_date'], ['asc']);

    _.each(data, o => _.each(o, (v, k) => o[k] = v.trim()));

    data = data.map(function(o) {
        var ntacode = "";
        zones.map(function(z) {
            if (z.location_id === o.locationID) {
                ntacode = z.ntacode;
            }
        });
        o["ntacode"] = ntacode;
        return o;
    });

    var dataCount = _.map(_.countBy(data, "ntacode"), function(value, key) { return { key: key, value: value }; });
    var maxDataCount = _.maxBy(dataCount, function(o) { return o.value; });

    console.log(maxDataCount);

    totalUberPickups.html(data.length);
    monthOf2015.html(month.value);

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

	var color = d3.scaleSequential(d3.interpolateReds);
	// var color = d3.scaleOrdinal(d3.schemeCategory20);

	/* map projection */
	var projection = d3.geoMercator()
	// var projection = d3.geoAlbers()
	// var projection = d3.geoNaturalEarth()
					.scale(scale)
					.center(center)
					.precision(precision)
					.translate(offset);

	var path = d3.geoPath()
	    		.projection(projection);

	/* append to svg */
	svg.append('g')
	    .selectAll('path')
	    .data(mapData.features)
	    .enter().append('path')
		    .attr('fill', function(d) {
                var colorScale = 0;
                dataCount.map(function(o) {
                    if (o.key == d.properties.NTACode) {
                        colorScale = (o.value / maxDataCount.value);
                    }
                });
                return (colorScale == 0) ? "white" : color(colorScale);
		    })
		    .attr('d', path)
		    .attr('stroke', 'grey')
			.attr('stroke-width', 0.5)
		    .attr('class', function(d) { return d.id })
		    .append('title')
		    	.text(function(d) {
                    var numPickups = 0;
                    var title = _.split(_.replace(_.replace(d.properties.NTAName, /etc-/, ""), /-/g, "/"), "/");
                    dataCount.map(function(o) {
                        if (o.key == d.properties.NTACode) {
                            numPickups = o.value;
                        }
                    });
                    title = title.map(function(t) {
                        return _.capitalize(t);
                    });
                    return _.join(title, "/") + ": " + numPickups;
                    // return d.properties.NTACode + ": " + numPickups;
		    	});

	// plotting points
  //   svg.selectAll('circle')
		// .data(data)
		// .enter().append('circle')
		// .attr('r', '0.5px')
		// // .attr('cx', function (d) { return projection([d.Lon, d.Lat])[0]; })
		// // .attr('cy', function (d) { return projection([d.Lon, d.Lat])[1]; })
		// .attr('transform', function(d) {
		//             return 'translate(' + projection([d[lon], d[lat]]) + ')'; })
		// .attr('fill', function(d) {
		// 	return color;
		// });

}

var dataViz = function(errors, mapData, fhvBases, zones, uber) {

    if (errors) throw errors;

    var months = [
        { "key": 0, "value": "January 2015" },
        { "key": 1, "value": "February 2015" },
        { "key": 2, "value": "March 2015" },
        { "key": 3, "value": "April 2015" },
        { "key": 4, "value": "May 2015" },
        { "key": 5, "value": "June 2015" },
    ];

    // lyft = _.orderBy(lyft, ["time_of_trip"], ["asc"]);
    // lyft = _.orderBy(_.filter(lyft, function(d) { return (moment(new Date(d.time_of_trip)).month() === 8 && moment(new Date(d.time_of_trip)).date() === 1); }), ['time_of_trip'], ['asc']);

    // var uber = _.orderBy(_.filter(uber, function(d) { return (moment(new Date(d['Date/Time'])).date() === 1); }), ['Date/Time'], ['asc']);
    // var uber = _.orderBy(_.filter(uber, function(d) { return (moment(new Date(d['Pickup_date'])).month() === months[0]["key"]); }), ['Pickup_date'], ['asc']);

    // var manhattan = _.filter(mapData.features, function(d) {
    //  return d.properties.borough === "Manhattan";
    // 	return d.properties.BoroName === "Manhattan";
    // });

    // mapData = {
    // 	"type": "FeatureCollection",
    // 	"features": manhattan
    // };

    // drawMap(mapData, lyft, '#nyc-lyft', 'red', 'start_lng', 'start_lat');
    drawMap(mapData, uber, zones, months, '#nyc-uber', 'Lon', 'Lat');

}

d3.queue()
    // .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/nyc.geo.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/design/nyc.geo.2.json')
    .defer(d3.csv,  'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv_bases.csv')
    .defer(d3.csv,  'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/taxi-zone-lookup-with-ntacode.csv')
    .defer(d3.csv,  'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-jan-june15/1.csv')
    // .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-sep14.csv')
    // .defer(d3.csv, 	'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv/Lyft_B02510.csv')
    .await(dataViz);

