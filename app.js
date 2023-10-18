const express = require('express');
const app = express();
const clinicRoutes = require('./routes/clinic');
const clinicUserRoutes = require('./routes/clinicusers');
const bodyParser = require('body-parser');
const { send } = require('process');
const cors = require('cors');

global.URL = 'localhost:3000';
app.use(
  cors({
    origin: 'http://localhost:4200', // replace with your Angular app's address
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Add middleware, routes, and other configurations here
app.use('/api/clinic', clinicRoutes);

app.use('/api/clinicusers', clinicUserRoutes);

const user_booking = require('./routes/userBookings');
app.use('/api/userbookings', user_booking);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/*


*/
