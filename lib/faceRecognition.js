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
  const model = require('../model.json');
  recognizer.load(model);
} catch (err) {
  // No saved model - do nothing;
}

const train = async (images, jitters = 15) => {
  const faces = await Promise.all(detectFacesForTraining(images));
  faces
    .filter(face => face.face.length)
    .forEach(async ({ name, face }) => {
      return await recognizer.addFaces(face, name, jitters)
    });

    return recognizer;
}

const detectFaces = async imageFilename => {
  const faces = await detector.detectFaces(faceRecognition.loadImage(imageFilename));
  if (!faces || faces.length === 0) {
    return null;
  }
  var prediction = await recognizer.predict(faces[0]);

  return prediction;
}

let saveTimeout;

const save = async () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    fs.writeFile(process.cwd() + '/model.json', JSON.stringify(recognizer.serialize()))
  }, 2000)
}

module.exports = {
  train,
  detectFaces,
  save
};
