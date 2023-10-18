const express = require('express');
const router = express.Router();
const { executeQuery } = require('../pool'); // Import the executeQuery function
const { CLIENT_RENEG_WINDOW } = require('tls');
const generics = require('./generics');
router.post('/register', async (req, res) => {
  try {
    const { email, phone, clinicName, contactName } = req.body;

    // SQL query to insert a new clinic record
    const sql =
      'INSERT INTO clinicdetails (email, phone, clinicname, description, isactive) VALUES (?, ?, ?, ?,?)';

    // Execute the SQL query using the executeQuery function
    const results = await executeQuery(sql, [
      email,
      phone,
      clinicName,
      contactName,
      0,
    ]);

    const newClinicId = results.insertId;
    res.status(201).json({ id: newClinicId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
});

router.get('/verifyemail', async (req, res) => {
  //URL opens
  try {
    const { token } = req.query;
    const sql =
      'Select clinicid,email,description from clinicdetails where emailtoken=?';
    const results = await executeQuery(sql, [token]);

    const clinicId = results[0].clinicid;
    const email = results[0].email;
    const user_fullname = results[0].description;

    if (clinicId != null) {
      const sql1 =
        'update clinicdetails set emailvalidated =1 where clinicid = ?';
      const results1 = await executeQuery(sql1, [clinicId]);
      //send email with password
      createUsersendPassword(clinicId, email, user_fullname);
      res
        .status(200)
        .json({ status: 'successfully verified, password sent to your email' });
    } else {
      res.status(200).json({ status: 'Error in verification' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        'An error occurred during registration. The token seems to be not proper',
    });
  }
  //Verify teh token
  //update the email verified button
  //completed
});

router.post('/validateClinicEmail', async (req, res) => {
  const { clinicID } = req.body;
  sendEmailToken(clinicID, req, res);
});

// GET clinic details by ID
router.get('/:clinicId', async (req, res) => {
  try {
    const { clinicId } = req.params;

    // SQL query to retrieve clinic details by ID
    const sql = 'SELECT * FROM clinicdetails WHERE clinicid = ?';

    // Execute the SQL query using the executeQuery function
    const results = await executeQuery(sql, [clinicId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Clinic not found.' });
    }

    const clinic = results[0];
    res.json(clinic);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while fetching clinic details.' });
  }
});

// Update clinic details by ID
router.put('/:clinicId', async (req, res) => {
  try {
    const { clinicId } = req.params;
    const {
      clinicname,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      description,
      clinictype,
    } = req.body;

    // Check if the clinic exists
    const checkClinicQuery = 'SELECT * FROM clinicdetails WHERE clinicid = ?';
    const [existingClinic] = await executeQuery(checkClinicQuery, [clinicId]);

    if (!existingClinic) {
      return res.status(404).json({ message: 'Clinic not found.' });
    }

    // Update clinic details
    const updateClinicQuery =
      'UPDATE clinicdetails SET clinicname = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, country = ?, description = ?, clinictype = ? WHERE clinicid = ?';
    await executeQuery(updateClinicQuery, [
      clinicname,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
      description,
      clinictype,
      clinicId,
    ]);

    res.status(200).json({ message: 'Clinic details updated successfully.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating clinic details.' });
  }
});
// Update clinic logo by clinicId
router.put('/:clinicId/updatecliniclogo', async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { cliniclogo } = req.body;

    // Check if the clinic exists
    const checkClinicQuery = 'SELECT * FROM clinicdetails WHERE clinicid = ?';
    const [existingClinic] = await executeQuery(checkClinicQuery, [clinicId]);

    if (!existingClinic) {
      return res.status(404).json({ message: 'Clinic not found.' });
    }

    // Update clinic logo
    const updateClinicLogoQuery =
      'UPDATE clinicdetails SET cliniclogo = ? WHERE clinicid = ?';
    await executeQuery(updateClinicLogoQuery, [cliniclogo, clinicId]);

    res.status(200).json({ message: 'Clinic logo updated successfully.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating clinic logo.' });
  }
});
// Update clinic photos by clinicId
router.put('/:clinicId/updateclinicphotos', async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { clinicphotos } = req.body;

    // Check if the clinic exists
    const checkClinicQuery = 'SELECT * FROM clinicdetails WHERE clinicid = ?';
    const [existingClinic] = await executeQuery(checkClinicQuery, [clinicId]);

    if (!existingClinic) {
      return res.status(404).json({ message: 'Clinic not found.' });
    }

    // Update clinic photos
    const updateClinicPhotosQuery =
      'UPDATE clinicdetails SET clinicphotos = ? WHERE clinicid = ?';
    await executeQuery(updateClinicPhotosQuery, [
      JSON.stringify(clinicphotos),
      clinicId,
    ]);

    res.status(200).json({ message: 'Clinic photos updated successfully.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating clinic photos.' });
  }
});

// Update clinic timings by clinicId
router.put('/:clinicId/updateclinictimings', async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { clinictimings } = req.body;

    // Check if the clinic exists
    const checkClinicQuery = 'SELECT * FROM clinicdetails WHERE clinicid = ?';
    const [existingClinic] = await executeQuery(checkClinicQuery, [clinicId]);

    if (!existingClinic) {
      return res.status(404).json({ message: 'Clinic not found.' });
    }

    // Update clinic timings
    const updateClinicTimingsQuery =
      'UPDATE clinicdetails SET clinictimings = ? WHERE clinicid = ?';
    await executeQuery(updateClinicTimingsQuery, [
      JSON.stringify(clinictimings),
      clinicId,
    ]);

    res.status(200).json({ message: 'Clinic timings updated successfully.' });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'An error occurred while updating clinic timings.' });
  }
});

async function sendEmailToken(clinicID, req, res) {
  //Check if email is registered
  try {
    const sql =
      'Select emailvalidated, email,clinicname from clinicdetails where clinicid =?';
    const results = await executeQuery(sql, [clinicID]);
    let emvalidated = results[0].emailvalidated;
    let em = results[0].email;
    let clinicname = results[0].clinicname;

    if (emvalidated == null || emvalidated == false) {
      //Generate the token
      const { v4: uuidv4 } = require('uuid');

      // Generate a version 4 (random) UUID
      const randomUUID = uuidv4();

      console.log('Random UUID:', randomUUID);

      try {
        const sql1 = 'Update clinicdetails set emailtoken=? where clinicid = ?';
        const result1 = await executeQuery(sql1, [randomUUID, clinicID]);
        //successfull result
        //save the token
        //Send the email

        const replacecont = {
          CUSTOMERNAME: clinicname,
          URL: global.URL + '/api/clinic/verifyemail?token=' + randomUUID,
        };

        readEmailandSendContent(
          'registration.txt',
          'Email Verification - Appname',
          replacecont,
          em
        );
      } catch (error) {
        console.error(error);
      }
    }
    res.status(201).json({ status: 'success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred during registration.' });
  }
}
function readEmailandSendContent(filename, subject, replacecont, email) {
  const fs = require('fs');
  const filePath = './templates/' + filename;

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }
    // The contents of the file are in the 'data' variable.
    //console.log('File contents:', data);
    Object.entries(replacecont).forEach(([key, value]) => {
      data = data.replace('[' + key + ']', value);
      console.log(`Key: ${key}, Value: ${value}`);
    });

    sendEmail(data, subject, email);
  });
}

function sendEmail(data, subject, email) {
  const mailOptions = {
    from: 'john@tigrissolution.com', // sender address
    to: email,
    subject: subject, // Subject line
    html: data, // plain text body
  };

  const transporter = require('../mailer');

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      // handle error
      console.log('Error in sending email');
    }
  });
}

async function createUsersendPassword(clinicID, email, fullname) {
  try {
    //Check if user already exists
    const sql = 'Select user_id from clinicusers where user_email =?';
    const results = await executeQuery(sql, [email]);
    if (results.length > 0) {
      let user_id = results[0].user_id;
      console.log('User exists');
    } else {
      console.log('New user');
      try {
        //create the user and update the passwords
        let pass = Math.floor(Math.random() * 1000000);
        //6 digit random password
        // Example usage:

        generics
          .hashPassword(pass.toString())
          .then(async (hashedPassword) => {
            const sql1 =
              'insert into clinicusers (user_full_name,user_email,clinicid,password,usertype,user_email_validated) values (?,?,?,?,?,?)';
            const result1 = await executeQuery(sql1, [
              fullname,
              email,
              clinicID,
              hashedPassword,
              'Admin',
              1,
            ]);
          })
          .catch((error) => {
            console.error('An error occurred:', error);
          });

        //email the password
        const replacecont = {
          CUSTOMERNAME: fullname,
          PASSWORD: pass,
        };

        readEmailandSendContent(
          'regpassword.txt',
          'Account Activation Email',
          replacecont,
          email
        );
      } catch (err) {
        console.log(err.message);
      }
    }

    //If exists, show error
    //if does not exist, create user
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = router;
