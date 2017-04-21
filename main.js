const { RtmClient, CLIENT_EVENTS, MemoryDataStore, RTM_EVENTS } = require('@slack/client')
const { botToken } = require('./secrets.js')

const rtm = new RtmClient(botToken, {
  logLevel: 'error',
  dataStore: new MemoryDataStore()
})

const botData = {
  id: null,
  initializing: true,
  populating: true,
  listening: false,
  events: 0,
  admin: {
    channel: '',
    user: ''
  },
  contact: {
    phone: 0,
    email: '',
    unknown: null
  }
}

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(data) {
  console.log(`Sucessfully logged in as ${data.self.name}`)
  botData.id = data.self.id
})

rtm.start()

rtm.on(RTM_EVENTS.MESSAGE, function({ text, channel, user }) {
  text = text.toLowerCase().trim()
  const send = text => { rtm.sendMessage(text, channel) }
  const add = () => { botData.events++ }
  //Messages
  if(botData.initializing && text.indexOf('start bot')) {
    switch(botData.events) {
      //Initial message
      case 0:
        send(`Hello! I am Slack without Slack! Please mention me in a direct message to get started.`)
        add()
        return;
      case 1:
        if(text.toUpperCase().indexOf(`<@${botData.id}>`) === -1) return
        botData.admin.user = user
        botData.admin.channel = channel
        botData.events = 0
        botData.initializing = false
        send(`Hello! This is your admin channel, anytime you want to change my settings, just message me here! Send me a message any time to get started!`)
        return;
      default:
        return;
    }
  } else if(botData.populating) {
    switch(botData.events) {
      //Ask for contact info
      case 0:
        send(`Please respond with a phone number or email address to set up contact information.`)
        add()
        return;
      //Confirm info
      //Ask for contact type
      case 1:
        botData.contact.unknown = text
        send(`Is this a PHONE or EMAIL?`)
        add()
        return
      //Confirm contact info
      case 2:
        if(text.indexOf('phone') !== -1) {
          botData.contact.phone = botData.contact.unknown
          send(`I have the phone number ${botData.contact.phone} is this right? Reply "no" to retry`)
          add()
        } else if (text.indexOf('email') !== -1) {
          botData.contact.email = botData.contact.unknown
          send(`I have the email address ${botData.contact.email} is this right? Reply "no" to retry`)
          add()
        } else {
          botData.events = 0
          if(botData.listening) {
            send('There was an error setting your contact info. Reply "edit" alone to try again.')
            return;
          }
          send(`There was an error getting your contact information. Please message me at any time to try again.`)
        }
        return;
      //Send OK message
      case 3:
        botData.events = 0
        botData.contact.unknown = null
        if(text.indexOf('no') !== -1) {
          botData.contact.phone = 0
          botData.contact.email = ''
          send(`Okay. Message me at any time to retry.`)
          return;
        }
        botData.listening = true
        botData.populating = false
        send(`Great! You can now send messages to me just by mentioning me! Send "edit" alone in this channel to change or add contact information or "info" alone to see my current information`)
        return;
      default:
        return;
    }
  }
  if(botData.listening) {
    if(channel === botData.admin.channel && user === botData.admin.user) {
      if(text === 'edit') {
        botData.populating = true
        send('Okay! Send me a message to get started!')
      }
      if(text === 'info') {
        send(`Okay I have the following information. Phone Number : ${botData.contact.phone} and Email Address : ${botData.contact.email}`)
      }
    }
    if(text.toUpperCase().indexOf(`<@${botData.id}>`) === -1) return
    send(`Oops I'm still in development!`)
  } else {
    return;
  }
  if(text.toUpperCase().indexOf(`<@${botData.id}>`) === -1) return
})
