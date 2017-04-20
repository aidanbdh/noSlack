const { RtmClient, CLIENT_EVENTS, MemoryDataStore, RTM_EVENTS } = require('@slack/client')
const { botToken } = require('./secrets.js')
const RTM_CLIENT_EVENTS = CLIENT_EVENTS.RTM

const rtm = new RtmClient(botToken, {
  logLevel: 'error',
  dataStore: new MemoryDataStore()
})

let contact
let type
let mainUser
let self

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(data) {
  console.log(`Sucessfully logged in as ${data.self.name}`)
  self = data.self.id
})

rtm.start()

rtm.once(RTM_EVENTS.MESSAGE, function({ text, channel, user }) {
  if(text.toLowerCase() !== 'initialize bot') return
  const mainChannel = channel
  mainUser = user
  rtm.sendMessage(`Hello I am Slack Without Slack, your bot for easily communicating with people who don't have slack! Please respond with a phone number or email address to get started.`, channel)
  rtm.once(RTM_EVENTS.MESSAGE, function({ text, channel, user }) {
    if(channel !== mainChannel || user !== mainUser) return
    contact = text
    rtm.sendMessage('Is this a PHONE or EMAIL?', channel)
    rtm.once(RTM_EVENTS.MESSAGE, function({ text, channel, user }) {
      if(channel !== mainChannel || user !== mainUser) return
      if(text.toLowerCase().indexOf('phone') !== -1) { type = 'phone'
    } else if (text.toLowerCase().indexOf('email') !== -1) { type = 'email'
      } else return
      rtm.sendMessage('Thanks! You can now @mention me (the bot) and the message will be sent to whoever you are trying to reach! Mention me and add "botInfo" if you want to edit this information at any time!', channel)
      //Mentions
      rtm.on(RTM_EVENTS.MESSAGE, function({ text, channel }) {
          if(text.indexOf(`<@${self}>`) === -1 || text.indexOf('botInfo') === -1) return
          rtm.sendMessage(`My contact info is ${contact}. If you wish to change it, reply 'Edit'.`, channel)
          rtm.once(RTM_EVENTS.MESSAGE, function({ user, text, channel }) {
            if(text.toLowerCase() !== 'edit') return
            if(user !== mainUser) {
              rtm.sendMessage(`Only the user that set up this bot can edit the contact information.`, channel)
            } else {
              rtm.sendMessage('What would you like the new contact information to be?', channel)
              rtm.once(RTM_EVENTS.MESSAGE, function({ user, text, channel }) {
                if(user !== mainUser) return
                contact = text
                rtm.sendMessage('Is this a PHONE or EMAIL?', channel)
                rtm.once(RTM_EVENTS.MESSAGE, function({ text, channel, user }) {
                  if(channel !== mainChannel || user !== mainUser) return
                  if(text.toLowerCase().indexOf('phone') !== -1) { type = 'phone'
                  } else if (text.toLowerCase().indexOf('email') !== -1) { type = 'email'
                  } else return
                  rtm.sendMessage('Thanks! You can now @mention me (the bot) and the message will be sent to whoever you are trying to reach! Mention me and add "botInfo" if you want to edit this information at any time!', channel)              })
              })
            }
          })
        })
      })
  })
})
