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
      /*      this.webcamElement.addEventListener('loadeddata', async () => {
              this.adjustVideoSize(
                this.webcamElement.videoWidth,
                this.webcamElement.videoHeight);
              })*/
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

  return fetch('personaldata', fetchOptions)
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
      if (personalData.meetings) {
        document.getElementById('calendarItems').innerHTML = '';
        personalData.meetings.forEach(meeting => {
          var meetingListItem = document.createElement('li');
          meetingListItem.innerHTML = meeting.startTime + ' - ' + meeting.endTime + ': ' + meeting.heading;
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

/*setInterval(() => {
  var webcam = document.getElementById('webcam');
  var context = webcamImage.getContext('2d');
  context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight);
  var imageDataUrl = webcamImage.toDataURL();
  return recognize(imageDataUrl)
    .then(person => {
      if (person.className) {
        if (person.className != currentUser) {
          document.getElementById('person').innerText = person.className;
          currentUser = person.className;
          return showPersonalData();
        }
      } else {
        document.getElementById('person').innerText = 'Gäst';
        currentUser = null;
        return clearPersonalData();
      }
    });
}, 2000);*/

setInterval(() => {
  getTrains();
}, 60000);

getTrains();