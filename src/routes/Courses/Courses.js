const express = require('express')
const xss = require('xss')
const DatabaseService = require('../../services/DatabaseService')

const Courses = express.Router()

function sanitizeCourse(course) {
  return {
    id: course.id,
    title: xss(course.title),
    date_created: course.date_created,
    user_id: course.user_id
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
  .get((req, res, next) => {
    const { id } = req.user
    if (!id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    DatabaseService.getCourses(req.app.get('db'), id)
      .then(courses => {
        const sanitizedCourses = courses.map(sanitizeCourse)
        res.status(200).json(sanitizedCourses)
      })
      .catch(next)
  })
  .post((req, res, next) => {
    const { id } = req.user
    if (!id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const { title } = req.body
    if (!title) {
      return res.status(400).json({ message: 'Title is required' })
    }
    DatabaseService.addCourse(req.app.get('db'), id, title)
      .then(course => {
        res.status(201).json(sanitizeCourse(course))
      })
      .catch(next)
  })
  .delete((req,res,next)=>{
    const { id } = req.user
    if (!id) {
      return res.status(400).json({ message: 'Unable to determine user. Please logout and log back in.' })
    }
    const course_id  = req.body.id
    if (!course_id) {
      return res.status(400).json({ message: 'Course ID is required' })
    }
    DatabaseService.deleteCourse(req.app.get('db'), id, course_id)
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

Courses
  .route('/:id')
  .get((req, res, next) => {
    const user_id = req.user.id
    const course_id = req.params.id
    DatabaseService.getCourse(req.app.get('db'), user_id, course_id)
      .then(([notes, essays]) => {
        const sanitizedNotes = notes.map(sanitizeNoteAndEssay)
        const sanitizedEssays = essays.map(sanitizeNoteAndEssay)
        res.status(200).json({ notes: sanitizedNotes, essays: sanitizedEssays })
      })
      .catch(next)
  })

module.exports = Courses