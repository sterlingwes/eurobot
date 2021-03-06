var express = require('express')
var app = express()
var parser = require('body-parser')
var PORT = process.env.API_PORT || 3000
var STRATEGY = process.env.STRATEGY || 'polling'
var SHOULD_EXPOSE_TOKEN = process.env.EXPOSE_TOKEN
var SHOULD_STUB = process.env.STUB_API
var SHOULD_POLL = ['polling', 'both'].indexOf(STRATEGY) !== -1
var SHOULD_LISTEN = ['events', 'both'].indexOf(STRATEGY) !== -1

app.use(parser.json())

app.use(function (req, res, next) {
  console.log('request:', req.method, req.path, req.body)
  next()
})

if (SHOULD_EXPOSE_TOKEN) {
  console.log('WARNING', 'API TOKEN exposed for football-data.org verification. Be sure to disable once verified.')
  app.get('/football-data.events/api_token.txt', function (req, res) {
    res.send(process.env.API_TOKEN)
  })
}

if (SHOULD_LISTEN) {
  console.log('Using events strategy')
  app.post('/football-data.events', require('./strategies/events'))
}

if (SHOULD_POLL) {
  console.log('Using polling strategy')
  require('./strategies/polling')
}

if (SHOULD_STUB) {
  console.log('STUBBING OUT football-data.org API...')
  var upcomingDate = new Date(Date.now() + 5 * 60000).toISOString()
  app.get('/v1/soccerseasons/424/fixtures', function (req, res) {
    var season = require('./fixtures/sampleSeason')
    season.fixtures[1].date = upcomingDate
    res.json(season)
  })

  app.get('/v1/fixtures/149885', function (req, res) {
    var fixture = require('fs').readFileSync('./fixtures/sampleSeasonFixture.json')
    var obj = JSON.parse(fixture)
    obj.fixture.date = upcomingDate
    res.json(obj)
  })
}

if (SHOULD_EXPOSE_TOKEN || SHOULD_LISTEN || SHOULD_STUB) {
  app.listen(PORT, function () {
    console.log('Listening on port ' + PORT)
  })
}
