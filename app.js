const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const nano = require('nano');
const axios = require('axios');
const { usersDB, destinationsDB, bookingsDB } = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const destinationsRoutes = require('./routes/destinationsRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes'); // Add chatbot routes

const app = express();
const PORT = 3000;

// CouchDB connection setup
const couchdb = nano("http://nithish:nithish1456@127.0.0.1:5984");
const contactsDB = couchdb.db.use("contacts");
const chatbotDB = couchdb.db.use('chatbot_responses');

// Middleware Setup
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/destination', express.static(path.join(__dirname, 'public', 'destination')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session Management
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Global session middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    next();
});

// Register Routes
app.use('/admin', adminRoutes);
app.use('/book', bookingRoutes);
app.use('/destinations', destinationsRoutes);
app.use('/chatbot', chatbotRoutes); // Add chatbot routes

// User Authentication Routes
app.get('/auth/login', (req, res) => res.render('login'));

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await usersDB.get('user_' + email);
        if (user.password === password) {
            req.session.user = user;
            res.redirect('/');
        } else {
            res.render('login', { error: 'Invalid credentials' });
        }
    } catch (err) {
        res.render('login', { error: 'User not found' });
    }
});

app.get('/auth/signup', (req, res) => res.render('signup'));

app.post('/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await usersDB.get('user_' + email);
        if (existingUser) return res.render('signup', { error: 'User already exists' });
        await usersDB.insert({ _id: 'user_' + email, name, email, password });
        res.redirect('/auth/login');
    } catch (err) {
        if (err.statusCode === 404) {
            await usersDB.insert({ _id: 'user_' + email, name, email, password });
            res.redirect('/auth/login');
        } else {
            res.render('signup', { error: 'Error signing up' });
        }
    }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy(err => err ? res.status(500).send('Error logging out') : res.redirect('/auth/login'));
});

// Admin Routes
app.get('/admin/login', (req, res) => res.render('admin_login'));

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await usersDB.get('admin_' + email);
        if (admin.password === password) {
            req.session.admin = admin;
            res.redirect('/admin/dashboard');
        } else {
            res.render('admin_login', { error: 'Invalid admin credentials' });
        }
    } catch (err) {
        res.render('admin_login', { error: 'Error logging in' });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy(err => err ? res.status(500).send('Error logging out') : res.redirect('/admin/login'));
});

app.get('/admin/dashboard', (req, res) => {
    if (!req.session.admin) return res.redirect('/admin/login');
    res.render('admin/dashboard', { admin: req.session.admin, page: req.query.page || 'overview' });
});

// Main User Routes
app.get('/', async (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    try {
        const destinations = await destinationsDB.view('destinations', 'all');
        res.render('home', { 
            destinations: destinations.rows.map(row => row.value),
            user: req.session.user 
        });
    } catch (err) {
        console.error('Error fetching destinations:', err);
        res.status(500).send('Error fetching destinations');
    }
});

// Static Pages Routes
['about', 'packages', 'contact', 'booknow', 'trackvehicle', 'viewhotel'].forEach(page => {
    app.get(`/${page}`, (req, res) => {
        if (!req.session.user) return res.redirect('/auth/login');
        res.render(page);
    });
});

// Success Page
app.get('/success', (req, res) => res.render('success'));

// Contact Route (Get)
app.get('/contact', (req, res) => {
    if (!req.session.user) return res.redirect('/auth/login');
    res.render('contact');
});

// Handle Contact Form Submission (Post) and Send Email via EmailJS
app.post('/contact', async (req, res) => {
    try {
        const contactData = req.body;

        // Check if contacts database exists
        const dbExists = await couchdb.db.get('contacts').catch(() => null);
        if (!dbExists) {
            await couchdb.db.create('contacts');
            console.log("Database 'contacts' created.");
        }

        // Insert contact form data into CouchDB
        const response = await contactsDB.insert(contactData);
        console.log('Contact data inserted into CouchDB:', response);

        // Prepare EmailJS payload
        const emailData = {
            service_id: 'service_q2ojyga',
            template_id: 'template_ggt90sc',
            user_id: 'user_F1Sg7KjMkC7h7RZCUpzqv',
            template_params: {
                name: contactData.name,
                email: contactData.email,
                message: contactData.message
            }
        };

        // Send the email using EmailJS via Axios
        const emailResponse = await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData);
        console.log('Email sent successfully:', emailResponse.data);

        // Return success message
        res.json({ message: "Message sent successfully", id: response.id });

    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).send("Error submitting contact form");
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});