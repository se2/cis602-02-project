var drawMap = function(mapData, scale, rightMargin, data, uber, fhv, months, htmlID, totalLabelID) {

    var container = $(htmlID);
    var totalPickups = $(totalLabelID);
    var totalUberFHV = countValues(_.union(data, fhv), 'value');

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
            .attr("id", "nyc-map-svg")
            .attr('width', width)
            .attr('height', height);

    var color = d3.scaleSequential(d3.interpolateReds).domain([192, 0]);

    /* map projection */
    var projection = d3.geoMercator()
        .scale(scale)
        .center(center)
        .precision(precision)
        .translate(offset);

    var path = d3.geoPath()
        .projection(projection);

    var regionRanking = function(ntacode) {
        var regionRanking = data.map(function(x) { return x.key; }).indexOf(ntacode);
        return regionRanking;
    }

    /* append to svg */
    svg.append('g')
        .attr("transform",
            "translate(" + 0 + "," + 0 + ")")
        .selectAll('path')
        .data(mapData.features)
        .enter().append('path')
        .attr('fill', function(d) {
            return (regionRanking(d.properties.NTACode) == -1) ? 'white' : color(regionRanking(d.properties.NTACode));
        })
        .attr('d', path)
        .attr('stroke', 'grey')
        .attr('stroke-width', 0.5)
        .attr('id', function(d) {
            return d.properties.NTACode })
        .on('click', mapMouseEnter)
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
            var figure = numeral(numPickups).format();
            if (numPickups == 0)
                figure = 'No Data';
            return _.join(title, '/') + ': ' + figure;
        });

    function mapMouseEnter() {
        var ntacode = d3.select(this).attr("id"),
            $this = d3.select(this),
            divId = "#nyc-map-info";

        d3.select("#nyc-map-svg .map-highlight").classed("map-highlight", false);
        $this.classed("map-highlight", true);

        d3.select(divId).select(".line-chart").remove();
        d3.select(divId).select(".legend").remove();
        d3.select(divId).select(".pie").remove();

        if (typeof _.keyBy(data, "key")[ntacode] != 'undefined') {
            var totalUber = +(_.keyBy(data, "key")[ntacode].value),
                totalFHV = +(_.keyBy(fhv, "key")[ntacode].value);

            drawLine(divId, uber, months, ntacode);
            drawLegend(divId, [totalUber, totalFHV]);
            drawPie(divId, [totalUber, totalFHV]);
        }
    }
}

var barW = 350,
    barH = 300,
    barMargin = { top: 5, bottom: 85, left: 85, right: 5 },
    barX = d3.scaleBand().padding(0.1),
    barY = d3.scaleLinear(),
    barXAxis = null;

var drawInfo = function(divId) {

    var container = $(divId),
        width = 500,
        height = container.height();

    var svg = d3.select(divId)
        .append('svg')
        .attr("id", "nyc-map-info")
        .attr('width', width)
        .attr('height', height);
}

var drawLine = function(divId, data, months, ntacode) {

    var lineData = [];
    _.each(data, function(d, i) {
        var tmp = { "key": months[i].value, "value": _.keyBy(countValues(d), "key") }
        if (typeof tmp.value[ntacode] != 'undefined') {
            lineData[i] = tmp;
            lineData[i].value = lineData[i].value[ntacode].value;
        }
    });
    if (lineData.length > 0) {
        /* scale x and y */
        var x = d3.scaleBand().rangeRound([0, barW]).padding(20),
            y = d3.scaleLinear().range([barH, 0]);

        /* domain lineData for x and y */
        x.domain(lineData.map(function(d) { return d.key; }));
        y.domain([
            d3.min(lineData, function(d) { return d.value; }) / 2,
            d3.max(lineData, function(d) { return d.value; }) * 1.2
            ]);

        var xAxis = d3.axisBottom(x);

        var yAxis = d3.axisLeft(y)
                        .ticks(10);

        var chart = d3.select(divId)
                        .append("svg")
                        .attr("class", "line-chart")
                        .attr("width", barW + barMargin.left + barMargin.right)
                        .attr("height", barH + barMargin.top + barMargin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")")
                        .classed("line", true)

        /* draw line chart */
        var line = d3.line()
                    .x(function(d) { return x(d.key); })
                    .y(function(d) { return y(d.value); });

        var path = chart.append("path")
                        .datum(lineData)
                        .attr("fill", "transparent")
                        .attr("stroke", "#7BA1C2")
                        .attr("stroke-width", 2)
                        .attr("d", line);

        /* append x axis, transform it to bottom */
        chart.append("g")
                .attr("class", "line xAxis")
                .attr("transform", "translate(0," + barH + ")")
                .call(xAxis);

        /* append y axis */
        chart.append("g")
                .attr("class", "line yAxis")
                .call(yAxis);

        /* append axis title */
        chart.append("g")
            .attr("transform", "translate(-70," + (barH / 2) + ") rotate(-90)")
            .append("text")
            .style("text-anchor", "middle")
            .text("Total Pickups");

        chart.append("text")
            .attr("x", barW / 2)
            .attr("y", barH + 50)
            .style("text-anchor", "middle")
            .text(ntacode);
    }
}

var drawPie = function(divId, data) {

    var data = [
        { name: 'Uber', count: data[0], percentage: numeral((data[0] / _.sum(data)) * 100).format('0.00'), color: '#222233' },
        { name: 'FHV', count: data[1], percentage: numeral((data[1] / _.sum(data)) * 100).format('0.00'), color: '#f7b731' },
    ];

    var width = 350,
        height = 300,
        radius = 125;

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.count;
        });

    var svg = d3.select(divId)
        .append("g")
        .attr("class", "pie")
        .attr("transform", "translate(" + width / 1.5 + "," + height * 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d, i) {
            return d.data.color;
        });

    g.append("text")
        .attr("transform", function(d) {
            var _d = arc.centroid(d);
            _d[0] *= 2.6;
            _d[1] *= 2.6;
            return "translate(" + _d + ")";
        })
        .attr("dy", ".50em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.percentage + '%';
        });
}

var drawLegend = function(divId, data) {

    /* legend */
    var data = [
        { name: 'Uber', count: data[0], percentage: numeral((data[0] / _.sum(data)) * 100).format('0.00'), color: '#222233' },
        { name: 'FHV', count: data[1], percentage: numeral((data[1] / _.sum(data)) * 100).format('0.00'), color: '#f7b731' },
    ];
    var radius = 9,
        noteFontSize = 12;

    var width = 350,
        height = 300;

    var legend = d3.select(divId)
                        .append("g")
                        .attr("class", "legend")
                        .attr("transform", "translate(" + 100 + ", " + height * 1.5 + ")")
                        .selectAll("g")
                        .data(data)
                        .enter().append("g")
                            .attr("class", function(d) { return d.name; })
                            .attr("transform", function(d, i) { return "translate(0," + (i * (radius + 1) * 2) + ")"; });

    /* append country names */
    legend.append("text")
            .attr("font-size", noteFontSize)
            .attr("text-anchor", "end")
            .attr("x", width - (radius * 1.5))
            .attr("y", radius / 2)
            .text(function(d) { return d.name; });

    /* append color circles */
    legend.append("circle")
            .attr("cx", width)
            .attr("cy", 0)
            .attr("r", radius)
            .attr("fill", function(d) { return d.color; });
}

var dataViz = function(errors, mapData, fhvBases, zones,
                        uber1, uber2, uber3, uber4, uber5, uber6,
                        fhv1, fhv2, fhv3, fhv4, fhv5, fhv6,
                        natality) {

    if (errors) throw errors;

    var uber = countValues(_.union(uber1, uber2, uber3, uber4, uber5, uber6), 'value');
    var fhv = countValues(_.union(fhv1, fhv2, fhv3, fhv4, fhv5, fhv6), 'value');

    /* sum by each month */
    var ubers = [uber1, uber2, uber3, uber4, uber5, uber6];
    var months = [
        { 'key': 0, 'value': 'Jan' },
        { 'key': 1, 'value': 'Feb' },
        { 'key': 2, 'value': 'Mar' },
        { 'key': 3, 'value': 'Apr' },
        { 'key': 4, 'value': 'May' },
        { 'key': 5, 'value': 'Jun' },
    ];

    _.each(ubers, function(d, i) {
        var sum = {
            'name': months[i]['value'],
            'value': _.sumBy(d, 'value')
        };
        ubers[i] = sum;
    });

    drawMap(mapData, 75000, 500, uber, [uber1, uber2, uber3, uber4, uber5, uber6], fhv, months, '#nyc-uber-bar', '.totalNYCUberPickups');
    drawInfo('#nyc-uber-bar');

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
    output = _.filter(output, function(d) {
        return (d.key != "" && d.key != "undefined");
    });
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
