var request = require('request')

var updateSlack = require('../channels/slack')

module.exports = function (req, res) {
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
}
