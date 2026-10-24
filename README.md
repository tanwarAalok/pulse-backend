# Pulse Backend

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white) ![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)

The backend for **Pulse**, a social media platform with posts, reactions, comments, follows, one-to-one real-time chat and live notifications. The React client lives in [pulse-app](https://github.com/tanwarAalok/pulse-app).

## Architecture

- **Feature modules** (`src/features/`): auth, user, post, reactions, comments, followers, chat, notifications and images, each with its own routes, controllers, schemas and interfaces.
- **Redis cache first:** hot data (users, posts, reactions, comments, followers, chats) is written to and read from Redis, so reads stay fast.
- **Bull job queues** (`src/shared/workers/`): writes to MongoDB, emails and image processing run as background jobs, which keeps request latency low. A Bull Board dashboard is served at `/queues`.
- **Socket.IO with the Redis adapter** (`src/shared/sockets/`): pushes posts, reactions, follows, notifications and chat messages to clients in real time, and scales across several server instances.
- **Media** is uploaded to Cloudinary; **email** goes out through SendGrid in production and Nodemailer in development.
- Request validation with Joi decorators, structured logging with Bunyan, and tests with Jest.

## Features

* **Authentication:** User signup, signin, and signout.
* **Posts:** Create, read, update, and delete posts with text, images, and videos.
* **Reactions:** Add reactions to posts.
* **Comments:** Add and view comments on posts.
* **Followers:** Follow and unfollow users.
* **Real-time Chat:** One-on-one chat with real-time messaging.
* **Notifications:** Real-time notifications for reactions, comments, and follows.
* **User Profile:** View and update user profiles, including basic info, social links, and profile pictures.
* **Image Handling:** Upload and manage images for profile pictures and posts.

## Technologies Used

* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Caching:** Redis
* **Real-time Communication:** Socket.IO
* **Job Queues:** Bull
* **Image/Video Uploads:** Cloudinary
* **Testing:** Jest

## Prerequisites

* Node.js (>=16.0.0)
* npm or yarn
* MongoDB
* Redis

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/tanwaraalok/pulse-backend.git
    cd pulse-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory. The server refuses to start if any of these are missing:

    ```env
    DB_URL=mongodb://localhost:27017/pulse
    REDIS_HOST=redis://localhost:6379
    CLIENT_URL=http://localhost:3000
    NODE_ENV=development
    JWT_TOKEN=change-me
    SECRET_KEY_ONE=change-me
    SECRET_KEY_TWO=change-me
    CLOUDINARY_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    SENDER_EMAIL=
    SENDER_EMAIL_PASSWORD=
    SENDGRID_API_KEY=
    SENDGRID_SENDER=
    EC2_URL=
    ```

4.  **Start the development server** (runs on port 8000):
    ```bash
    npm run dev
    ```

5.  **Optionally seed sample users:**
    ```bash
    npm run seed:dev
    ```

## API Endpoints

### Authentication

* `POST /api/v1/signup`: Create a new user account.
* `POST /api/v1/signin`: Log in a user.
* `GET /api/v1/signout`: Log out a user.
* `POST /api/v1/forgot-password`: Send a password reset email.
* `POST /api/v1/reset-password/:token`: Reset user password with a token.

### User

* `GET /api/v1/user/all/:page`: Get a paginated list of all users.
* `GET /api/v1/user/profile`: Get the profile of the current user.
* `GET /api/v1/user/profile/:userId`: Get the profile of a user by their ID.
* `GET /api/v1/user/profile/posts/:username/:userId/:uId`: Get a user's profile and their posts.
* `GET /api/v1/user/profile/user/suggestions`: Get random user suggestions.
* `GET /api/v1/user/profile/search/:query`: Search for users.
* `PUT /api/v1/user/profile/change-password`: Change the current user's password.
* `PUT /api/v1/user/profile/basic-info`: Update the basic information of the current user.
* `PUT /api/v1/user/profile/social-links`: Update the social media links of the current user.
* `PUT /api/v1/user/profile/settings`: Update the notification settings of the current user.

### Posts

* `GET /api/v1/post/all/:page`: Get a paginated list of all posts.
* `POST /api/v1/post`: Create a new post.
* `DELETE /api/v1/post/:postId`: Delete a post.
* `PUT /api/v1/post/:postId`: Update a post.
* `PUT /api/v1/post/image/:postId`: Update a post with an image.
* `PUT /api/v1/post/video/:postId`: Update a post with a video.

### Reactions

* `GET /api/v1/post/reactions/:postId`: Get reactions for a post.
* `POST /api/v1/post/reaction`: Add a reaction to a post.
* `DELETE /api/v1/post/reaction/:postId/:previousReaction/:postReactions`: Remove a reaction from a post.

### Comments

* `POST /api/v1/post/comment`: Add a comment to a post.
* `GET /api/v1/post/comments/:postId`: Get all comments for a post.
* `GET /api/v1/post/commentsnames/:postId`: Get the names of users who commented on a post.

### Followers

* `PUT /api/v1/user/follow/:followeeId`: Follow a user.
* `PUT /api/v1/user/unfollow/:followerId/:followeeId`: Unfollow a user.
* `PUT /api/v1/user/block/:followerId`: Block a user.
* `PUT /api/v1/user/unblock/:followerId`: Unblock a user.
* `GET /api/v1/user/following`: Get the list of users the current user is following.
* `GET /api/v1/user/followers/:userId`: Get the list of followers for a user.

### Chat

* `GET /api/v1/chat/message/conversation-list`: Get the conversation list of the current user.
* `GET /api/v1/chat/message/user/:receiverId`: Get chat messages between the current user and another user.
* `POST /api/v1/chat/message`: Send a chat message.
* `PUT /api/v1/chat/message/mark-as-read`: Mark chat messages as read.
* `DELETE /api/v1/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type`: Delete a chat message.

### Notifications

* `GET /api/v1/notifications`: Get all notifications for the current user.
* `PUT /api/v1/notification/:notificationId`: Mark a notification as read.
* `DELETE /api/v1/notification/:notificationId`: Delete a notification.

## Testing

To run the tests, use the following command:

```bash
npm test
```
