const bcrypt = require('bcrypt');

module.exports.comparePasswords = async function (
  plainPassword,
  hashedPassword
) {
  try {
    // Comparing the plain text password with the hashed password
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

    // Returning the comparison result (true if they match, false otherwise)
    return isMatch;
  } catch (error) {
    console.error('An error occurred during the password comparison:', error);
    throw error;
  }
};

module.exports.hashPassword = async function (password) {
  try {
    // Generating a salt with 10 rounds (you can increase this number for higher security)
    const salt = await bcrypt.genSalt(10);

    // Hashing the password with the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Returning the hashed password
    return hashedPassword;
  } catch (error) {
    console.error('An error occurred during the hashing process:', error);
    throw error;
  }
};
