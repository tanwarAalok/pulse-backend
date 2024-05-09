import express, {Router} from "express";
import {Signup} from "@auth/controllers/signup";
import {SignIn} from "@auth/controllers/singin";
import {Signout} from "@auth/controllers/signout";
import {Password} from "@auth/controllers/password";
class AuthRoutes{
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router{
        this.router.post('/signup', Signup.prototype.create);
        this.router.post('/signin', SignIn.prototype.read);
        this.router.post('/forgot-password', Password.prototype.create);
        this.router.post('/reset-password/:token', Password.prototype.update);
        return this.router;
    }

    public signoutRoute(): Router{
        this.router.get('/signout', Signout.prototype.update);

        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();