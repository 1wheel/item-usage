d3.csv("data/players.csv", function(err, res) {
  players = res

  // Various formatters.
  var formatNumber = d3.format(",d"),
      formatChange = d3.format("+,d"),
      formatDate = d3.time.format("%B %d, %Y"),
      formatTime = d3.time.format("%I:%M %p");


  // A little coercion, since the CSV is untyped.
  players.forEach(function(d, i) {
    d.index = i;
    d.mDmg = +d.mDmg;
    d.pDmg = +d.pDmg;
    d.kills = +d.kills;
    d.old = d.old == 'true'
    d.won = d.won == 'true'
  });

  // Create the crossfilter for the relevant dimensions and groups.
  var cf = crossfilter(players),
      all = cf.groupAll(),

      kill = cf.dimension(ƒ('kills')),
      killG = kill.group(ƒ()),

      mDmg = cf.dimension(ƒ('mDmg')),
      mDmgG = mDmg.group(function(d) { return Math.floor(d / 5000) * 5000; }),

      pDmg = cf.dimension(ƒ('pDmg')),
      pDmgG = pDmg.group(function(d) { return Math.floor(d / 5000) * 5000; })


  var charts = [

    barChart()
        .dimension(kill)
        .group(killG)
      .x(d3.scale.linear()
        .domain([0, 24])
        .rangeRound([0, 10 * 24])),

    barChart()
        .dimension(mDmg)
        .group(mDmgG)
      .x(d3.scale.linear()
        .domain([0, 60000])
        .rangeRound([0, 10 * 21])),

    barChart()
        .dimension(pDmg)
        .group(pDmgG)
      .x(d3.scale.linear()
        .domain([0, 60000])
        .rangeRound([0, 10 * 21])),
  ];

  // Given our array of charts, which we assume are in the same order as the
  // .chart elements in the DOM, bind the charts to the DOM and render them.
  // We also listen to the chart's brush events to update the display.
  var chart = d3.selectAll(".chart")
      .data(charts)
      .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

  // Render the total.
  d3.selectAll("#total")
      .text(formatNumber(cf.size()));

  renderAll();

  // Renders the specified chart or list.
  function render(method) {
    d3.select(this).call(method);
  }

  // Whenever the brush moves, re-rendering everything.
  function renderAll() {
    chart.each(render);
    d3.select("#active").text(formatNumber(all.value()));
  }


  window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
  };

  window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
  };

});
