const { RtmClient, CLIENT_EVENTS, MemoryDataStore, RTM_EVENTS } = require('@slack/client')
const { botToken } = require('./secrets.js')
const RTM_CLIENT_EVENTS = CLIENT_EVENTS.RTM

const rtm = new RtmClient(botToken, {
  logLevel: 'error',
  dataStore: new MemoryDataStore()
})

let contact

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(data) {
  console.log(`Sucessfully logged in here is some data ${data}`)
})

rtm.start()

rtm.once(RTM_EVENTS.MESSAGE, function({text, channel}) {
  if(text.toLowerCase() !== 'initialize bot') return
  const mainChannel = channel
  rtm.sendMessage(`Hello I am Slack Without Slack, your bot for easily communicating with people who don't have slack! Please respond with a phone number or email address to get started.`, channel)
  rtm.once(RTM_EVENTS.MESSAGE, function({ text, channel }) {
    if(channel !== mainChannel) return
    contact = text
    rtm.sendMessage('Thanks! You can now @mention me (the bot) and the message will be sent to whoever you are trying to reach!', channel)
  })
})
