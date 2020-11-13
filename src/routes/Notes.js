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
  .delete((req, res, next) => {
    const user_id = req.user.id
    if (!user_id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const note_id = req.params.id
    if (!note_id) {
      return res.status(400).json({ message: 'Note ID is required' })
    }
    DatabaseService.deleteNote(req.app.get('db'), user_id, note_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch((req, res, next) => {
    const user_id = req.user.id
    if (!user_id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const note_id = req.params.id
    if (!note_id) {
      return res.status(400).json({ message: 'Note ID is required' })
    }
    const noteData = {
      title: req.body.title,
      content: req.body.content
    }
    DatabaseService.updateNote(req.app.get('db'), user_id, note_id, noteData)
      .then(note => {
        res.status(200).json(sanitizeNote(note))
      })
      .catch(next)
  })

module.exports = Notes