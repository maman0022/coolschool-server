const knex = require('knex')
const app = require('../src/app')
const helper = require('./test-helpers')

describe('Essays Endpoints', () => {
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

  before('populate essays table', () => {
    return helper.populateEssaysTable(db)
  })

  after('truncate essays table', () => {
    return db.raw('truncate essays restart identity cascade')
  })

  after('truncate courses table', () => {
    return db.raw('truncate courses restart identity cascade')
  })

  after('truncate users table', () => {
    return db.raw('truncate users restart identity cascade')
  })

  after('disconnect from db', () => db.destroy())

  it('POST /api/essays', () => {
    const postData = {
      title: 'Test Testing Tested',
      content: 'either pass or fail',
      courseId: 1
    }
    return supertest(app)
      .post('/api/essays')
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

  it('No title sent - POST /api/essays', () => {
    const postData = {
      content: 'either pass or fail',
      courseId: 1
    }
    return supertest(app)
      .post('/api/essays')
      .auth(token, { type: 'bearer' })
      .send(postData)
      .expect(400, { message: `Title is required` })
  })

  it('GET /api/essays/1', () => {
    return supertest(app)
      .get('/api/essays/1?course=1')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect(res => {
        expect(res.body).to.eql({
          id: 1,
          title: helper.essayData.title,
          date_created: res.body.date_created,
          user_id: 1,
          course_id: 1,
          content: helper.essayData.content
        })
      })
  })

  it('No such essay exists - GET /api/essays/1', () => {
    return supertest(app)
      .get('/api/essays/205445?course=1')
      .auth(token, { type: 'bearer' })
      .expect(204)
  })

  it('No course id sent in query - GET /api/essays/1', () => {
    return supertest(app)
      .get('/api/essays/1')
      .auth(token, { type: 'bearer' })
      .expect(400, { message: 'Course ID is required' })
  })

  it('Essay Id not a number - GET /api/essays/1', () => {
    return supertest(app)
      .get('/api/essays/t')
      .auth(token, { type: 'bearer' })
      .expect(400, { message: 'Essay ID is required and must be a number' })
  })

  it('PATCH /api/essays/1', () => {
    const newData = {
      title: 'I was changed',
      content: 'for the better'
    }
    return supertest(app)
      .patch('/api/essays/1')
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

  it('No title sent - PATCH /api/essays/1', () => {
    const postData = {
      content: 'either pass or fail'
    }
    return supertest(app)
      .patch('/api/essays/1')
      .auth(token, { type: 'bearer' })
      .send(postData)
      .expect(400, { message: `Title is required` })
  })

  it('DELETE /api/essays/1', () => {
    return supertest(app)
      .delete('/api/essays/1')
      .auth(token, { type: 'bearer' })
      .expect(204)
  })

  it('No Auth Token provided GET /api/essays', () => {
    return supertest(app)
      .get('/api/essays')
      .expect(401, { message: 'Missing or malformed authorization header' })
  })

  it('Wrong Auth Token provided GET /api/essays', () => {
    return supertest(app)
      .get('/api/essays')
      .auth('123', { type: 'bearer' })
      .expect(401, { message: 'Invalid credentials' })
  })

  it('Auth Token with no user id provided - GET /api/essays', () => {
    return supertest(app)
      .get('/api/essays')
      .auth(helper.createInvalidToken(), { type: 'bearer' })
      .expect(401, { message: 'Unable to determine user. Please logout and log back in.' })
  })
})