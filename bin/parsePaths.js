var io = require('indian-ocean')
var _ = require('lodash')
var d3 = require('d3')
var request = require('request')
var queue = require('queue-async')



var positions = []
io.readdirIncludeSync('raw-matches-timeline/', 'json').forEach(function(pathStr, i){
  console.log(pathStr, i)
  try{
    parseMatch(io.readDataSync('raw-matches-timeline/' + pathStr))
  } catch(e){ console.log(e) }
})


io.writeData('paths/data/paths.csv', positions, function(){})


function parseMatch(m) {
  m.timeline.frames.forEach(function(f){
    d3.values(f.participantFrames).forEach(function(d, i){
      if (!d.position) return
      positions.push({
        player: i + 1,
        team: i < 5,
        x: d.position.x,
        y: d.position.y,
        time: f.timestamp,
        match: m.matchId
      })
    })
  })
}

