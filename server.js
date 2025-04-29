const express = require('express');
const path = require('path');
const nano = require('nano')('http://nithish:nithish1456@127.0.0.1:5984'); // CouchDB connection
const app = express();
const port = 3000;

// Middleware for parsing form data and static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' folder
app.use('/destination', express.static(path.join(__dirname, 'public', 'destination')));

// Set up the CouchDB connection for the 'destinations' database
const destinationsDB = nano.db.use('destinations');

// Set up a view engine (EJS or any other template engine)
app.set('view engine', 'ejs'); // For EJS views
app.set('views', path.join(__dirname, 'views')); // Ensure the views are in the "views" directory

// Route to display the add destination form
app.get('/destinations/add', (req, res) => {
  res.render('add-destination'); // Render add destination page (EJS view)
});

// Route to handle the form submission (add destination with image URL)
app.post('/destinations/add', async (req, res) => {
  const { name, country, description, attractions, imageUrl } = req.body; // Accept imageUrl from form
  const attractionsList = attractions ? attractions.split(',').map(attraction => attraction.trim()) : [];

  if (!imageUrl) {
    return res.status(400).send('Image URL is required');
  }

  try {
    // Prepare the new destination document
    const newDestination = {
      type: 'destination',
      name,
      country,
      description,
      attractions: attractionsList,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      imageUrl // Store the image URL directly
    };

    // Insert the new destination document in the CouchDB database
    const insertedDoc = await destinationsDB.insert(newDestination);

    // Redirect to the destinations page after successful upload
    res.redirect('/destinations');
  } catch (error) {
    console.error('Error adding destination:', error);
    res.status(500).send('Error adding destination');
  }
});

// Route to fetch and display destinations (including image URL)
app.get('/destinations', async (req, res) => {
  try {
    const destinations = await destinationsDB.view('destinations', 'all');
    const destinationsData = destinations.rows.map(row => row.value);

    // Render the destinations view and pass the destinations data
    res.render('destinations', { destinations: destinationsData });
  } catch (err) {
    console.error('Error fetching destinations:', err);
    res.status(500).send('Error fetching destinations');
  }
});

// Error handling middleware for server errors
app.use((err, req, res, next) => {
  if (err) {
    return res.status(500).send(`Server error: ${err.message}`);
  }
  next();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
