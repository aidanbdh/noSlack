const { RtmClient, RTM_EVENTS } = require('@slack/client')
const { aPIToken } = require('./secrets.js')

var rtm = new RtmClient(aPIToken, { logLevel: 'info' })

rtm.start()

rtm.on(RTM_EVENTS.MESSAGE, function({ channel, text }) { rtm.sendMessage(text, channel) })
