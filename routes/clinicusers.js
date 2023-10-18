const express = require('express');
const router = express.Router();
const { executeQuery } = require('../pool');
const jwt = require('jsonwebtoken'); // Import the JWT library
const generics = require('./generics');

// API to create a new user
router.post('/createUser', async (req, res) => {
  try {
    const {
      user_full_name,
      user_email,
      user_phone,
      user_email_validated,
      user_photo,
      user_description,
      user_qualification,
      usertype,
      clinicid,
      usertiming,
    } = req.body;

    // Insert a new user record
    const insertUserQuery =
      'INSERT INTO clinicusers (user_full_name, user_email, user_phone, user_email_validated, user_photo, user_description, user_qualification, usertype, clinicid, usertiming) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    await executeQuery(insertUserQuery, [
      user_full_name,
      user_email,
      user_phone,
      user_email_validated,
      user_photo,
      user_description,
      user_qualification,
      usertype,
      clinicid,
      JSON.stringify(usertiming), // Convert usertiming JSON to a string
    ]);

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while creating the user.' });
  }
});

// API to update a user's details and set isactive to true
router.put('/updateUser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      user_full_name,
      user_email,
      user_phone,
      user_email_validated,
      user_photo,
      user_description,
      user_qualification,
      usertype,
      clinicid,
      usertiming,
    } = req.body;

    // Check if the user exists
    const checkUserQuery = 'SELECT * FROM clinicusers WHERE user_id = ?';
    const [existingUser] = await executeQuery(checkUserQuery, [userId]);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the user's details and set isactive to true
    const updateUserQuery =
      'UPDATE clinicusers SET user_full_name = ?, user_email = ?, user_phone = ?, user_email_validated = ?, user_photo = ?, user_description = ?, user_qualification = ?, usertype = ?, clinicid = ?, usertiming = ?, isactive = true WHERE user_id = ?';
    await executeQuery(updateUserQuery, [
      user_full_name,
      user_email,
      user_phone,
      user_email_validated,
      user_photo,
      user_description,
      user_qualification,
      usertype,
      clinicid,
      JSON.stringify(usertiming), // Convert usertiming JSON to a string
      userId,
    ]);

    res.status(200).json({ message: 'User details updated successfully.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating the user.' });
  }
});

// API to enable/disable a user by ID
router.put('/enableDisableUser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isactive } = req.body;

    // Check if the user exists
    const checkUserQuery = 'SELECT * FROM clinicusers WHERE user_id = ?';
    const [existingUser] = await executeQuery(checkUserQuery, [userId]);

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update the user's isactive status based on the provided value
    const updateUserQuery =
      'UPDATE clinicusers SET isactive = ? WHERE user_id = ?';
    await executeQuery(updateUserQuery, [isactive, userId]);

    res.status(200).json({ message: 'User status updated successfully.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating the user status.' });
  }
});

// API to get user details by ID
router.get('/getUserDetails/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Retrieve user details by ID
    const getUserQuery = 'SELECT * FROM clinicusers WHERE user_id = ?';
    const [user] = await executeQuery(getUserQuery, [userId]);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching user details.' });
  }
});

// API to get all users of a clinic by clinic ID
router.get('/getAllUsersofClinic/:clinicId', async (req, res) => {
  try {
    const { clinicId } = req.params;
    // Retrieve all users of the clinic by clinic ID
    const getAllUsersQuery = 'SELECT * FROM clinicusers WHERE clinicid = ?';
    const users = await executeQuery(getAllUsersQuery, [clinicId]);

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching clinic users.' });
  }
});

// API for user login
router.post('/login', async (req, res) => {
  try {
    const { user_email, password } = req.body;

    // Check if the user is active
    const checkUserActiveQuery =
      'SELECT * FROM clinicusers WHERE user_email = ? AND isactive = true';
    const [user] = await executeQuery(checkUserActiveQuery, [user_email]);

    if (!user) {
      return res.status(201).json({ message: 'User is not active.' });
    }

    // Compare passwords using your async function (comparePasswords)
    const isPasswordMatch = await generics.comparePasswords(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Password does not match.' });
    }
    secretKey = '123456';
    // Generate a JWT token with the user data (excluding the password)
    const userData = { ...user, password: undefined };
    const token = jwt.sign(userData, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred during login.' });
  }
});

module.exports = router;
