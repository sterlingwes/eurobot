var _ = require('lodash')
var request = require('request')

var INTERVAL = (45 * 2 + 15 + 10) * 60000 // 2 halves, break, stoppage time allowance
var TOKEN = {
  'X-Auth-Token': process.env.API_TOKEN
}
var GAMES

var updateSlack = require('../channels/slack')
var tweet = require('../channels/twitter')

var results = {}

function getCurrentGame () {
  return _(GAMES).find(game => {
    var interval = Date.now() - new Date(game.date).valueOf()
    return interval < INTERVAL
  })
}

function getScore (game) {
  return [ game.result.goalsAwayTeam, game.result.goalsHomeTeam ]
}

function hasChanged (link, game) {
  var last = getScore(results[link])
  var current = getScore(game)
  return (last[0] !== current[0]) ||
        (last[1] !== current[1]) ||
        (results[link].status !== game.status)
}

function poll () {
  var currentGame = getCurrentGame()
  if (!currentGame) return console.warn('No current game')

  var fixtureLink = currentGame._links.self.href
  console.log('polling', fixtureLink)

  request({
    uri: fixtureLink,
    headers: TOKEN
  }, function (err, res, body) {
    if (err) return console.error(err)
    var game = JSON.parse(body)
    if (!results[fixtureLink]) {
      results[fixtureLink] = game.fixture
      console.log('initialized game', game.fixture.awayTeamName, 'vs.', game.fixture.homeTeamName)
      return
    }

    if (hasChanged(fixtureLink, game.fixture)) {
      console.log('changed!')
      results[fixtureLink] = game.fixture
      updateSlack(game.fixture)
      tweet(game.fixture)
    }
  })
}

request({
  uri: 'http://api.football-data.org/v1/soccerseasons/424/fixtures',
  headers: TOKEN
}, function (err, res, body) {
  if (err) return console.error(err)
  GAMES = JSON.parse(body).fixtures
  poll()
  setInterval(poll, 60000)
})
