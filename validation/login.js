const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  dataFields = ["email", "password"];
  dataFields.forEach(field => {
    data[field] = !isEmpty(data[field]) ? data[field] : "";
    if (Validator.isEmpty(data[field])) {
      errors[field] = `${field} is required`;
    }
  });

  if (!Validator.isEmail(data.email) && !Validator.isEmpty(data.email)) {
    errors.email = "Email is invalid";
  } else if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
