# CoolSchool  
Live Link: https://coolschool.vercel.app/  
  
## Summary  
This is the server side of my full-stack app. The main purpose of this back-end is to register and authenticate users. As well as, to retrieve user content which is hosted in a PostGreSQL database from the same host (Heroku).   
More information about this app and how it works can be found here - https://github.com/maman0022/coolschool-client.  

## API Documentation  
BASE URL: https://damp-falls-25632.herokuapp.com  
### Endpoints  

`POST /api/login`  
Authenticates user. *Requires a request body*  
Key|Value
---|---
email|string, required
password|string, required  
Returns a JSON Web Token  
  
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
Gets all 
Key|Value
---|---
fname|string, required
lname|string, required
email|string, required
password|string, required  
