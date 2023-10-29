const faceRecognition = require('./lib/faceRecognition')

const test = async () => {
  await faceRecognition.initFaceAPI()
  await faceRecognition.registerImage('profilbild.jpg')
  const result = await faceRecognition.findBestMatch('camera.jpg')
  console.log(result)
}

test()
