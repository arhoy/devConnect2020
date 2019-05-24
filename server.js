const express = require('express');
const connectDB = require('./config/db');
const app = express();

// connect to the database
connectDB();

// Init the middleware to get data in the body request.
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API running'));

// Define the routes
// first argument is the path, second is what function to return
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
