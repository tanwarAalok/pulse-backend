# Pulse Backend

This is the backend for Pulse, a social media application with features for posts, real-time chat, notifications, and more.

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
    Create a `.env` file in the root directory and add the following environment variables. You can use the provided `.env.example` as a template.

4.  **Start the development server:**
    ```bash
    npm run dev
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
