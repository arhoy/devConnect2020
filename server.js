const express = require('express');
const connectDB = require('./config/db');
const app = express();

// connect to the database
connectDB();

// Init the middleware to get data in the body request.
app.use(express.json({ extended: true }));

app.get('/', (req, res) => res.send('API running'));

// Define the routes
// first argument is the url endpoint, second argument is where to look for it in folder.
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/postRelated/posts'));
app.use('/api/comments', require('./routes/api/postRelated/comments'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/profile', require('./routes/api/profileExperience'));
app.use('/api/profile', require('./routes/api/profileEducation'));

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
