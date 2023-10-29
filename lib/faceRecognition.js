'use strict'
const fs = require('fs')
const path = require('path')
const tf = require('@tensorflow/tfjs-node')
const faceapi = require('@vladmandic/face-api')

let optionsSSDMobileNet
const minConfidence = 0.1
const distanceThreshold = 0.5
const modelPath = 'model'
const labeledFaceDescriptors = []

async function initFaceAPI() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
  await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath)
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)
  optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence,
    maxResults: 1,
  })
}

const getDescriptors = async (imageFile) => {
  const buffer = fs.readFileSync(imageFile)
  const tensor = tf.node.decodeImage(buffer, 3)
  const faces = await faceapi
    .detectAllFaces(tensor, optionsSSDMobileNet)
    .withFaceLandmarks()
    .withFaceExpressions()
    .withFaceDescriptors()
  tf.dispose(tensor)
  return faces.map((face) => face.descriptor)
}

async function registerImage(inputFile) {
  if (
    !inputFile.toLowerCase().endsWith('jpg') &&
    !inputFile.toLowerCase().endsWith('png') &&
    !inputFile.toLowerCase().endsWith('gif')
  )
    return
  console.log('Registered:', inputFile)
  const descriptors = await getDescriptors(inputFile)
  for (const descriptor of descriptors) {
    const labeledFaceDescriptor = new faceapi.LabeledFaceDescriptors(
      inputFile,
      [descriptor]
    )
    labeledFaceDescriptors.push(labeledFaceDescriptor)
  }
}

async function findBestMatch(inputFile) {
  const matcher = new faceapi.FaceMatcher(
    labeledFaceDescriptors,
    distanceThreshold
  )
  const descriptors = await getDescriptors(inputFile)
  const matches = []
  for (const descriptor of descriptors) {
    const match = await matcher.findBestMatch(descriptor)
    matches.push(match)
  }
  return matches
}

/*const detectFacesForTraining = (images) =>
  images
    .map(({ name, filename }) => {
      try {
        console.log("stuff", name, filename);
        return { name, image: faceRecognition.loadImage(filename) };
      } catch (err) {
        console.error("erroring", err.message);
        return;
      }
    })
    .filter((a) => a)
    .map(async (loaded) => {
      const face = await detector.detectFaces(loaded.image);
      return { ...loaded, face };
    })
    .filter((a) => a);

const recognizer = faceRecognition.FaceRecognizer();
try {
  const model = require("../data/model.json");
  recognizer.load(model);
} catch (err) {
  // No saved model - do nothing;
  console.log("No saved model found...");
}

const train = async (images, jitters = 15) => {
  const faces = await Promise.all(detectFacesForTraining(images));
  faces
    .filter((face) => face.face.length)
    .forEach(async ({ name, face }) => {
      return await recognizer.addFaces(face, name, jitters);
    });

  return recognizer;
};

const detectFaces = async (imageFilename) => {
  const faces = await detector.detectFaces(faceRecognition.loadImage(imageFilename));
  if (!faces || faces.length === 0) {
    return null;
  }
  var prediction = await recognizer.predict(faces[0]);

  return prediction;
};

let saveTimeout;

const save = async () => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    fs.writeFile(process.cwd() + "/data/model.json", JSON.stringify(recognizer.serialize()));
  }, 2000);
};
*/

module.exports = {
  initFaceAPI,
  registerImage,
  findBestMatch,
}
