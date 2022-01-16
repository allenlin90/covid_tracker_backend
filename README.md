# Stack
1. Node.js (with Express)
2. MongoDB Atlas (with Mongoose)
3. Heroku (BaaS)

[DEMO]()

# Features
1. This is the backend for [covid_tracker] to CRUD "**patients**" and "**events**".
2. This app is only ideal for a single user once at a time (without authentication).
3. When a patient is removed, all events related to the patient should be removed as well.
4. The API is designed and follows `RESTful API` pattern.
5. A dedicated MongoDB endpoint shall be given in `.env` to access local/remote database.
6. Secrets are kept on server-side for better security.

# Routes
1. `/` - To check if the server is running (shows only a static access timestamp)
2. `/patient`
   1. POST `/` - To create a patient and limit to **8** patients in total
      ```json
      {
         "gender": "male",
         "age": 27,
         "occupation": "Engineer"
      }
      ```
   2. GET `/` - To get all patients
   3. GET `/:id` - To get a specific patient by ID
   4. PATCH `/:id` - To modify data of a specific patient by ID. At least one property is required, while others become optional.
      ```json
      {
         "gender": "male",
         "age": 27,
         "occupation": "Engineer"
      }
      ```
   5. DELETE `/:id` - To remove a specific patient by ID
3. `/event`
   1. POST `/` - To create a event
      ```json
      {
         "timeFrom": "2022-01-14T07:26:01.161Z",
         "timeTo": "2022-01-14T07:26:01.161Z",
         "locationType": "indoor",
         "location": "test",
         "detail": "test",
         "patient_id": "61e15195cf2cad81e0f9f307"
      }
      ```
   2. GET `/` - To get all events
   4. GET `/:id` - To get event(s) by ID
      1. The query looks up a specific task by task by default.
      2. A query string `type=patient` is accepted if we want to get all events of a patient by patient ID.
   5. PATCH `/:id` - To modify data of a specific event by ID. At least one property is required, while others become optional.
      ```json
      {
         "timeFrom": "2022-01-14T07:26:01.161Z",
         "timeTo": "2022-01-14T07:26:01.161Z",
         "locationType": "indoor",
         "location": "test",
         "detail": "test",
         "patient_id": "61e15195cf2cad81e0f9f307"
      }
      ```
   6. DELETE `/:id` - To remove a specific event by ID
4. Response structure
      ```json
      {
         "status": 200,
         "message": "success",
         "data": null
      }
      ```

# Structural/technology improvements
1. Migrate code with Typescript
2. Using Nest.js for better code organization and future extension for backend code.

## In-app improvements
### Data validation
1. Data validation on each inputs can be more strict.
   1. `DateTo` and `DateFrom` could overlap which cause illogical event timeline. 
   2. E.g. The patient can visit 2 activities at the same time.
   3. Dates of `DateTo` and `DateFrom` is assumed to after year 2020. However, this should be re-considered with project requirements.

### Security
1. There are many aspects on internet security. The followings consider only accessing the backend service.
2. Security is only covered by **CORS** limits which can still be vulnerable with headless requests, such as from POSTMAN or CURL in UNIX-based OS. Solutions could be
   1. Cloud based network. Only devices in the same cloud network or devices with SSH/VPN can access the service.
   2. Device IPs given in whitelist.
   3. User authentication and authorization can be applied to enhance security and prevent data abuse.
      1. User session (with Cookie)
      2. JWT (JSON web token)
3. Code injection as String values could still be a concern. This repo only uses [`validator`](https://www.npmjs.com/package/validator) to check strings before saving data.

### Data racing/competition
1. The following issues could happen when there are **more than 1 user** working at the same time.
2. The current app allows any one to access and apply CRUD on the data.
3. `Web Socket` and `Long polling` can be realtime data fetching solution to ensure data integrity when there's more than 1 user using the app.
4. If 2 users both create a patient at the same time the first one reaching the backend (though could be later in the real time) can create the new entity.
5. Though latency will still be a matter, the user experience could be greatly enhanced as the user can find there's no/enough space to create a patient.
6. The user could also notice if an event of a patient is being edited by the other users.

### Scehma design and Data structure
1. The current schema has only 2 collections to fulfill the requirements of current use. However, this can also be a constraint for long term use or further extension.
2. Besides, we haven't had authentication with App users. Each "patient" and related "events" should be referring to certain user/group/organization with further requirements on the system design.
3. With the idea of relational database, we can extract some of the information for different purpose in a standalone table/collection.
   1. Location (full address)
   2. Type of patient (with other metadata for analysis)
