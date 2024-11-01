# YouTube Clone API Documentation

## Base URL

```
https://https://ourtube-fe6i.onrender.com
```

---

### Comment API

#### 1. Add New Comment

- **Method**: POST
- **URL**: `/comments/new-comment/:videoId`
- **Auth Required**: Yes (JWT)
- **Body**: `{ "commentText": "<comment text>" }`
- **Response**:
  ```json
  {
    "newCommentData": {
      "_id": "comment_id",
      "commentText": "<comment text>",
      "user_id": "user_id",
      "video_id": "video_id",
      ...
    }
  }
  ```

#### 2. Get All Comments for a Video

- **Method**: GET
- **URL**: `/comments/:videoId`
- **Auth Required**: No
- **Response**:
  ```json
  {
    "commentData": [
      {
        "_id": "comment_id",
        "commentText": "<comment text>",
        "user_id": {
          "channelName": "<user's channel name>",
          "logoUrl": "<user's logo url>"
        },
        ...
      },
      ...
    ]
  }
  ```

#### 3. Delete Comment

- **Method**: DELETE
- **URL**: `/comments/delete-comment/:commentId`
- **Auth Required**: Yes (JWT)
- **Response**:
  ```json
  {
    "deletedCommentInfo": {
      "_id": "comment_id",
      ...
    }
  }
  ```

#### 4. Edit Comment

- **Method**: PUT
- **URL**: `/comments/edit-comment/:commentId`
- **Auth Required**: Yes (JWT)
- **Body**: `{ "commentText": "<new comment text>" }`
- **Response**:
  ```json
  {
    "editedComment": {
      "_id": "comment_id",
      "commentText": "<new comment text>",
      ...
    }
  }
  ```

---

### User API

#### 1. User Signup

- **Method**: POST
- **URL**: `/users/signup`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "channelName": "<channel name>",
    "email": "<email>",
    "phone": "<phone>",
    "password": "<password>"
  }
  ```
- **Response**:
  ```json
  {
    "newUser": {
      "_id": "user_id",
      "channelName": "<channel name>",
      ...
    }
  }
  ```

#### 2. User Login

- **Method**: POST
- **URL**: `/users/login`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "<email>",
    "password": "<password>"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login Successful",
    "token": "<JWT token>",
    ...
  }
  ```

#### 3. Subscribe to a User

- **Method**: PUT
- **URL**: `/users/subscribe/:userId`
- **Auth Required**: Yes (JWT)
- **Response**:
  ```json
  {
    "subscribedStatus": "Subscribed"
  }
  ```

#### 4. Unsubscribe from a User

- **Method**: PUT
- **URL**: `/users/unsubscribe/:userId`
- **Auth Required**: Yes (JWT)
- **Response**:
  ```json
  {
    "subscribedStatus": "Unsubscribed successfully"
  }
  ```

---

### Video API

#### 1. Upload New Video

- **Method**: POST
- **URL**: `/videos/upload`
- **Auth Required**: Yes (JWT)
- **Body**:
  - **File**: `video` (uploaded video file)
  - **File**: `thumbnail` (uploaded thumbnail image)
  - **Text**:
    ```json
    {
      "title": "<video title>",
      "description": "<video description>",
      "category": "<category>",
      "tags": "<comma-separated tags>"
    }
    ```
- **Response**:
  ```json
  {
    "newVideo": {
      "_id": "video_id",
      "title": "<video title>",
      ...
    }
  }
  ```

#### 2. Update Video

- **Method**: PUT
- **URL**: `/videos/:videoId`
- **Auth Required**: Yes (JWT)
- **Body**: Same as the upload endpoint, with optional updated fields.
- **Response**:
  ```json
  {
    "updatedVideoDetails": {
      "_id": "video_id",
      "title": "<updated title>",
      ...
    }
  }
  ```

#### 3. Delete Video

- **Method**: DELETE
- **URL**: `/videos/:videoId`
- **Auth Required**: Yes (JWT)
- **Response**:
  ```json
  {
    "deletedVideoFromDb": {
      "_id": "video_id",
      ...
    }
  }
  ```

#### 4. Like a Video

- **Method**: PUT
- **URL**: `/videos/like/:videoId`
- **Auth Required**: Yes (JWT)
- **Response**:
  ```json
  {
    "likedStatus": "video liked"
  }
  ```

#### 5. Dislike a Video

- **Method**: PUT
- **URL**: `/videos/dislike/:videoId`
- **Auth Required**: Yes (JWT)
- **Response**:
  ```json
  {
    "dislikeStatus": "video disliked"
  }
  ```

#### 6. Increment Video Views

- **Method**: PUT
- **URL**: `/videos/views/:videoId`
- **Auth Required**: No
- **Response**:
  ```json
  {
    "viewStatus": "View Increased"
  }
  ```

---
