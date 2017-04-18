var drawMap = function(mapData, scale, rightMargin, data, totalData, htmlID, totalLabelID) {

    var container = $(htmlID);
    var totalPickups = $(totalLabelID);

    var maxData = _.maxBy(data, function(o) { return o.value; });
    var total = getTotalCountInMap(mapData, data);

    totalPickups.html(numeral(total).format());

    /* draw map */
    var width = container.width() - rightMargin,
        height = container.height(),
        center = d3.geoCentroid(mapData),
        offset = [width / 2, height / 2],
        scale = scale,
        precision = 0.1;

    var svg = d3.select(htmlID)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    var color = d3.scaleSequential(d3.interpolateReds);

    /* map projection */
    var projection = d3.geoMercator()
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
            return (colorScale == 0) ? 'white' : color(colorScale);
        })
        .attr('d', path)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.5)
        .attr('class', function(d) {
            return d.id })
        .append('title')
        .text(function(d) {
            var numPickups = 0;
            var title = _.split(_.replace(_.replace(d.properties.NTAName, /etc-/, ''), /-/g, '/'), '/');
            data.map(function(o) {
                if (o.key == d.properties.NTACode) {
                    numPickups = o.value;
                }
            });
            title = title.map(function(t) {
                return _.capitalize(t);
            });
            return _.join(title, '/') + ': ' + numeral(numPickups).format();
        });

}

var drawBar = function(data, htmlID) {

    var bWidth = 315,
        bHeight = 150,
        midX = 200;

    var barSvg = d3.select(htmlID).append('svg')
        .attr('width', bWidth)
        .attr('height', bHeight)
        .style('vertical-align', 'top');

    var y = d3.scaleBand().padding(0.1).range([0, bHeight]).domain(data.map(function(d) {
        return d.name; }));
    var x = d3.scaleLinear().range([0, bWidth - midX]).domain([0, d3.max(data, function(d) {
        return d.value; })]);

    var bars = barSvg.selectAll('.bar').data(data)
        .enter().append('g')
        .attr('transform',
            function(d) {
                return 'translate(-100,' + y(d.name) + ')'; })
        .attr('class', 'bar');

    bars.append('rect')
        .attr('x', midX)
        .attr('y', 0)
        .attr('width', function(d) {
            return x(d.value); })
        .classed('highlight', function(d) {
            return d.name == 'Jan 2015'; })
        .attr('height', y.bandwidth());

    bars.append('text')
        .attr('x', midX - 4)
        .attr('y', 12)
        .style('text-anchor', 'end')
        .text(function(d) {
            return d.name;
        });

}

var dataViz = function(errors, mapData, fhvBases, zones,
                        uber1, uber2, uber3, uber4, uber5, uber6,
                        fhv1, fhv2, fhv3, fhv4, fhv5, fhv6,
                        natality) {

    if (errors) throw errors;

    var uber = countValues(_.union(uber1, uber2, uber3, uber4, uber5, uber6), 'value');
    var fhv = countValues(_.union(fhv1, fhv2, fhv3, fhv4, fhv5, fhv6), 'value');
    var total = countValues(_.union(uber, fhv), 'value');

    /* sum by each month */
    var ubers = [uber1, uber2, uber3, uber4, uber5, uber6];
    var months = [
        { 'key': 0, 'value': 'Jan 2015' },
        { 'key': 1, 'value': 'Feb 2015' },
        { 'key': 2, 'value': 'Mar 2015' },
        { 'key': 3, 'value': 'Apr 2015' },
        { 'key': 4, 'value': 'May 2015' },
        { 'key': 5, 'value': 'Jun 2015' },
    ];

    _.each(ubers, function(d, i) {
        var sum = {
            'name': months[i]['value'],
            'value': _.sumBy(d, 'value')
        };
        ubers[i] = sum;
    });

    /*-------- design 1 --------*/
    drawMap(mapData, 75000, 0, uber, total, '#nyc-uber', '.totalNYCUberPickups');
    /*-------- /design 1 --------*/

    /*-------- design 3 --------*/
    drawMap(mapData, 75000, 315, uber, total, '#nyc-uber-bar', '.totalNYCUberPickups');
    drawBar(ubers, '#nyc-uber-bar');
    /*-------- /design 3 --------*/

    /*-------- design 2 --------*/
    var manhattan = _.filter(mapData.features, function(d) {
        return d.properties.BoroName === 'Manhattan';
    });

    mapData = {
        'type': 'FeatureCollection',
        'features': manhattan
    };

    drawMap(mapData, 150000, 0, uber, total, '#manhattan-uber', '#totalMNUberPickups');
    drawMap(mapData, 150000, 0, fhv, total, '#manhattan-fhv', '#totalMNFHVPickups');
    /*-------- /design 2 --------*/

}

var processFHVData = function(fhv) {

    fhv = fhv.map(function(d) {
        var ntacode = '';
        zones.map(function(z) {
            if (z.location_id === d.locationID &&
                z.location_id != 264 &&
                z.location_id != 265) {
                ntacode = z.ntacode;
            }
        });
        d['ntacode'] = ntacode;
        return d;
    });

    fhv = fhv.filter(function(d) {
        if (d.locationID != '' && d.ntacode != '') {
            return d;
        }
    });

    return fhv;
}

var processUberData = function(data, monthIdx) {

    var months = [
        { 'key': 0, 'value': 'January 2015' },
        { 'key': 1, 'value': 'February 2015' },
        { 'key': 2, 'value': 'March 2015' },
        { 'key': 3, 'value': 'April 2015' },
        { 'key': 4, 'value': 'May 2015' },
        { 'key': 5, 'value': 'June 2015' },
    ];

    var month = months[monthIdx];

    // filter data by month
    data = _.orderBy(_.filter(data, function(d) {
        return (moment(new Date(d['Pickup_date'])).month() === month.key); }), ['Pickup_date'], ['asc']);

    _.each(data, o => _.each(o, (v, k) => o[k] = v.trim()));

    data = data.map(function(o) {
        var ntacode = '';
        zones.map(function(z) {
            if (z.location_id === o.locationID) {
                ntacode = z.ntacode;
            }
        });
        o['ntacode'] = ntacode;
        return o;
    });

    var dataCount = _.orderBy(_.map(_.countBy(data, 'ntacode'), function(value, key) { return { key: key, value: value }; }), 'value', 'desc');

    return dataCount;
}

var getTotalCountInMap = function(mapData, data) {
    var total = 0;
    _.each(mapData.features, function(d) {
        _.each(data, function(o) {
            if (o.key == d.properties.NTACode) {
                total += o.value;
            }
        });
    });
    return total;
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
    .defer(d3.json, 'https://raw.githubusercontent.com/minhnaru/cis602-02-project/master/data/natality.json')
    .await(dataViz);
