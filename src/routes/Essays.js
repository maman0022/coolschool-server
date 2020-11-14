const express = require('express')
const xss = require('xss')
const DatabaseService = require('../services/DatabaseService')

const Essays = express.Router()

function sanitizeEssay(essay) {
  return {
    id: essay.id,
    title: xss(essay.title),
    date_created: essay.date_created,
    user_id: essay.user_id,
    course_id: essay.course_id,
    content: xss(essay.content)
  }
}

Essays
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
    const essayData = {
      title: req.body.title,
      content: req.body.content,
      course_id: req.body.courseId,
      user_id: req.user.id
    }
    DatabaseService.addEssay(req.app.get('db'), essayData)
      .then(essay => {
        res.status(200).json(sanitizeEssay(essay))
      })
      .catch(next)
  })

Essays
  .route('/:id')
  .all((req, res, next) => {
    if (!req.user.id) {
      return res.status(401).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    if (!req.params.id) {
      return res.status(400).json({ message: 'Essay ID is required' })
    }
    next()
  })
  .get((req, res, next) => {
    const course_id = req.query.course
    if (!course_id) {
      return res.status(400).json({ message: 'Course ID is required' })
    }
    DatabaseService.getEssay(req.app.get('db'), req.user.id, course_id, req.params.id)
      .then(essay => {
        if (!essay) {
          return res.status(204).end()
        }
        res.status(200).json(sanitizeEssay(essay))
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    DatabaseService.deleteEssay(req.app.get('db'), req.user.id, req.params.id)
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
    const essayData = {
      title: req.body.title,
      content: req.body.content
    }
    DatabaseService.updateEssay(req.app.get('db'), req.user.id, req.params.id, essayData)
      .then(essay => {
        res.status(200).json(sanitizeEssay(essay))
      })
      .catch(next)
  })

module.exports = Essays