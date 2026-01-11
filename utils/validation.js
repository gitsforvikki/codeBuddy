const validator = require("validator");

// this is the utilty function used for senitizing the user input at api lavel.
const validateSignupData = (req) => {
  const { firstName, lastName, email } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (firstName.length < 4 || firstName.length > 30) {
    throw new Error("First name should in between 4 to 50 character");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is Invalid.");
  }
}