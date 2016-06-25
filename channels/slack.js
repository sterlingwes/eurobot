var request = require('request')
var TEAMS = require('../fixtures/euroTeams')

function formatFlag (countryCode) {
  if (!countryCode) return ''
  return ':flag-' + countryCode + ': '
}

module.exports = function updateSlack (fixture) {
  var message = ''
  var score = fixture.result
  var pks = { home: '', away: '' }
  var awayFlag = formatFlag(TEAMS[fixture.awayTeamName])
  var homeFlag = formatFlag(TEAMS[fixture.homeTeamName])

  if (score.penaltyShootout) {
    pks.away = ` (${score.penaltyShootout.goalsAwayTeam})`
    pks.home = ` (${score.penaltyShootout.goalsHomeTeam})`
  }

  message += '*' + score.goalsAwayTeam + pks.away + '* ' + awayFlag + fixture.awayTeamName + '\n'
  message += '*' + score.goalsHomeTeam + pks.home + '* ' + homeFlag + fixture.homeTeamName

  request({
    uri: process.env.SLACK_URL,
    method: 'POST',
    json: true,
    body: {
      attachments: [
        {
          text: message,
          mrkdwn_in: ['text'],
          footer: fixture.status
        }
      ]
    }
  }, function (err, response, body) {
    if (err) return console.error('Slack send error', err)
    console.log('Sent event to slack, response:', body)
  })
}
