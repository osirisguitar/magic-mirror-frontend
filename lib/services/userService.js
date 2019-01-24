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
  }
}


const setActiveUser = userName => {
  currentUser = userName;
}

const getPersonalData = () => {
  if (!currentUser || !userData[currentUser]) {
    return {};
  } else {
    return userData[currentUser];
  }
}

module.exports = {
  setActiveUser,
  getPersonalData
};