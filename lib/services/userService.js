'use strict';

let currentUser = null;
let userData = {
  Anders: {
    meetings: [{
      startTime: '10:00',
      endTime: '11:00',
      heading: 'Säljmöte AI',
      location: 'Östermalmsgatan 26A, Stockholm'
    }, {
      startTime: '13:00',
      endTime: '14:30',
      heading: 'Labba hemma',
      location: 'Norrängsvägen 2, Huddinge'
    }]
  },
  Johan: {
    meetings: [{
      startTime: '700 AD',
      endTime: '900 AD',
      heading: 'Kolonisera England',
      location: 'Kattegatt'
    }]
  },
  Camilla: {
    meetings: [{
      startTime: '8:00',
      endTime: '11:00',
      heading: 'Resa till Shanghai',
      location: 'Terminal 5, Arlanda'
    }, {
        startTime: '18:30',
        endTime: '20:00',
        heading: 'Föräldraföreningsmöte',
        location: 'Stenmoskolan, Huddinge'
      }]
  }
}

const setActiveUser = userName => {
  currentUser = userName
}

const getPersonalData = () => {
  if (!currentUser || !userData[currentUser]) {
    return {}
  } else {
    return userData[currentUser]
  }
}

module.exports = {
  setActiveUser,
  getPersonalData
};