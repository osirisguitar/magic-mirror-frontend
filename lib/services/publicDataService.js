'use strict';

const request = require('async-request');

const getTrainDepartures = async () => {
  const result = await request('https://nexttrain.bornholm.se/?station=huddinge&direction=2&lang=sv');
  console.log(result.body);
  return result.body;
}

module.exports = {
  getTrainDepartures
}
