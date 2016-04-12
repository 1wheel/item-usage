queue()
.defer(d3.json,  'data/example-match.json')
.defer(d3.json, 'data/champions.json')
.defer(d3.json, 'data/items.json')
.awaitAll(function(err, res) {
  example = res[0]
  champs  = res[1].data
  items   = res[2]


  positions = []
  example.timeline.frames.forEach(function(f){
  	d3.values(f.participantFrames).forEach(function(d, i){
  		if (!d.position) return
  		positions.push({
  			player: i + 1,
  			team: i < 5,
  			x: d.position.x,
  			y: d.position.y,
  			time: f.timestamp
  		})
  	})
  })



	var width = height = 512

	var svg = d3.select('body').append('svg')  
			.attr({width: width, height: height})


	svg.append('image')
			.attr({width: width, height: height, 'xlink:href': 'https://s3-us-west-1.amazonaws.com/riot-api/img/minimap-ig.png'})
			.style('opacity', .3)
	var x = d3.scale.linear().domain([-120, 14870]).range([0, 512])
	var y = d3.scale.linear().domain([-120, 14980]).range([512, 0])

	var color = d3.scale.category10()

	svg.dataAppend(positions, 'circle')
			.attr('r', 0)
			.attr('cx', ƒ('x', x))
			.attr('cy', ƒ('y', y))
			.style('fill', ƒ('team', color))
			.style('opacity', .8)
		.transition().delay(function(d){ return d.time/600 })
			.attr('r', 5)
		.transition().duration(1000)
			.attr('r', 1)

	var byPlayer = d3.nest().key(ƒ('player')).entries(positions)

	byPlayer.forEach(function(player){
		player.values.forEach(function(d, i){
			d.prev = i ? player.values[i - 1] : d
			d.dist = dist(d, d.prev)
		})
	})

	// svg.dataAppend(byPlayer, 'path')
	// 		.attr('d', function(d){
	// 			return 'M' + d.values.map(toPath).join('L')
	// 		})
	// 		.style({stroke: ƒ('key', color), fill: 'none', opacity: 1})


	svg.dataAppend(positions, 'path')
			.attr('d', function(d){
				return 'M' + [d.prev, d].map(toPath).join('L')
			})
			.style({stroke: ƒ('team', color), fill: 'none', opacity: 1})
			.style('opacity', function(d){ return d.dist > 5000 ? 0 : 1 })
			.style('stroke-dasharray', '100% 100%')
			.style('stroke-dashoffset', '100%')
		.transition().delay(function(d){ return d.time/600 })
			.style('stroke-width', 1)
			.style('stroke-dashoffset', '00%').duration(800)
		.transition().duration(200)
			.style('stroke-width', 0)



	function dist(a, b){ return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) }
	function toPath(d){ return [x(d.x), y(d.y)] }

});