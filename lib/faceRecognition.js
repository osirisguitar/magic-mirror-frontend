'use strict';
const faceRecognition = require('face-recognition');
const detector = faceRecognition.AsyncFaceDetector();
const fs = require('fs').promises;
const path = require('path');

const detectFacesForTraining = (images) => images
  .map(({ name, filename }) => {
    try {
      console.log('stuff', name, filename);
      return ({ name, image: faceRecognition.loadImage(filename) });
    } catch (err) {
      console.error('erroring', err.message);
      return;
    }
  })
  .filter(a => a)
  .map(async loaded => {
    const face = await detector.detectFaces(loaded.image);
    return ({ ...loaded, face });
  })
  .filter(a => a);

const recognizer = faceRecognition.FaceRecognizer()
try {
  const model = require('./model.json');
  recognizer.load(model);
} catch (err) {
  // No saved model - do nothing;
}

const train = async (images, jitters = 15) => {
  const faces = await Promise.all(detectFacesForTraining(images));
  console.log('Got faces');
  faces
    .filter(face => face.face.length)
    .forEach(async ({ name, face }) => {
      return await recognizer.addFaces(face, name, jitters)
    });

  console.log('returning recognizer');
  return recognizer;
}

const detectFaces = async imageFilename => {
  console.log('looking in', imageFilename);
  const faces = await detector.detectFaces(faceRecognition.loadImage(imageFilename));
  if (!faces) {
    return null;
  }
  var prediction = await recognizer.predict(faces[0]);

  return prediction;
}

const save = async () => {
  const model = recognizer.serialize();
  return;
//  return fs.writeFileSync(process.cwd() + '/model.json', JSON.stringify(model));
}

module.exports = {
  train,
  detectFaces,
  save
};
