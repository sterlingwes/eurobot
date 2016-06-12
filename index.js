var express = require('express')
var app = express()
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

app.post('/football-data.events', require('./strategies/events'))

require('./strategies/polling')

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT)
})
