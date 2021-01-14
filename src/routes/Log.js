const express = require('express')
const axios = require('axios')

const Log = express.Router()

Log
  .route('/')
  .post(async (req, res, next) => {
    const { site } = req.body
    if (!site) {
      return res.status(400).json({ message: 'Site is required' })
    }
    let data
    try {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      if (ip.startsWith('::ffff:')) {
        ip = ip.substr(7)
      }
      data = JSON.stringify((await axios.get(`https://ipapi.co/${ip}/json`)).data)
    } catch (error) {
      next(error)
    }
    const dbData = {
      'path': `/vistors/${site}/${Date()}.txt`,
      'mode': 'add',
      'autorename': true,
      'mute': false,
      'strict_conflict': false
    }
    const headers = {
      'Authorization': `Bearer ${process.env.DBTOKEN}`,
      'Dropbox-API-Arg': JSON.stringify(dbData),
      'Content-Type': 'application/octet-stream'
    }
    const body = data.replace(/,/g, '\n').replace(/^\{/, '').replace(/\}$/, '')
    axios.post('https://content.dropboxapi.com/2/files/upload', body, { headers })
      .then(() => res.status(200).end())
      .catch(next)
  })

module.exports = Log