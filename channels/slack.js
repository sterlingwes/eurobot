var request = require('request')
var TEAMS = require('../fixtures/euroTeams')

function formatFlag (countryCode) {
  if (!countryCode) return ''
  return ':flag-' + countryCode + ': '
}

module.exports = function updateSlack (fixture) {
  var message = ''
  var score = fixture.result
  var awayFlag = formatFlag(TEAMS[fixture.awayTeamName])
  var homeFlag = formatFlag(TEAMS[fixture.homeTeamName])

  message += '*' + score.goalsAwayTeam + '* ' + awayFlag + fixture.awayTeamName + '\n'
  message += '*' + score.goalsHomeTeam + '* ' + homeFlag + fixture.homeTeamName

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
