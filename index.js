var express = require('express')
var app = express()
var PORT = 3000

app.get('/', function (req, res) {
  res.send('Go away.')
})

app.get('/football-data.events/api_token.txt', function (req, res) {
  res.send(process.env.API_TOKEN)
})

app.listen(PORT, function () {
  console.log('Listening on port ' + PORT)
})
