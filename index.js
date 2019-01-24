const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const faceService = require('./lib/services/faceService');
const userService = require('./lib/services/userService');

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

app.listen(5656, () => {
  console.log('http://localhost:5656')
});
