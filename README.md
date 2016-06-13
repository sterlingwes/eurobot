## eurobot

Node app for consuming scores from the [football-data.org API](http://football-data.org).

Written / tested on Node 5.5.0.

### Configuration

All configuration is done via environment variables. The preferred method of configuring & running is with [pm2](https://npmjs.org/pm2)'s process.json, which has the following notable options:

* `API_TOKEN` is the [football-data.org API key](http://api.football-data.org/register)
* `API_PORT` default is 3000 when run locally with `npm start`
* `API_SEASON` is the season ID corresponding to the games you wish to receive updates for
* `STRATEGY` can be `polling` or `events` or `both`
* `SLACK_URL` is the Webhook URL provided by Slack when you configure your **Incoming Webhook**

### Strategies

#### Polling

This is the recommended method. On start games for the target season will be fetched and the API will be polled every 15 seconds during game time (defined as 115 minutes from game start time). When there's no active game polling stops until the next game start.

#### Events

The football-data.org API provides an [experimental webhook service](http://api.football-data.org/event_api) which can be configured with an account. As of writing, this strategy does not appear reliable.

### Deployment

* Clone this repo and rename `process.sample.json` to `process.json`
* `npm install`
* Install PM2 node process manager: `npm install -g pm2`

### Runtime

* `pm2 startOrRestart process.json`

Monitor status with `pm2 logs`.