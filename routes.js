import { Router } from "express";
import { body } from "express-validator";
import controllers from "./controllers.js";
import connection from "./database.js";

const routes = Router({ strict: true });

const { isNotLoggedIn, signup, login, home } = controllers;

routes.get("/", (req, res) => {
    res.redirect("/login");
});

routes.get("/signup", isNotLoggedIn, signup.get);
routes.get("/login", isNotLoggedIn, login.get);
routes.get("/home", home);

routes.get("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
});

routes.post(
    "/signup",
    isNotLoggedIn,
    [
        body("username")
            .trim()
            .not()
            .isEmpty()
            .withMessage("username must not be empty.")
            .isLength({ min: 3 })
            .withMessage("username at least 3 characters long")
            .unescape()
            .escape(),
        body("email", "Invalid email address")
            .trim()
            .toLowerCase()
            .isEmail()
            .custom(async (email) => {
                let sql = "SELECT * FROM `users` WHERE `email`=?";
                const [row] = await connection.execute(sql, [email]);
                if (row.length)
                    throw new Error(
                        "A user already exists with this e-mail address"
                    );
                return true;
            }),
        body("password")
            .trim()
            .isLength({ min: 4 })
            .withMessage("Password at least 4 characters long."),
    ],
    signup.post
);

routes.post(
    "/login",
    isNotLoggedIn,
    [
        body("email", "Invalid email address")
            .trim()
            .toLowerCase()
            .isEmail()
            .custom(async (email, { req }) => {
                let sql = "SELECT * FROM `users` WHERE `email`=?";
                const [row] = await connection.execute(sql, [email]);
                if (row.length === 0)
                    throw new Error("Your email is not registered.");
                req.body.user = row[0];
                return true;
            }),
        body("password")
            .trim()
            .isLength({ min: 4 })
            .withMessage("Password at least 4 characters long."),
    ],
    login.post
);

export default routes;
