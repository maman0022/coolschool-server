# CoolSchool  
Live Link: https://coolschool.vercel.app/  
  
## Summary  
This is the server side of my full-stack app. The main purpose of this back-end is to register and authenticate users. As well as, to retrieve user content which is hosted in a PostGreSQL database from the same host (Heroku).   
More information about this app and how it works can be found here - https://github.com/maman0022/coolschool-client.  

## API Documentation  
BASE URL: https://damp-falls-25632.herokuapp.com  
All of the endpoints except login and register require an authorization header with bearer type and token provided on login.  
### Endpoints  

`POST /api/login`  
Authenticates user. *Requires a request body*  
Key|Value
---|---
email|string, required
password|string, required  
  
Returns a JSON Web Token.
  
---  
  
`POST /api/register`  
Create a new user. *Requires a request body*  
Key|Value
---|---
fname|string, required
lname|string, required
email|string, required
password|string, required  
  
---  
  
`GET /api/courses`  
Gets all courses for a user.  
Returns an array of course objects which contain an id, title, date created, display color, and user id.  

---  
  
`POST /api/courses`  
Create a new course and add it to user's profile. *Requires a request body*  
Key|Value
---|---
title|string, required  
  
Returns a course object which contains an id, title, date created, display color, and user id.

---  
  
`GET /api/courses/*[course id]*`  
Gets a course for a user with associated notes and essays.  
Returns an object containing course, notes, and essays properties.  
Course is same as described above, notes and essays is an array of objects
  
---  
  
