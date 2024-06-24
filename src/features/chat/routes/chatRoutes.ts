import express, { Router } from 'express';
import { authMiddleware } from '@global/helpers/auth-middleware';
import {AddChatMessageController} from "@chat/controllers/add-chat-message";
import {GetChatMessageController} from "@chat/controllers/get-chat-message";
import {DeleteChatMessageController} from "@chat/controllers/delete-chat-message";
import {UpdateChatMessageController} from "@chat/controllers/update-chat-message";
import {AddMessageReactionController} from "@chat/controllers/add-message-reaction";


class ChatRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.get('/chat/message/conversation-list', authMiddleware.checkAuthentication, GetChatMessageController.prototype.conversationList);
        this.router.get('/chat/message/user/:receiverId', authMiddleware.checkAuthentication, GetChatMessageController.prototype.messages);
        this.router.post('/chat/message', authMiddleware.checkAuthentication, AddChatMessageController.prototype.message);
        this.router.post('/chat/message/add-chat-users', authMiddleware.checkAuthentication, AddChatMessageController.prototype.addChatUsers);
        this.router.post('/chat/message/remove-chat-users', authMiddleware.checkAuthentication, AddChatMessageController.prototype.removeChatUsers);
        this.router.put('/chat/message/mark-as-read', authMiddleware.checkAuthentication, UpdateChatMessageController.prototype.message);
        this.router.put('/chat/message/reaction', authMiddleware.checkAuthentication, AddMessageReactionController.prototype.reaction);
        this.router.delete(
            '/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type',
            authMiddleware.checkAuthentication,
            DeleteChatMessageController.prototype.markMessageAsDeleted
        );

        return this.router;
    }
}

export const chatRoutes: ChatRoutes = new ChatRoutes();