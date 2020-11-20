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
  .all((req, res, next) => {
    if (!req.user.id) {
      return res.status(401).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    next()
  })
  .post((req, res, next) => {
    const requiredFields = { 'Title': 'title', 'Content': 'content', 'Course ID': 'courseId' }
    for (const field in requiredFields) {
      if (!req.body[requiredFields[field]]) {
        return res.status(400).json({ message: `${field} is required` })
      }
    }
    const noteData = {
      title: req.body.title,
      content: req.body.content,
      course_id: req.body.courseId,
      user_id: req.user.id
    }
    DatabaseService.addNote(req.app.get('db'), noteData)
      .then(note => {
        res.status(201).json(sanitizeNote(note))
      })
      .catch(next)
  })

Notes
  .route('/:id')
  .all((req, res, next) => {
    if (!req.user.id) {
      return res.status(401).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    if (!Number(req.params.id)) {
      return res.status(400).json({ message: 'Note ID is required and must be a number' })
    }
    next()
  })
  .get((req, res, next) => {
    const course_id = req.query.course
    if (!course_id) {
      return res.status(400).json({ message: 'Course ID is required' })
    }
    DatabaseService.getNote(req.app.get('db'), req.user.id, course_id, req.params.id)
      .then(note => {
        if (!note) {
          return res.status(204).end()
        }
        res.status(200).json(sanitizeNote(note))
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    DatabaseService.deleteNote(req.app.get('db'), req.user.id, req.params.id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch((req, res, next) => {
    const requiredFields = { 'Title': 'title', 'Content': 'content' }
    for (const field in requiredFields) {
      if (!req.body[requiredFields[field]]) {
        return res.status(400).json({ message: `${field} is required` })
      }
    }
    const noteData = {
      title: req.body.title,
      content: req.body.content
    }
    DatabaseService.updateNote(req.app.get('db'), req.user.id, req.params.id, noteData)
      .then(note => {
        res.status(200).json(sanitizeNote(note))
      })
      .catch(next)
  })

module.exports = Notes