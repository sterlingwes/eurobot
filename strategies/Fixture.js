'use strict'
var _ = require('lodash')
var request = require('request')
var updateSlack = require('../channels/slack')
var tweet = require('../channels/twitter')

var ACTIVE_GAME_INTERVAL = (45 * 2 + 15 + 10) * 60000 // 2 halves, break, stoppage time allowance
var POLL_INTERVAL = 15000
var TOKEN = {
  'X-Auth-Token': process.env.API_TOKEN
}

var scheduled = 0

class Fixture {
  constructor (game) {
    _.extend(this, game)
  }

  isActive () {
    var interval = Date.now() - this.dateVal()
    if (interval < 0) return false
    return interval < ACTIVE_GAME_INTERVAL
  }

  isUpcoming () {
    return Date.now() < this.dateVal()
  }

  isDone () {
    return this.status === 'FINISHED' || (!this.isActive() && !this.isUpcoming())
  }

  dateVal () {
    return new Date(this.date).valueOf()
  }

  getPollStartOffset () {
    return this.dateVal() - Date.now()
  }

  getScore (game) {
    if (game) return [ game.result.goalsAwayTeam, game.result.goalsHomeTeam ]
    return [ this.result.goalsAwayTeam, this.result.goalsHomeTeam ]
  }

  getMatch () {
    return `${this.date}: ${this.awayTeamName} vs. ${this.homeTeamName}`
  }

  getLink () {
    if (process.env.STUB_API) {
      return this._links.self.href.replace('http://api.football-data.org', 'http://localhost:' + (process.env.API_PORT || 3000))
    }
    return this._links.self.href
  }

  hasChanged (newGame) {
    var newScore = this.getScore(newGame)
    var current = this.getScore()
    return (newScore[0] !== current[0]) ||
          (newScore[1] !== current[1]) ||
          (newGame.status !== this.status)
  }

  startPolling () {
    console.log('starting polling for', this.getMatch())
    this.pollingId = setInterval(() => { this.poll() }, POLL_INTERVAL)
  }

  poll () {
    if (this.isDone()) {
      console.log('stopping polling for', this.getMatch())
      clearInterval(this.pollingId)
      scheduled--
      console.log(`${scheduled} games are active or scheduled`)
      return
    }

    var fixtureLink = this.getLink()

    request({
      uri: fixtureLink,
      headers: TOKEN
    }, (err, res, body) => {
      if (err) {
        console.error('Error polling', this.getLink(), err)
        return
      }

      try {
        var game = JSON.parse(body).fixture

        if (this.hasChanged(game)) {
          _.extend(this, game)
          console.log('>', this.getMatch(), this.getScore().join('-'), this.status)
          updateSlack(game)
          tweet(game)
        }
      } catch (e) { console.error('Error parsing response for fixture', this.getLink(), e.stack) }
    })
  }
}

function newFixture (game) {
  return new Fixture(game)
}

newFixture.setCount = function (count) {
  scheduled = count
}

module.exports = newFixture
