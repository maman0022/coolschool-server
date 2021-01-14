const express = require('express')
const axios = require('axios')

const Log = express.Router()

Log
  .route('/')
  .post((req, res, next) => {
    const { data, site } = req.body
    if (!data) {
      return res.status(400).json({ message: 'Data is required' })
    }
    if (!site) {
      return res.status(400).json({ message: 'Site is required' })
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