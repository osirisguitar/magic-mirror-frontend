'use strict';

const webcamElement = document.getElementById('webcam');

const navigatorAny = navigator;
navigator.getUserMedia = navigator.getUserMedia ||
  navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
  navigatorAny.msGetUserMedia;
if (navigator.getUserMedia) {
  navigator.getUserMedia(
    { video: true },
    stream => {
      webcamElement.srcObject = stream;
    },
    error => {
      console.error('oh noes')
    })
}

function recognize(imageDataUrl) {
  var fetchOptions = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imagedata: imageDataUrl })
  };

  return fetch('recognize', fetchOptions)
    .then(response => {
      return response.json();
    })
    .then(json => {
      return json;
    });
}

function getPersonalData() {
  var fetchOptions = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return fetch('personaldata?id=' + currentUser, fetchOptions)
    .then(response => {
      return response.json();
    })
    .then(json => {
      return json;
    });
}

var webcamImage = document.createElement('canvas');
webcamImage.id = 'webcamImage';
webcamImage.width = 400;
webcamImage.height = 300;

var currentUser = null;

function showPersonalData () {
  return getPersonalData()
    .then(personalData => {
      document.getElementById('person').innerText = personalData.profile.given_name;

      if (personalData.data.events) {
        document.getElementById('calendarItems').innerHTML = '';
        personalData.data.events.forEach(event => {
          var meetingListItem = document.createElement('li');
          let itemHtml = '<i class="far fa-calendar-alt"></i><div>' + event.start + ' - ' + event.end + '</div>' + '<div class="eventTitle">' + event.title;
          if (event.location) {
            itemHtml += '<div class="eventLocation">' + event.location + '</div>'
          }
          itemHtml += '</div>'

          meetingListItem.innerHTML = itemHtml
          document.getElementById('calendarItems').appendChild(meetingListItem);
        });
      }
    });
}

function clearPersonalData () {
  document.getElementById('calendarItems').innerHTML = '';
}

function getTrains () {
  var fetchOptions = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return fetch('trains', fetchOptions)
    .then(response => {
      return response.json();
    })
    .then(json => {
      let trainData = JSON.parse(json);
      document.getElementById('trains').innerText = trainData.displayText;
    });
}

const clearActivePerson = () => {
  document.getElementById('person').innerText = 'Gäst';
  document.getElementById('faceDetected').classList.remove('visible')
  document.getElementById('faceDetected').classList.add('invisible')
  currentUser = null
  return clearPersonalData()
}

const checkForFaces = async () => {
  console.log('Checking for faces')
  document.getElementById('time').innerHTML = moment().format('HH:mm')

  var webcam = document.getElementById('webcam');
  console.log('Set time and retrieved webcam', webcam)
  const detections = await faceapi.detectSingleFace(webcam, new faceapi.TinyFaceDetectorOptions())
  //const detections = await faceapi.detectSingleFace(webcam)

  console.log('detections', detections)

  if (detections) {
    document.getElementById('faceDetected').classList.remove('invisible')
    document.getElementById('faceDetected').classList.add('visible')

    if (!currentUser) {
      let context = webcamImage.getContext('2d');
      context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight)
      var imageDataUrl = webcamImage.toDataURL()
      return recognize(imageDataUrl)
        .then(async person => {
          if (person.className) {
            if (person.className != currentUser) {
              currentUser = person.className
              await showPersonalData()
            }
          } else {
            clearActivePerson()
          }

          setTimeout(checkForFaces, 2000)    
        });
    } else {
      setTimeout(checkForFaces, 2000)
    }
  } else {
    clearActivePerson()
    setTimeout(checkForFaces, 2000)
}

/*  if (detections && detections.length > 0 && !currentUser) {
    document.getElementById('faceDetected').classList.add('visible')

    var context = webcamImage.getContext('2d');
    context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight)
    var imageDataUrl = webcamImage.toDataURL()
    return recognize(imageDataUrl)
      .then(person => {
        if (person.className) {
          if (person.className != currentUser) {
            currentUser = person.className
            personDetected = true
            return showPersonalData()
          }
        } else {
          return clearActivePerson()
        }
      });
  } else {
    clearActivePerson()
  }*/
}

const createTrainingQR = () => {
  var fetchOptions = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  return fetch('trainingurl', fetchOptions)
    .then(response => {
      return response.json()
    })
    .then(json => {
      let url = json.url
      QRCode.toCanvas(document.getElementById('QRcanvas'), url, { scale: 2 }, function (error) { })
      document.getElementById('qrlink').href = url
    })
}

setInterval(() => {
  getTrains();
}, 60000);

const initialize = async () => {
  await faceapi.nets.tinyFaceDetector.loadFromUri('mirror/models')
  await faceapi.nets.ssdMobilenetv1.loadFromUri('mirror/models')
  console.log('model loaded')

  setTimeout(checkForFaces, 5000)
  getTrains()
  createTrainingQR()
}

if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  initialize()
} else {
  document.addEventListener("DOMContentLoaded", initialize)
}
