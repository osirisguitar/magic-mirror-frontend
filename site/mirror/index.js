'use strict'

moment.locale('sv')

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
      console.error('oh noes')
    }
  )
}

function recognize(imageDataUrl) {
  var fetchOptions = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imagedata: imageDataUrl }),
  }

  return fetch('recognize', fetchOptions)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      return json
    })
}

function getPersonalData() {
  var fetchOptions = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  return fetch('personaldata?id=' + currentUser, fetchOptions)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      return json
    })
}

var webcamImage = document.createElement('canvas')
webcamImage.id = 'webcamImage'
webcamImage.width = 400
webcamImage.height = 300

var currentUser = null

function showPersonalData() {
  return getPersonalData().then((personalData) => {
    document.getElementById('person').innerText = personalData.profile.firstName

    if (personalData.data && personalData.data.events) {
      document.getElementById('calendarItems').innerHTML = ''
      personalData.data.events.forEach((event) => {
        let meetingListItem = document.createElement('li')
        let meetingDate = moment(event.date)
        let itemHtml = '<div>'
        if (meetingDate.isSame(moment(), 'day')) {
          itemHtml += 'Idag '
        } else {
          let dayName = meetingDate.format('dddd')
          itemHtml += dayName.charAt(0).toUpperCase() + dayName.slice(1) + ' '
        }
        itemHtml +=
          event.startTime +
          ' - ' +
          event.endTime +
          '</div>' +
          '<div class="eventTitle">' +
          event.title
        if (event.location) {
          itemHtml += '<div class="eventLocation">' + event.location + '</div>'
        }
        itemHtml += '</div>'

        meetingListItem.innerHTML = itemHtml
        document.getElementById('calendarItems').appendChild(meetingListItem)
      })
    }
  })
}

function clearPersonalData() {
  document.getElementById('calendarItems').innerHTML = ''
}

function getTrains() {
  var fetchOptions = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  return fetch('trains', fetchOptions)
    .then((response) => {
      return response.json()
    })
    .then((json) => {
      let trainData = JSON.parse(json)
      document.getElementById('trains').innerText = trainData.displayText
    })
}

const getFood = (feeds) => {
  let parser = new RSSParser()

  let feedHtml = '<h2>Skolmat</h2>'

  feeds.forEach(async (feed) => {
    let feedContents = await parser.parseURL(
      'https://cors-anywhere.herokuapp.com/' + feed
    )

    if (feedContents.items.length > 0) {
      feedHtml += '<h3>' + feedContents.title.slice(12) + '</h3>'
      feedHtml +=
        '<div>' +
        feedContents.items[0].title +
        '<br>' +
        feedContents.items[0].content +
        '</div>'
    }
    // Horrible async handling, make this a reduce instead.
    document.getElementById('feeds').innerHTML = feedHtml
  })
}

const renderRSSItems = (items) => {
  console.log(JSON.stringify(items, null, 2))
}

const clearActivePerson = () => {
  document.getElementById('person').innerText = 'Gäst'
  currentUser = null
  return clearPersonalData()
}

let previousImageData

const checkForMotion = () => {
  document.getElementById('time').innerHTML =
    '<div id="date">' +
    moment().format('YYYY-mm-DD') +
    '</div><div id="time">' +
    moment().format('HH:mm') +
    '</div>'

  console.log('Check for motion')

  if (!currentUser) {
    let context = webcamImage.getContext('2d')
    context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight)
    let imageData = context.getImageData(
      0,
      0,
      webcamImage.width,
      webcamImage.height
    )
    if (previousImageData) {
      let result = pixelmatch(
        imageData.data,
        previousImageData.data,
        null,
        webcamImage.width,
        webcamImage.height,
        { threshold: 0.1 }
      )
      if (result > 10000) {
        document.getElementById('person').innerHTML =
          'Gäst <i class="fas fa-eye"></i>'
        console.log('Detected:', result)
        checkForFaces()
      }
    }

    previousImageData = imageData
  }
}

const checkForFaces = async () => {
  let webcam = document.getElementById('webcam')

  let context = webcamImage.getContext('2d')
  context.drawImage(webcam, 0, 0, webcam.clientWidth, webcam.clientHeight)
  var imageDataUrl = webcamImage.toDataURL()

  return recognize(imageDataUrl).then(async (person) => {
    console.log('found', person, person.id)
    if (person.id) {
      if (person.id != currentUser) {
        currentUser = person.id
        await showPersonalData()
      }

      setTimeout(checkForFaces, 5000)
    } else {
      clearActivePerson()
    }
  })
}

const createTrainingQR = () => {
  let url = new URL('/google', window.location.href).href
  console.log(url)
  QRCode.toCanvas(
    document.getElementById('QRcanvas'),
    url,
    { scale: 2 },
    function (error) {}
  )
  document.getElementById('qrlink').href = url
  /*  var fetchOptions = {
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
    })*/
}

let feeds = ['https://skolmaten.se/kallbrinksskolan/rss/days/?limit=1']

setInterval(() => {
  //getTrains()
}, 60000)

setInterval(() => {
  //getFood(feeds)
}, 600000)

const initialize = async () => {
  setInterval(checkForMotion, 1000)
  //getTrains()
  //getFood(feeds)
  createTrainingQR()
}

if (
  document.readyState === 'complete' ||
  (document.readyState !== 'loading' && !document.documentElement.doScroll)
) {
  initialize()
} else {
  document.addEventListener('DOMContentLoaded', initialize)
}
