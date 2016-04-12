var io = require('indian-ocean')
var _ = require('lodash')
var d3 = require('d3')
var request = require('request')
var queue = require('queue-async')



var players = []
io.readdirIncludeSync('raw-matches/', 'json').forEach(function(pathStr, i){
  if (Math.random() < .9) return
  if (!(i % 1000)) console.log(i)

  parseMatch(io.readDataSync('raw-matches/' + pathStr))
})


io.writeData('public/data/players.csv', players, noop)


function parseMatch(m) {
  m = JSON.parse(m)

  var isOld = m.matchVersion[3] == '1'
  var winningTeam = m.teams[+!m.teams[0].winner]
  
  m.participants.forEach(function(d) {
    players.push({
      old: isOld,
      won: winningTeam.teamId == d.teamId,
      kills: d.stats.kills,
      mDmg: d.stats.magicDamageDealtToChampions,
      pDmg: d.stats.physicalDamageDealtToChampions,
      champ: d.championId,
      lane: d.timeline.lane,
      role: d.timeline.role,
      duration: m.matchDuration,
      goldSpent: d.stats.goldSpent
    })
  })
}

function noop(){}