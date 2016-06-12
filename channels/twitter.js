var Twitter = require('twitter')
var TEAMS = require('../fixtures/euroTeams')

var ENV = process.env

var client = new Twitter({
  consumer_key: ENV.TWITTER_KEY,
  consumer_secret: ENV.TWITTER_SECRET,
  access_token_key: ENV.TWITTER_ACCESS_KEY,
  access_token_secret: ENV.TWITTER_ACCESS_SECRET
})

var emojiFlags = require('emoji-flags')

function formatFlag (flag) {
  if (!flag) return ''
  flag = flag.toUpperCase()
  flag = emojiFlags.countryCode(flag)
  if (!flag) return ''
  return flag.emoji + ' '
}

module.exports = function (fixture) {
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
