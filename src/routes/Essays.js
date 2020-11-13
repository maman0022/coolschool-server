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
  .post((req, res, next) => {
    const user_id = req.user.id
    if (!user_id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const { title, content, courseId: course_id } = req.body
    const essayData = {
      title,
      content,
      user_id,
      course_id
    }
    DatabaseService.addEssay(req.app.get('db'), essayData)
      .then(essay => {
        res.status(200).json(sanitizeEssay(essay))
      })
      .catch(next)
  })

Essays
  .route('/:id')
  .get((req, res, next) => {
    const user_id = req.user.id
    if (!user_id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const id = req.params.id
    DatabaseService.getEssay(req.app.get('db'), user_id, id)
      .then(essay => {
        res.status(200).json(sanitizeEssay(essay))
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    const user_id = req.user.id
    if (!user_id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const essay_id = req.params.id
    if (!essay_id) {
      return res.status(400).json({ message: 'Essay ID is required' })
    }
    DatabaseService.deleteEssay(req.app.get('db'), user_id, essay_id)
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
    const essay_id = req.params.id
    if (!essay_id) {
      return res.status(400).json({ message: 'Essay ID is required' })
    }
    const essayData = {
      title: req.body.title,
      content: req.body.content
    }
    DatabaseService.updateEssay(req.app.get('db'), user_id, essay_id, essayData)
      .then(essay => {
        res.status(200).json(sanitizeEssay(essay))
      })
      .catch(next)
  })

module.exports = Essays