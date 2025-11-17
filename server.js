const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const expressLayouts = require("express-ejs-layouts");
const cors = require('cors');

const { bindUser, authenticate, isAdmin } = require('./middlewares/authenticate');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const skillRoutes = require('./routes/skillsRoutes');
const profileSkillRoutes = require('./routes/profileSkillsRoutes');
const socialLinksRoutes = require('./routes/socialLinksRoutes');

const app = express();

/* ---------------------------- Middlewares ---------------------------- */
app.use(expressLayouts);
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(express.static('views'));

app.set('public', path.join(__dirname, 'public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Default layout
app.set("layout", "layouts/public");


/* ---------------------- Bind User First (Global) ---------------------- */
app.use(bindUser);

/* Assign user & layout to EJS */
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.path = req.path;

    // Auto-switch layout
    res.locals.layout = req.path.startsWith("/admin")
        ? "layouts/admin"
        : "layouts/public";

    next();
});

/* ----------------------------- Public Routes ----------------------------- */
app.use('/auth', authRoutes);

/* ----------------------- Protected User Routes ----------------------- */
app.use('/profiles', authenticate, profileRoutes);
app.use('/projects', authenticate, projectRoutes);
app.use('/skills', authenticate, skillRoutes);
app.use('/profile-skills', authenticate, profileSkillRoutes);
app.use('/social-links', authenticate, socialLinksRoutes);

/* --------------------------- Admin Routes --------------------------- */
// Example: Add admin route group here
// app.use('/admin', authenticate, isAdmin, require('./routes/adminRoutes'));

/* ----------------------------- Home Page ----------------------------- */
app.get('/', (req, res) => {
    res.render('index', { title: "DevFolio" });
});

/* ------------------------------ 404 Page ------------------------------ */
app.use((req, res) => {
    res.status(404).render('notfound', { title: "404" });
});

/* ----------------------------- Start Server ----------------------------- */
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
