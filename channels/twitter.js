var Twitter = require('twitter')
var TEAMS = require('../fixtures/euroTeams')

var ENV = process.env

var client

var emojiFlags = require('emoji-flags')

function formatFlag (countryCode) {
  if (!countryCode) return ''
  countryCode = countryCode.toUpperCase()
  var flag = emojiFlags.countryCode(countryCode)
  if (!flag) return ''
  return flag.emoji + ' '
}

function hasKeys () {
  return ENV.TWITTER_KEY && ENV.TWITTER_SECRET &&
    ENV.TWITTER_ACCESS_KEY && ENV.TWITTER_ACCESS_SECRET
}

function init () {
  client = new Twitter({
    consumer_key: ENV.TWITTER_KEY,
    consumer_secret: ENV.TWITTER_SECRET,
    access_token_key: ENV.TWITTER_ACCESS_KEY,
    access_token_secret: ENV.TWITTER_ACCESS_SECRET
  })
}

module.exports = function (fixture) {
  if (!hasKeys()) return
  if (!client) init()

  var message = fixture.status === 'FINISHED' ? 'FINAL:\n' : ''
  var score = fixture.result
  var awayFlag = formatFlag(TEAMS[fixture.awayTeamName])
  var homeFlag = formatFlag(TEAMS[fixture.homeTeamName])

  message += score.goalsAwayTeam + ' ' + awayFlag + fixture.awayTeamName + '\n'
  message += score.goalsHomeTeam + ' ' + homeFlag + fixture.homeTeamName
  message += '\n#EURO2016'

  var params = { status: message }
  client.post('statuses/update', params, function (error, tweets, response) {
    if (error) console.error('twitter error', error)
  })
}
