const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  dataFields = ["name", "email", "password", "password2"];
  dataFields.forEach(field => {
    data[field] = !isEmpty(data[field]) ? data[field] : "";
    if (Validator.isEmpty(data[field])) {
      errors[field] = `${field} is required`;
    }
  });

  if (
    !Validator.isLength(data.name, { min: 2, max: 30 }) &&
    !Validator.isEmpty(data.name)
  ) {
    errors.name = "Name must be between 2 and 30 characters";
  } else if (Validator.isEmpty(data.name)) {
    errors.name = "Name is required";
  }

  if (!Validator.isEmail(data.email) && !Validator.isEmpty(data.email)) {
    errors.email = "Email is invalid";
  } else if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  if (
    !Validator.isLength(data.password, { min: 6, max: 30 }) &&
    !Validator.isEmpty(data.password)
  ) {
    errors.password = "Password must be between 6 and 30 characters";
  } else if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  if (
    !Validator.equals(data.password, data.password2) &&
    !Validator.isEmpty(data.password2)
  ) {
    errors.password2 = "Passwords must match";
  } else if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
