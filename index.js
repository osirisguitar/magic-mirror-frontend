const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const faceService = require('./lib/services/faceService')
const publicDataService = require('./lib/services/publicDataService')
const { google } = require('googleapis')
const https = require('https')
const googleCalendar = google.calendar('v3')
require('dotenv').config()
const fs = require('fs')
const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  serverUrl: process.env.SERVER_URL,
}

const oauth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  config.serverUrl + '/googlecallback'
)

google.options({ auth: oauth2Client })

const userService = require('./lib/services/userService')(oauth2Client)

app.use(express.static('site'))
app.use('/images', express.static('images'))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded())

app.post('/train', async (req, res) => {
  var imageBase64 = req.body.imagedata.split(',')[1]

  try {
    const fileName = await faceService.train(imageBase64, req.body.id)
    await userService.addPhoto(req.body.id, fileName)
    res.json({ success: true })
  } catch (err) {
    res.json({ error: 'Could not train face', message: err.message })
  }
})

app.post('/recognize', async (req, res) => {
  var imageBase64 = req.body.imagedata.split(',')[1]
  var filename = './images/camera.png'

  try {
    var result = await faceService.recognize(imageBase64, filename)
    if (result && result[0]) {
      const user = await userService.getUserFromImageName(result[0]._label)
      res.json(user)
    } else {
      res.json({})
    }
  } catch (err) {
    console.error(err)
    res.json({})
  }
})

app.get('/personaldata', async (req, res) => {
  var userData = await userService.getUserData(req.query.id)

  res.json(userData)
})

app.get('/trains', async (req, res) => {
  var trainData = await publicDataService.getTrainDepartures()
  res.json(trainData)
})

app.get('/trainingurl', async (req, res) => {
  res.json({ url: serverAddresses[0] + '/google' })
})

app.get('/google', async (req, res, next) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'profile',
      'email',
    ],
    prompt: 'consent',
  })

  res.redirect(authUrl)
})

app.get('/googlecallback', async (req, res, next) => {
  var authCode = req.query.code

  try {
    const { tokens } = await oauth2Client.getToken(authCode)
    oauth2Client.setCredentials(tokens)

    const googleUserProfile = await getGoogleUserProfile(oauth2Client)
    const userProfile = {}
    userProfile.tokens = tokens
    userProfile.id = googleUserProfile.id
    userProfile.email = googleUserProfile.email
    userProfile.firstName = googleUserProfile.given_name
    userProfile.lastName = googleUserProfile.family_name
    await userService.updateUserProfile(userProfile)

    res.redirect(
      `phone.html?id=${userProfile.id}&firstName=${userProfile.firstName}&lastName=${userProfile.lastName}`
    )
  } catch (error) {
    next(error)
  }
})

const getGoogleUserProfile = async (oauth2Client) => {
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  })

  return new Promise((resolve, reject) => {
    oauth2.userinfo.get((err, result) => {
      if (err) {
        reject(err)
      }

      resolve(result.data)
    })
  })
}

const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
}

https.createServer(httpsOptions, app).listen(5656, async () => {
  await userService.initialize()
  const users = await userService.getUsers()

  images = Object.keys(users).map((userId) => {
    return users[userId]?.photos?.[0]
  })

  await faceService.initialize(images)
})
