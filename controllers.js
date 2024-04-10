import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import connection from "./database.js";

const validation_result = validationResult.withDefaults({
    formatter: (error) => error.msg,
});

export default {
    isNotLoggedIn: (req, res, next) => {
        if (typeof req.session.user_id != "undefined") {
            return res.redirect("/home");
        }
        next();
    },
    signup: {
        get: (req, res) => {
            res.render("signup");
        },
        post: async (req, res, next) => {
            const errors = validation_result(req).mapped();
            if (Object.keys(errors).length) {
                return res.render("signup", {
                    validation_errors: JSON.stringify(errors),
                    prev_values: req.body,
                });
            }

            try {
                const { username, email, password } = req.body;
                const saltRounds = 10;
                const hashPassword = await bcrypt.hash(password, saltRounds);

                await connection.execute(
                    "INSERT INTO `users` (`name`,`email`,`password`) VALUES (?,?,?)",
                    [username, email, hashPassword]
                );

                res.render("signup", { success: true });
            } catch (err) {
                next(err);
            }
        },
    },

    login: {
        get: (req, res) => {
            res.render("login");
        },
        post: async (req, res, next) => {
            const errors = validation_result(req).mapped();
            if (Object.keys(errors).length) {
                return res.render("login", {
                    validation_errors: JSON.stringify(errors),
                    prev_values: req.body,
                });
            }

            try {
                const { user, password } = req.body;
                const verifyPassword = await bcrypt.compare(
                    password,
                    user.password
                );
                if (!verifyPassword) {
                    return res.render("login", {
                        validation_errors: JSON.stringify({
                            password: "Incorrect Password",
                        }),
                        prev_values: req.body,
                    });
                }

                req.session.user_id = user.id;
                res.redirect("/home");
            } catch (err) {
                next(err);
            }
        },
    },

    home: async (req, res, next) => {
        const user_id = req.session.user_id;

        if (typeof user_id == "undefined") {
            return res.redirect("/logout");
        }
        try {
            let sql = "SELECT * FROM `users` WHERE `id`=?";
            const [row] = await connection.execute(sql, [user_id]);
            if (row.length) {
                const user = row[0];
                return res.render("home", {
                    name: user.name,
                    email: user.email,
                });
            }
            res.redirect("/logout");
        } catch (err) {
            next(err);
        }
    },
};
