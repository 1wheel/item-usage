var io = require('indian-ocean')
var _ = require('lodash')
var d3 = require('d3')
var request = require('request')
var queue = require('queue-async')

var q = queue(2000)

var config = io.readDataSync('config.json')
var regions = 'BR-EUNE-EUW-KR-LAN-LAS-NA-OCE-RU-TR'.split('-')
var count = 0

var prevMatchIds = io.readdirIncludeSync('raw-matches/', 'json')
var isDownloadedMatch = d3.nest()
    .key(function(d){ return _.last(d.split('/')).replace('.json', '') })
    .map(prevMatchIds)

;['5.11', '5.14'].forEach(function(patchStr){
  regions.forEach(function(region){
    var path = 'game-ids/'+patchStr+'/RANKED_SOLO/' + region + '.json'
    var ids = io.readDataSync(path)
    ids.forEach(function(id){
      if (isDownloadedMatch[id]) return
      q.defer(downloadMatch, id, region)
    })    
  })
})

var apiURL = 'https://na.api.pvp.net/api/lol/'

function downloadMatch(id, region, cb){
  var url = 'https://' + region.toLowerCase() + '.api.pvp.net/api/lol/' 
          + region.toLowerCase() + '/v2.2/match/' + id + '?api_key=' + config.key

  request(url, function (err, res, body) {
    cb()
    if (!err && res.statusCode == 200) {
      console.log('count: ', count++, region, id)
      io.writeData('raw-matches/' + id + '.json', body, noop)
    } else{
      console.log(err ? err : res.statusCode, url)
    }
  })

}


function noop(){}