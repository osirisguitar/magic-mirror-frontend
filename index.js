const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const faceService = require('./lib/services/faceService');
const userService = require('./lib/services/userService');
const publicDataService = require('./lib/services/publicDataService');
const { google } = require('googleapis');
const googleCalendar = google.calendar('v3')
const moment = require('moment');
const config = require('./config.json')
const ifaces = require('os').networkInterfaces()

const oauth2Client = new google.auth.OAuth2(
  config.clientId,
  config.clientSecret,
  'http://localhost:5656/googlecallback'
);

google.options({ auth: oauth2Client });

app.use(express.static('site'));
app.use('/images', express.static('images'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded());

app.post('/train', async (req, res) => {
  var imageBase64 = req.body.imagedata.split(',')[1];

  try {
    var result = await faceService.train(imageBase64, req.body.name);
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
    console.log(result);
    if (result && result[0]) {
      userService.setActiveUser(result[0].className);
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
  var userData = userService.getPersonalData();

  res.json(userData);
});

app.get('/trains', async (req, res) => {
  var trainData = await publicDataService.getTrainDepartures();
  res.json(trainData);
});

app.get('/trainingurl', async (req, res) => {
  let serverAddresses = []

  Object.keys(ifaces).forEach(ifaceName => {
    const iface = ifaces[ifaceName]

    iface.forEach(setting => {
      if ('IPv4' === setting.family && setting.internal === false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        serverAddresses.push(`http://${setting.address}:${5656}/phone.html`)
      }
    })
  })

  res.json({ url: serverAddresses[0] });
});

app.get('/google', async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent'
  })

  res.redirect(authUrl);
});

app.post('/googlelogin', async (req, res) => {
  var authCode = req.body.authCode;

  try {
    console.log('now trying getToken');
    const { tokens } = await oauth2Client.getToken(authCode)
    oauth2Client.setCredentials(tokens);
  } catch (error) {
    console.log(error);
  }
});

app.get('/googlecallback', async (req, res) => {
  var authCode = req.query.code;

  try {
    console.log('now trying getToken');
    const { tokens } = await oauth2Client.getToken(authCode)
    oauth2Client.setCredentials(tokens);
    
    return getEvents(oauth2Client, 'primary')
      .then(events => {
        console.log('sending events', events);
        res.json(events);
      })
      .catch (error => {
        console.error('Shits fucked up yo', error);
      })
  } catch (error) {
    console.log(error);
  }
});

function getEvents(auth, calendarId) {
  return new Promise((resolve, reject) => {
    googleCalendar.events.list({
      auth,
      calendarId: calendarId,
      timeMin: '2019-02-25T00:00:00+01:00',
      timeMax: '2019-02-26T00:00:00+01:00',
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    }, (err, response) => {
      console.log('Got events', response.data.items);
      if (err) return reject(err)
      resolve(response.data.items[1])
    })
  })
}

app.listen(5656, () => {
  console.log('http://localhost:5656')
});
