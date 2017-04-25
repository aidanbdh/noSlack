const app = require('express')()

app.get('/auth', (_, res) => {
  res.sendFile(__dirname + 'slack-button.html')
})

const request = require('request')
const startBot = require('./bot.js')

app.get('/auth/redirect', req =>{
    const options = {
        uri: 'https://slack.com/api/oauth.access?code='
            +req.query.code+
            '&client_id='+process.env.CLIENT_ID+
            '&client_secret='+process.env.CLIENT_SECRET+
            '&redirect_uri='+process.env.REDIRECT_URI,
            method: 'GET'
    }
    request(options, (err, res, body) => {
        const data = JSON.parse(body)
        if (!data.ok) return
        startBot(data.access_token)
    })
})

app.listen(process.env.port|| 3000)
