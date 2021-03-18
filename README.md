# TRCKT API

## Endpoints

`/auth` 

`/signup` **`POST`** 

`/refresh` **`POST`**

`/login` **`POST`  requireLogin**

`/logout` **`POST` requireAuth**

`/api/user` 

`/current` **`GET` requireAuth**

`/api/tasks`

`/`  **`GET` `POST` requireAuth**

`/:id` **`GET` `POST` `PUT` `DELETE`  requireAuth**

`/:id/:tid`  **`PUT` `DELETE` requireAuth**

## Middleware

**Passport** 

→ requireLogin [uses passport-local]

- Get user by email
- Invoke the comparePassword method [returns a Boolean based on comparison result]

→ requireAuth [uses passport-jwt]

- Grab JWT from Auth Header
- Check token against Redis store [check for invalidated token]
- If token is Valid, return User Document

## Schemas

- **Task:**

    `_id` `title` `completed` `listId [ref: Task List]`

- **Task List:**

    `_id` `title` `description` `owner [ref: User]` 

- **Refresh Token:**

    `_id` `user` `token` `issued` `expires` `replacedByToken`

    **Virtuals:** `isActive`

- **User:**

    `_id` `displayName` `email` `password` 

    **Methods:** 

    → before save: encrypt password with bcrypt [used during signup only]

    `comparePassword` : use bcrypt to compare stored encrypted password with candidate (provided) password

## Authentication Flow

`/signup` 

→ Validate Credentials

→ Check if Email is already in use

→ Create User and Generate a JWT for Access, Refresh Token for Authentication and send with user object [id, email, displayName].

`/login` 

→ Pass the request through the requireLogin middleware

→ if it passes, generate a token and refresh token → send user object [id, email, displayName].

`/refresh`

→ Fetch Refresh Token and User From DB

**→ Check if Refresh Token is Active**

→ Generate a new Refresh Token

→ Revoke the current refresh token, set it's replacedByToken attribute with new token for ref

→ Save the new token and update previous

→ Return with a new JWT, Refresh Token and User Object

`/logout` 

→ Check for valid token with requireAuth middleware

→ Grab token, refresh token and user id

→ Delete Refresh Token object from DB

→ Check if user id is already present in Redis Store as a key

→ if present, push the token to the array with expiry

→ if not present, push a new key value pair, effectively invalidating the token