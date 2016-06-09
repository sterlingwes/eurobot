var express = require('express')
var app = express()
var request = require('request')
var parser = require('body-parser')
var PORT = process.env.API_PORT || 3000

app.use(parser.json())

app.get('/', function (req, res) {
  res.send('Go away.')
})

// FOR VERIFICATION (disable when verified)
// app.get('/football-data.events/api_token.txt', function (req, res) {
//   res.send(process.env.API_TOKEN)
// })

function updateSlack (fixture) {
  var message = ''
  var score = fixture.result
  message += '*' + score.goalsAwayTeam + '* ' + fixture.awayTeamName + '\n'
  message += '*' + score.goalsHomeTeam + '* ' + fixture.homeTeamName

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
    console.log('Sent', body)
  })
}

app.post('/football-data.events', function (req, res) {
  res.sendStatus(200)

  var webhook = req.body
  var uri = webhook.URI
  var fixtureId = webhook.Id

  /*
   * request fixture info
   */
  request({
    uri: uri,
    headers: {
      'X-Auth-Token': process.env.API_TOKEN
    }
  }, function (err, response, body) {
    if (err) console.error('Failed to retrieve fixture', err.stack)
    console.log(fixtureId, '>>', body)
    var fixture
    try {
      fixture = JSON.parse(body).fixture
    } catch (e) {}

    if (fixture && fixture.result) updateSlack(fixture)
  })

})

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT)
})
