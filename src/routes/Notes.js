const express = require('express')
const xss = require('xss')
const DatabaseService = require('../services/DatabaseService')

const Notes = express.Router()

function sanitizeNote(note) {
  return {
    id: note.id,
    title: xss(note.title),
    date_created: note.date_created,
    user_id: note.user_id,
    course_id: note.course_id,
    content: xss(note.content)
  }
}

Notes
  .route('/:id')
  .get((req, res, next) => {
    const user_id = req.user.id
    const id = req.params.id
    DatabaseService.getNote(req.app.get('db'), user_id, id)
      .then(note => {
        res.status(200).json(sanitizeNote(note))
      })
      .catch(next)
  })

module.exports = Notes