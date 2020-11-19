const knex = require('knex')
const app = require('../src/app')
const helper = require('./test-helpers')

describe('Notes Endpoints', () => {
  let db
  let token

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  before('create user and get auth token', () => {
    return helper.createUserAndReturnToken(db)
      .then(t => token = t)
  })

  before('populate courses table', () => {
    return helper.populateCoursesTable(db)
  })

  before('populate notes table', () => {
    return helper.populateNotesTable(db)
  })

  after('truncate notes table', () => {
    return db.raw('truncate notes restart identity cascade')
  })

  after('truncate courses table', () => {
    return db.raw('truncate courses restart identity cascade')
  })

  after('truncate users table', () => {
    return db.raw('truncate users restart identity cascade')
  })

  after('disconnect from db', () => db.destroy())

  it('POST /api/notes', () => {
    const postData = {
      title: 'Test Testing Tested',
      content: 'either pass or fail',
      courseId: 1
    }
    return supertest(app)
      .post('/api/notes')
      .auth(token, { type: 'bearer' })
      .send(postData)
      .expect(201)
      .expect(res => {
        expect(res.body).to.eql({
          id: 2,
          title: postData.title,
          date_created: res.body.date_created,
          user_id: 1,
          course_id: 1,
          content: postData.content
        })
      })
  })

  it('GET /api/notes/1', () => {
    return supertest(app)
      .get('/api/notes/1?course=1')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect(res => {
        expect(res.body).to.eql({
          id: 1,
          title: helper.noteData.title,
          date_created: res.body.date_created,
          user_id: 1,
          course_id: 1,
          content: helper.noteData.content
        })
      })
  })

  it('PATCH /api/notes/1', () => {
    const newData = {
      title: 'I was changed',
      content: 'for the better'
    }
    return supertest(app)
      .patch('/api/notes/1')
      .auth(token, { type: 'bearer' })
      .send(newData)
      .expect(200)
      .expect(res => {
        expect(res.body).to.eql({
          id: 1,
          title: newData.title,
          date_created: res.body.date_created,
          user_id: 1,
          course_id: 1,
          content: newData.content
        })
      })
  })

  it('DELETE /api/notes/1', () => {
    return supertest(app)
      .delete('/api/notes/1')
      .auth(token, { type: 'bearer' })
      .expect(204)
  })
})