const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
  courseData: {
    title: 'English 1401',
    color: '#000000',
    user_id: 1
  },
  noteData: {
    title: 'Fundamental Writing Techniques',
    course_id: 1,
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    user_id: 1
  },
  essayData: {
    title: 'Effect of American Literature on the Masses',
    course_id: 1,
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    user_id: 1
  },
  registerData: {
    fname: 'Bob',
    lname: 'Dole',
    email: 'bd@123.com',
    password: 'password'
  },
  async createUserAndReturnToken(db) {
    const pw = await bcrypt.hash('password', 10)
    const userData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'jd@123.com',
      pw
    }
    await db('users').insert(userData)
    const user = await db('users').where({ email: userData.email }).first()
    const token = await jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1hr' })
    return token
  },
  async populateCoursesTable(db) {
    await db('courses').insert(this.courseData)
  },
  async populateNotesTable(db) {
    await db('notes').insert(this.noteData)
  },
  async populateEssaysTable(db) {
    await db('essays').insert(this.essayData)
  }
}