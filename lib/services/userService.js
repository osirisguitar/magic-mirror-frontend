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
    date: googleCalendarItem.start.dateTime,
    startTime: moment(googleCalendarItem.start.dateTime).format('HH:mm'),
    endTime: moment(googleCalendarItem.end.dateTime).format('HH:mm'),
    location: googleCalendarItem.location,
    title: googleCalendarItem.summary,
    organizer: googleCalendarItem.organizer ? googleCalendarItem.organizer.email : null,
    status: googleCalendarItem.status
  }

  return calendarItem
}

function getCalendarEvents(tokens) {
  oauth2Clnt.setCredentials(tokens);

  return new Promise((resolve, reject) => {
    googleCalendar.events.list({
      oauth2Clnt,
      calendarId: 'primary',
      timeMin: moment().subtract(1, 'hours').toISOString(),
      timeMax: moment().endOf('day').add(7, 'days').toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    }, (err, response) => {
      if (err) {
        console.error(err)
        return reject(err)
      }

      // Filter out cancelled meetings and all-day events like old birthdays
      let events = response.data.items
        .filter(e => (e.status && e.status != 'cancelled'))
        .filter(e => e.start.dateTime)
        .filter(e => {
          if (e.attendees) {
            let user = e.attendees.find(a => a.email === 'anders.bornholm@iteam.se')

            if (user && user.responseStatus === 'declined') {
              return false
            }
          }

          return true
        })

      console.log(events)

      if (events.length > 2) {
        events = events.slice(0, 2)
      }

      resolve(events.map(convertCalendarItem))
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

  if (!currentUserData || (Date.now() - currentUserData.lastUpdate > 30000)) {
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

  fs.writeFile('data/userData.json', JSON.stringify(userData, null, 2))
}

const updateUserProfile = async userProfile => {
  userProfiles[userProfile.id] = userProfile

  fs.writeFile('data/userProfiles.json', JSON.stringify(userProfiles, null, 2))
}

const loadProfiles = async () => {
  try {
    const profiles = await fs.readFile('data/userProfiles.json')
    userProfiles = JSON.parse(profiles.toString())
  } catch (error) {
    console.error(error)
    // No user profiles saved, create file...
    userProfiles = {}
    await fs.writeFile('data/userProfiles.json', userProfiles)
  }
}

const loadUserData = async () => {
  try {
    const data = await fs.readFile('data/userData.json')
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