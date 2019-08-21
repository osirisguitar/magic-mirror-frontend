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

setInterval(() => {
  document.getElementById('time').innerHTML = moment().format('HH:mm')

  var webcam = document.getElementById('webcam');
  var context = webcamImage.getContext('2d');
  context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight);
  var imageDataUrl = webcamImage.toDataURL();
  return recognize(imageDataUrl)
    .then(person => {
      if (person.className) {
        if (person.className != currentUser) {
          currentUser = person.className;
          console.log('current user is now', currentUser)
          return showPersonalData();
        }
      } else {
        document.getElementById('person').innerText = 'Gäst';
        currentUser = null;
        return clearPersonalData();
      }
    });
}, 5000);

setInterval(() => {
  getTrains();
}, 60000);

getTrains();

function createTrainingQR ()  {
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
      QRCode.toCanvas(document.getElementById('QRcanvas'), url, { scale: 2}, function (error) {})
      document.getElementById('qrlink').href = url
    })
}

createTrainingQR()