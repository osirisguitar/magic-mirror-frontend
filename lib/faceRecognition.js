'use strict'
const fs = require('fs')
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

module.exports = {
  initFaceAPI,
  registerImage,
  findBestMatch,
}
