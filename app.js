import express from "express";
import session from "express-session";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import connection from './database.js'
import routes from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views' ));


app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
  }))

app.use(express.urlencoded({ extended: false }));

app.use(routes);

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    res.status(err.statusCode).send(err.message);
});


connection.getConnection().then(() => {
    app.listen(PORT, () => console.log(`Server is runngin on port ${PORT}`));
}).catch(err => {
    console.log(err.message);
});



