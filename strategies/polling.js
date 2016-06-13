var _ = require('lodash')
var request = require('request')
var newFixture = require('./Fixture')

var API_HOST = process.env.STUB_API ? 'http://localhost:' + (process.env.API_PORT || 3000) : 'http://api.football-data.org'
var SEASON = process.env.API_SEASON
var TOKEN = {
  'X-Auth-Token': process.env.API_TOKEN
}

var fixtures = []

request({
  uri: API_HOST + '/v1/soccerseasons/' + SEASON + '/fixtures',
  headers: TOKEN
}, function (err, res, body) {
  if (err) return console.error(err)
  var games = JSON.parse(body).fixtures

  fixtures = _(games)
    .map(game => newFixture(game))
    .filter(game => {
      return game.isActive() || game.isUpcoming()
    })
    .value()

  if (!fixtures.length) return console.warn('WARNING: No games found!')

  fixtures.forEach(game => {
    var gameStartTime = game.getPollStartOffset()
    var hoursFrom = Math.ceil((gameStartTime / 3.6e+6) * 10) / 10
    console.log('+ ', game.getMatch(), ` starting ${hoursFrom} hours from now`)
    setTimeout(() => { game.startPolling() }, gameStartTime)
  })

  newFixture.setCount(fixtures.length)
})
