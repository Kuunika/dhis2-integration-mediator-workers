const axios = require('axios')

module.exports = async dataValues => {
  const auth = {
    username: process.env.DFQW_DHIS2_USERNAME,
    password: process.env.DFQW_DHIS2_PASSWORD
  }

  const reqObj = {
    url: `${process.env.DFQW_DHIS2_URL}/dataValueSets`,
    method: 'POST',
    data: { dataValues },
    auth
  }

  const res = await axios(reqObj).catch(err => console.log(err.message))
  return res
}
