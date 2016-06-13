var assert = require('assert')
var newFixture = require('./Fixture')

var sampleGame = require('../fixtures/sampleFixture').fixture

sampleGame.date = new Date(Date.now() + 3.6e+6).toISOString()
sampleGame.status = 'TIMED'
var dateVal = new Date(sampleGame.date).valueOf()

var fixture = newFixture(sampleGame)

assert.equal(fixture.isActive(), false, 'an upcoming game should not be active')
assert.equal(fixture.isUpcoming(), true, 'a game in the future should be upcoming')
assert.equal(fixture.isDone(), false, 'an upcoming game should not be done')
assert.equal(fixture.dateVal(), dateVal, 'dateVal() should return date valueOf()')
assert.ok(fixture.getPollStartOffset() > 3.5e+6, 'getPollStartOffset should be a positive number')

console.log('TESTS PASS')
