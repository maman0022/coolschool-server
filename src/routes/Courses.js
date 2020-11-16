const express = require('express')
const xss = require('xss')
const DatabaseService = require('../services/DatabaseService')

const Courses = express.Router()

function sanitizeCourse(course) {
  return {
    id: course.id,
    title: xss(course.title),
    date_created: course.date_created,
    user_id: course.user_id,
    color: xss(course.color)
  }
}

function sanitizeNoteAndEssay(resource) {
  return {
    id: resource.id,
    title: xss(resource.title),
    date_created: resource.date_created,
    user_id: resource.user_id,
    course_id: resource.course_id,
    content: xss(resource.content)
  }
}

Courses
  .route('/')
  .all((req, res, next) => {
    if (!req.user.id) {
      return res.status(401).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    next()
  })
  .get((req, res, next) => {
    DatabaseService.getCourses(req.app.get('db'), req.user.id)
      .then(courses => {
        const sanitizedCourses = courses.map(sanitizeCourse)
        res.status(200).json(sanitizedCourses)
      })
      .catch(next)
  })
  .post((req, res, next) => {
    const { title } = req.body
    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }
    DatabaseService.addCourse(req.app.get('db'), req.user.id, title)
      .then(course => {
        res.status(201).json(sanitizeCourse(course))
      })
      .catch(next)
  })


Courses
  .route('/:id')
  .all((req, res, next) => {
    if (!req.user.id) {
      return res.status(401).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    if (!req.params.id) {
      return res.status(400).json({ message: 'Course ID is required' })
    }
    next()
  })
  .get((req, res, next) => {
    DatabaseService.getCourse(req.app.get('db'), req.user.id, req.params.id)
      .then(([notes, essays]) => {
        const sanitizedNotes = notes.map(sanitizeNoteAndEssay)
        const sanitizedEssays = essays.map(sanitizeNoteAndEssay)
        res.status(200).json({ notes: sanitizedNotes, essays: sanitizedEssays })
      })
      .catch(next)
  })
  .delete((req, res, next) => {
    DatabaseService.deleteCourse(req.app.get('db'), req.user.id, req.params.id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch((req, res, next) => {
    const { color } = req.body
    if (!color) {
      return res.status(400).json({ message: 'Color is required' })
    }
    const courseData = {
      color
    }
    DatabaseService.updateCourse(req.app.get('db'), req.user.id, req.params.id, courseData)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = Courses