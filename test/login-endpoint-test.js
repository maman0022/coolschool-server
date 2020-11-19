const knex = require('knex')
const app = require('../src/app')
const helper = require('./test-helpers')

describe('Login Endpoint', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  before('create user', () => {
    return helper.createUserAndReturnToken(db)
  })

  after('disconnect from db', () => db.destroy())

  it('POST /api/login', () => {
    const postData = {
      email: 'jd@123.com',
      password: 'password'
    }
    return supertest(app)
      .post('/api/login')
      .send(postData)
      .expect(200)
      .expect(res => {
        expect(res.body).to.have.property('token')
        expect(res.body.token).to.be.a('string')
      })
  })

})