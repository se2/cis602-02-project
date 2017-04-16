var drawMap = function(mapData, data, totalData, htmlID, totalLabelID) {

    var container = $(htmlID);
    var totalPickups = $(totalLabelID);

    // var data = _.orderBy(_.filter(data, function(d) {
    //     return (moment(new Date(d['Pickup_date'])).month() === month.key); }), ['Pickup_date'], ['asc']);

    // _.each(data, o => _.each(o, (v, k) => o[k] = v.trim()));

    // data = data.map(function(o) {
    //     var ntacode = "";
    //     zones.map(function(z) {
    //         if (z.location_id === o.locationID) {
    //             ntacode = z.ntacode;
    //         }
    //     });
    //     o["ntacode"] = ntacode;
    //     return o;
    // });

    // var dataCount = _.orderBy(_.map(_.countBy(data, "ntacode"), function(value, key) { return { key: key, value: value }; }), "value", "desc");
    var maxData = _.maxBy(data, function(o) { return o.value; });

    var total = 0;
    _.each(mapData.features, function(d) {
        _.each(data, function(o) {
            if (o.key == d.properties.NTACode) {
                total += o.value;
            }
        });
    });

    totalPickups.html(numeral(total).format());

    /* draw map */
    var width = container.width(),
        height = container.height(),
        center = d3.geoCentroid(mapData),
        offset = [width / 2, height / 2],
        // scale = 75000,
        scale = 150000,
        precision = 0.1;

    var svg = d3.select(htmlID)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var color = d3.scaleSequential(d3.interpolateReds);

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
            data.map(function(o) {
                if (o.key == d.properties.NTACode) {
                    colorScale = (o.value / maxData.value);
                }
            });
            return (colorScale == 0) ? "white" : color(colorScale);
        })
        .attr('d', path)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.5)
        .attr('class', function(d) {
            return d.id })
        .append('title')
        .text(function(d) {
            var numPickups = 0;
            var title = _.split(_.replace(_.replace(d.properties.NTAName, /etc-/, ""), /-/g, "/"), "/");
            data.map(function(o) {
                if (o.key == d.properties.NTACode) {
                    numPickups = o.value;
                }
            });
            title = title.map(function(t) {
                return _.capitalize(t);
            });
            return _.join(title, "/") + ": " + numeral(numPickups).format();
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
    //  return color;
    // });

}

var dataViz = function(errors, mapData, fhvBases, zones, uber1, uber2, uber3, uber4, uber5, uber6, fhv1, fhv2, fhv3, fhv4, fhv5, fhv6) {

    if (errors) throw errors;

    var months = [
        { "key": 0, "value": "January 2015" },
        { "key": 1, "value": "February 2015" },
        { "key": 2, "value": "March 2015" },
        { "key": 3, "value": "April 2015" },
        { "key": 4, "value": "May 2015" },
        { "key": 5, "value": "June 2015" },
    ];

    var uber = countValues(_.union(uber1, uber2, uber3, uber4, uber5, uber6), "value");
    var fhv = countValues(_.union(fhv1, fhv2, fhv3, fhv4, fhv5, fhv6), "value");
    var total = countValues(_.union(uber, fhv), "value");

    console.log(total);

    // lyft = _.orderBy(lyft, ["time_of_trip"], ["asc"]);
    // lyft = _.orderBy(_.filter(lyft, function(d) { return (moment(new Date(d.time_of_trip)).month() === 8 && moment(new Date(d.time_of_trip)).date() === 1); }), ['time_of_trip'], ['asc']);

    var manhattan = _.filter(mapData.features, function(d) {
        // return d.properties.borough === "Manhattan";
        return d.properties.BoroName === "Manhattan";
    });

    mapData = {
        "type": "FeatureCollection",
        "features": manhattan
    };

    // drawMap(mapData, lyft, '#nyc-lyft', 'red', 'start_lng', 'start_lat');
    // drawMap(mapData, uber, zones, '#nyc-uber');

    // fhv = fhv.map(function(d) {
    //     var ntacode = "";
    //     zones.map(function(z) {
    //         if (z.location_id === d.locationID &&
    //             z.location_id != 264 &&
    //             z.location_id != 265) {
    //             ntacode = z.ntacode;
    //         }
    //     });
    //     d["ntacode"] = ntacode;
    //     return d;
    // });
    // fhv = fhv.filter(function(d) {
    //     if (d.locationID != "" && d.ntacode != "") {
    //         return d;
    //     }
    // });

    drawMap(mapData, uber, total, '#nyc-uber', "#totalUberPickups");
    drawMap(mapData, fhv, total, '#nyc-fhv', "#totalFHVPickups");
}

var countValues = function(data) {
    var output = _(data)
        .groupBy('key')
        .map((v, k) => ({
            key: k,
            value: _.sumBy(v, 'value')
        })).value();

    return _.orderBy(output, 'value', 'desc');
}

d3.queue()
    // .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/nyc.geo.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/design/nyc.geo.2.json')
    .defer(d3.csv, 'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv_bases.csv')
    .defer(d3.csv, 'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/taxi-zone-lookup-with-ntacode.csv')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/jan.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/feb.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/mar.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/apr.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/may.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/uber/uber-jan-june15/jun.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-01.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-02.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-03.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-04.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-05.json')
    .defer(d3.json, 'https://raw.githubusercontent.com/se2/cis602-02-project/master/data/fhv/jan.jun.15/fhv_2015-06.json')
    // .defer(d3.csv,   'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/uber/uber-sep14.csv')
    // .defer(d3.csv,   'https://media.githubusercontent.com/media/se2/cis602-02-project/master/data/fhv/Lyft_B02510.csv')
    .await(dataViz);
