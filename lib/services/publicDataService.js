'use strict';

const request = require('async-request')

const getTrainDepartures = async () => {
  const result = await request('https://nexttrain.bornholm.se/?station=stockholm%20city&direction=1&lang=sv&destinations=Södertälje%20Centrum,Tumba')
  return result.body
}

module.exports = {
  getTrainDepartures
}
