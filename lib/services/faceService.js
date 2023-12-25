const fs = require('fs').promises

const faceRecognition = require('../faceRecognition')

const initialize = async (images) => {
  await faceRecognition.initFaceAPI()

  for (image of images) {
    await faceRecognition.registerImage('./data/' + image)
  }
}

const saveImage = async (imageBase64, filename) => {
  var imageBuffer = new Buffer(imageBase64, 'base64')

  console.log('saving', filename)
  return await fs.writeFile(filename, imageBuffer)
}

const train = async (imageBase64, name) => {
  var filename = './images/profilbild.png'
  await saveImage(imageBase64, filename)
}

const recognize = async (imageBase64, filename) => {
  await saveImage(imageBase64, filename)
  var faces = await faceRecognition.findBestMatch(filename)

  return faces ? faces.filter((face) => face.distance <= 0.6) : null
}

module.exports = {
  initialize,
  train,
  recognize,
}
