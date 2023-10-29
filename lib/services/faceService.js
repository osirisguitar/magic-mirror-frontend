const fs = require('fs').promises

const faceRecognition = require('../faceRecognition')

const initialize = async () => {
  await faceRecognition.initFaceAPI()
  await faceRecognition.registerImage('profilbild.jpg')
  await faceRecognition.registerImage('profilbild.png')
  await faceRecognition.registerImage('profilbild2.png')
}

const saveImage = async (imageBase64, filename) => {
  var imageBuffer = new Buffer(imageBase64, 'base64')

  return await fs.writeFile(filename, imageBuffer)
}

const train = async (imageBase64, name) => {
  var filename = './images/profilbild.png'
  await saveImage(imageBase64, filename)
  /*  var filename = './images/' + name + '-' + Date.now() + '.png'

  var result = await saveImage(imageBase64, filename)
  var training = await faceRecognition.train([{ name, filename }])

  await faceRecognition.save('model.json')

  fs.unlink(filename)
  return training*/
}

const recognize = async (imageBase64, filename) => {
  await saveImage(imageBase64, filename)
  var faces = await faceRecognition.findBestMatch(filename)

  console.log('faces', faces)

  return faces ? faces.filter((face) => face.distance <= 0.6) : null
}

module.exports = {
  initialize,
  train,
  recognize,
}
