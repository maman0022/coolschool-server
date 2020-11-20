const knex = require('knex')
const app = require('../src/app')
const helper = require('./test-helpers')

describe('Register Endpoint', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('truncate users table', () => {
    return db.raw('truncate users restart identity cascade')
  })

  after('disconnect from db', () => db.destroy())

  it('POST /api/register', () => {
    return supertest(app)
      .post('/api/register')
      .send(helper.registerData)
      .expect(201)
  })

  it('No email sent - POST /api/register', () => {
    const postData = { ...helper.registerData }
    delete postData.email
    return supertest(app)
      .post('/api/register')
      .send(postData)
      .expect(400, { message: 'Email is required' })
  })

  it('Wrong length password - POST /api/register', () => {
    const postData = { ...helper.registerData }
    postData.password = 123
    return supertest(app)
      .post('/api/register')
      .send(postData)
      .expect(400, { message: 'Password must be between 6 and 72 characters' })
  })

  it('User already exists - POST /api/register', () => {
    before(() => helper.createUserAndReturnToken)
    return supertest(app)
      .post('/api/register')
      .send(helper.registerData)
      .expect(400, { message: 'User already exists' })
  })

  it('verify user created in database', () => {
    return db('users').where('email', helper.registerData.email).first()
      .then(res => {
        expect(res).to.eql({
          first_name: helper.registerData.fname,
          last_name: helper.registerData.lname,
          email: helper.registerData.email,
          pw: res.pw,
          date_created: res.date_created,
          id: 1
        })
      })
  })

})