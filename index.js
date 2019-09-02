const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const faceService = require('./lib/services/faceService')
const publicDataService = require('./lib/services/publicDataService')
const { google } = require('googleapis')
const googleCalendar = google.calendar('v3')
const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
}
const ifaces = require('os').networkInterfaces()
const path = require('path')

const serverAddresses = []

Object.keys(ifaces).forEach(ifaceName => {
  const iface = ifaces[ifaceName]

  iface.forEach(setting => {
    if ('IPv4' === setting.family && setting.internal === false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      serverAddresses.push(`https://mirror.bornholm.se`)
//      serverAddresses.push(`http://${setting.address}:${5656}`)
    }
  })
})

const oauth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  serverAddresses[0] + '/googlecallback'
);

google.options({ auth: oauth2Client });

const userService = require('./lib/services/userService')(oauth2Client)

console.log('dirname', __dirname)
//app.use(express.static(path.join(__dirname, '../site')));
app.use(express.static('site'));
app.use('/images', express.static('images'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded());

app.post('/train', async (req, res) => {
  var imageBase64 = req.body.imagedata.split(',')[1];

  try {
    var result = await faceService.train(imageBase64, req.body.id);
    res.json({ success: true });
  } catch (err) {
    res.json({ error: 'Could not train face', message: err.message });
  }
});

app.post('/recognize', async (req, res) => {
  var imageBase64 = req.body.imagedata.split(',')[1];
  var filename = './images/camera.png';

  try {
    var result = await faceService.recognize(imageBase64, filename);
    if (result && result[0]) {
      console.log(result[0])
      res.json(result[0]);
    } else {
      res.json({});
    }
  }
  catch(err) {
    console.error(err);
    res.json({});
  }
});

app.get('/personaldata', async (req, res) => {
  var userData = await userService.getUserData(req.query.id);

  res.json(userData);
});

app.get('/trains', async (req, res) => {
  var trainData = await publicDataService.getTrainDepartures();
  res.json(trainData);
});

app.get('/trainingurl', async (req, res) => {
  res.json({ url: serverAddresses[0] + '/google' });
});

app.get('/google', async (req, res, next) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly',
    'profile', 'email'],
    prompt: 'consent'
  })

  res.redirect(authUrl);
});

app.get('/googlecallback', async (req, res, next) => {
  var authCode = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(authCode)
    oauth2Client.setCredentials(tokens);

    const userProfile = await getGoogleUserProfile(oauth2Client)
    userProfile.tokens = tokens
    await userService.updateUserProfile(userProfile)

    res.redirect(`phone.html?id=${userProfile.id}&givenname=${userProfile.given_name}&familyname=${userProfile.family_name}`)
  } catch (error) {
    next(error)
  }
})

const getGoogleUserProfile = async (oauth2Client) => {
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2'
  })

  return new Promise((resolve, reject) => {
    oauth2.userinfo.get((err, result) => {
      if (err) {
        reject(err)
      }

      resolve(result.data)
    })
  })
}

app.listen(5656, () => {
  console.log('http://localhost:5656')
});
