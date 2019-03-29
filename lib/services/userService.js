'use strict';

const { google } = require('googleapis')
const googleCalendar = google.calendar('v3')
const fs = require('fs').promises
let userProfiles = {}
let userData = {}
const moment = require('moment')

let oauth2Clnt

const convertCalendarItem = googleCalendarItem => {
  let calendarItem = {
    start: googleCalendarItem.start.dateTime ? moment(googleCalendarItem.start.dateTime).format('HH:MM') : googleCalendarItem.start.date,
    end: googleCalendarItem.end.dateTime ? moment(googleCalendarItem.end.dateTime).format('HH:MM') : googleCalendarItem.end.date,
    location: googleCalendarItem.location,
    title: googleCalendarItem.summary,
    organizer: googleCalendarItem.organizer ? googleCalendarItem.organizer.email : null
  }

  return calendarItem
}

function getCalendarEvents(tokens) {
  oauth2Clnt.setCredentials(tokens);

  return new Promise((resolve, reject) => {
    googleCalendar.events.list({
      oauth2Clnt,
      calendarId: 'primary',
      timeMin: '2019-02-25T00:00:00+01:00',
      timeMax: '2019-02-26T00:00:00+01:00',
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    }, (err, response) => {
      if (err) return reject(err)
      resolve(response.data.items.map(convertCalendarItem))
    })
  })
}

const getUserData = async userId => {
  const userProfile = userProfiles[userId]

  if (!userProfile) {
    console.log('no user profile')
    return {}
  }

  let currentUserData = userData[userId]

  if (!currentUserData || currentUserData.lastUpdate - Date.now() > 30000) {
    if (!userProfile) {
      return null
    }

    const calendarEvents = await getCalendarEvents(userProfile.tokens)
    updateUserData(userId, calendarEvents)
    currentUserData = userData[userId]
  }

  return {
    profile: userProfile,
    data: currentUserData
  }
}

const updateUserData = (userId, calendarEvents) => {
  userData[userId] = {
    events: calendarEvents,
    lastUpdate: Date.now()
  }

  fs.writeFile('userData.json', JSON.stringify(userData, null, 2))
}

const updateUserProfile = async userProfile => {
  userProfiles[userProfile.id] = userProfile

  fs.writeFile('userProfiles.json', JSON.stringify(userProfiles, null, 2))
}

const loadProfiles = async () => {
  try {
    const profiles = await fs.readFile('userProfiles.json')
    userProfiles = JSON.parse(profiles.toString())
  } catch (error) {
    console.error(error)
    // No user profiles saved, do nothing...
  }
}

const loadUserData = async () => {
  try {
    const data = await fs.readFile('userData.json')
    userData = JSON.parse(data.toString())
  } catch {
    // No user data saved, do nothing...
  }
}

loadProfiles()
loadUserData()

module.exports = oauth2Client => {
  oauth2Clnt = oauth2Client
  google.options({ auth: oauth2Clnt });

  return {
    getUserData,
    updateUserProfile
  }
};