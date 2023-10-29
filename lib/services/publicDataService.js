const axios = require('axios')

const getTrainDepartures = async () => {
  /*try {
    const result = await axios(
      'https://nexttrain.bornholm.se/?station=stockholm%20city&direction=1&lang=sv&destinations=Södertälje%20Centrum,Tumba'
    )
    return result.body
  } catch (error) {
    console.log(error)
    return {}
  }*/
  return {}
}

module.exports = {
  getTrainDepartures,
}
