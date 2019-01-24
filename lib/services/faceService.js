'use strict';

const faceRecognition = require('../faceRecognition');
const fs = require('fs').promises;

const saveImage = async (imageBase64, filename) => {
  var imageBuffer = new Buffer(imageBase64, 'base64');;

  return await fs.writeFile(filename, imageBuffer);
}

const train = async (imageBase64, name) => {
  var filename = './images/' + name + '-' + Date.now() + '.png';

  var result = await saveImage(imageBase64, filename);
  var training = await faceRecognition.train([{ name, filename }]);

  console.log('training complete');
  await faceRecognition.save('model.json');
  console.log('model saved');

  fs.unlink(filename);
  return training;
/*  return await fs.unlink(filename);
    .then(result => {
      return training;
    });*/
}

const recognize = async (imageBase64, filename) => {
  var result = await saveImage(imageBase64, filename);
  var faces = await faceRecognition.detectFaces(filename);

  return faces.filter(face => face.distance <= 0.5);
}

module.exports = {
  train,
  recognize
}