document.getElementById('snap').addEventListener('click', () => {
  var webcam = document.getElementById('webcam')
  var context = document.getElementById('webcamImage').getContext('2d')
  context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight)
  var imageDataUrl = document.getElementById('webcamImage').toDataURL()
  return train(imageDataUrl)
})

document.getElementById('find').addEventListener('click', () => {
  var webcam = document.getElementById('webcam')
  var context = document.getElementById('webcamImage').getContext('2d')
  context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight)
  var imageDataUrl = document.getElementById('webcamImage').toDataURL()
  return recognize(imageDataUrl)
})

const webcamElement = document.getElementById('webcam')

const navigatorAny = navigator
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigatorAny.webkitGetUserMedia ||
  navigatorAny.mozGetUserMedia ||
  navigatorAny.msGetUserMedia
if (navigator.getUserMedia) {
  navigator.getUserMedia(
    { video: true },
    (stream) => {
      webcamElement.srcObject = stream
    },
    (error) => {
      console.error('oh noes', error.message)
    }
  )
}

function train(imageDataUrl) {
  var fetchOptions = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: document.getElementById('personName').value,
      imagedata: imageDataUrl,
    }),
  }

  return fetch('train', fetchOptions)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      return '/images/' + json.filename
    })
}

function recognize(imageDataUrl) {
  var fetchOptions = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: document.getElementById('personName').value,
      imagedata: imageDataUrl,
    }),
  }

  return fetch('recognize', fetchOptions)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      return json
    })
}

setInterval(() => {
  var webcam = document.getElementById('webcam')
  var context = document.getElementById('webcamImage').getContext('2d')
  context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight)
  var imageDataUrl = document.getElementById('webcamImage').toDataURL()
  return recognize(imageDataUrl).then((person) => {
    if (person.id) {
      document.getElementById('person').innerText = person.id
    } else {
      document.getElementById('person').innerText = 'Noone'
    }
  })
}, 2000)
