module.exports = {
  addUser(db, userData) {
    return db('users').insert(userData)
  },
  getUser(db, email) {
    return db('users').where({ email }).first()
  },
  getCourses(db, user_id) {
    return db('courses').where({ user_id })
  },
  getEssays(db, user_id, course_id) {
    return db('essays').where({ user_id, course_id })
  },
  getNotes(db, user_id, course_id) {
    return db('notes').where({ user_id, course_id })
  },
  getCourse(db, user_id, course_id) {
    return Promise.all([this.getNotes(db, user_id, course_id), this.getEssays(db, user_id, course_id)])
  },
  addCourse(db, user_id, title) {
    return db('courses').insert({ title, user_id }).returning('*').then(rows => rows[0])
  },
  deleteCourse(db, user_id, id) {
    return db('courses').where({ user_id, id }).del()
  },
  getNote(db, user_id, id) {
    return db('notes').where({ user_id, id }).first()
  }
}