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
  .route('/')
  .post((req, res, next) => {
    const user_id = req.user.id
    if (!user_id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const { title, content, courseId: course_id } = req.body
    const noteData = {
      title,
      content,
      user_id,
      course_id
    }
    DatabaseService.addNote(req.app.get('db'), noteData)
      .then(note => {
        res.status(200).json(sanitizeNote(note))
      })
      .catch(next)
  })

Notes
  .route('/:id')
  .get((req, res, next) => {
    const user_id = req.user.id
    if (!user_id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const id = req.params.id
    DatabaseService.getNote(req.app.get('db'), user_id, id)
      .then(note => {
        res.status(200).json(sanitizeNote(note))
      })
      .catch(next)
  })

module.exports = Notes