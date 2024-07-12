# TS/Express/Mongo Users App

## Dependenies
* MongoDB server running locally:
```
docker run -d --name mongodb -p 27017:27017 mongo
```

## Scripts 
`npm start` starts the server

`npm test` executes the tests

## Spec
1. POST /users accepts a user and stores it in a database.
    * The user should have a unique id, a name, a unique email address and a creation date
2. GET /users returns (all) users from the database.
   * This endpoint receives a query parameter `created` which sorts users by creation date ascending or descending.


