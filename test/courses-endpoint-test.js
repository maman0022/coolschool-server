const knex = require('knex')
const app = require('../src/app')
const helper = require('./test-helpers')
const { expect } = require('chai')

describe('Courses Endpoints', () => {
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

  after('truncate courses table', () => {
    return db.raw('truncate courses restart identity cascade')
  })

  after('truncate users table', () => {
    return db.raw('truncate users restart identity cascade')
  })

  after('disconnect from db', () => db.destroy())

  it('GET /api/courses', () => {
    return supertest(app)
      .get('/api/courses')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect(res => {
        expect(res.body[0]).to.have.property('id')
        expect(res.body[0]).to.have.property('title')
        expect(res.body[0]).to.have.property('color')
        expect(res.body[0]).to.have.property('date_created')
        expect(res.body[0]).to.have.property('user_id')
        expect(res.body[0].id).to.equal(1)
        expect(res.body[0].user_id).to.equal(1)
        expect(res.body[0].title).to.equal(helper.courseData.title)
        expect(res.body[0].color).to.equal(helper.courseData.color)
        expect(res.body[0].date_created).to.be.a('string')
      })
  })

  it('POST /api/courses', () => {
    const postData = {
      title: 'Math 301'
    }
    return supertest(app)
      .post('/api/courses')
      .auth(token, { type: 'bearer' })
      .send(postData)
      .expect(201)
      .expect(res => {
        expect(res.body).to.have.property('id')
        expect(res.body).to.have.property('title')
        expect(res.body).to.have.property('color')
        expect(res.body).to.have.property('date_created')
        expect(res.body).to.have.property('user_id')
        expect(res.body.id).to.equal(2)
        expect(res.body.user_id).to.equal(1)
        expect(res.body.title).to.equal(postData.title)
        expect(res.body.color).to.equal('#8fbc8f')
        expect(res.body.date_created).to.be.a('string')
      })
  })

  it('No title sent - POST /api/courses', () => {
    return supertest(app)
      .post('/api/courses')
      .auth(token, { type: 'bearer' })
      .send({})
      .expect(400, { message: 'Title is required' })
  })

  it('GET /api/courses/1', () => {
    return supertest(app)
      .get('/api/courses/1')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect(res => {
        expect(res.body).to.eql({
          notes: [],
          essays: [],
          course: {
            id: 1,
            title: helper.courseData.title,
            color: helper.courseData.color,
            user_id: 1,
            date_created: res.body.course.date_created
          }
        })
      })
  })

  it('Course Id not a number - GET /api/courses/1', () => {
    return supertest(app)
      .get('/api/courses/t')
      .auth(token, { type: 'bearer' })
      .expect(400, { message: 'Course ID is required and must be a number' })
  })

  it('PATCH /api/courses/1', () => {
    return supertest(app)
      .patch('/api/courses/1')
      .auth(token, { type: 'bearer' })
      .send({ color: '#ffffff' })
      .expect(204)
  })

  it('No color sent - PATCH /api/courses/1', () => {
    return supertest(app)
      .patch('/api/courses/1')
      .auth(token, { type: 'bearer' })
      .send({})
      .expect(400, { message: 'Color is required' })
  })

  it('DELETE /api/courses/1', () => {
    return supertest(app)
      .delete('/api/courses/1')
      .auth(token, { type: 'bearer' })
      .expect(204)
  })

  it('No Auth Token provided - GET /api/courses', () => {
    return supertest(app)
      .get('/api/courses')
      .expect(401, { message: 'Missing or malformed authorization header' })
  })

  it('Wrong Auth Token provided - GET /api/courses', () => {
    return supertest(app)
      .get('/api/courses')
      .auth('123', { type: 'bearer' })
      .expect(401, { message: 'Invalid credentials' })
  })

  it('Auth Token with no user id provided - GET /api/courses', () => {
    return supertest(app)
      .get('/api/courses')
      .auth(helper.createInvalidToken(), { type: 'bearer' })
      .expect(401, { message: 'Unable to determine user. Please logout and log back in.' })
  })
})