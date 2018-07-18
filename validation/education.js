const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  dataFields = ["school", "degree", "fieldofstudy", "from"];
  dataFields.forEach(field => {
    data[field] = !isEmpty(data[field]) ? data[field] : "";
    if (Validator.isEmpty(data[field])) {
      errors[field] = `${field} is required`;
    }
  });

  if (Validator.isEmpty(data.fieldofstudy)) {
    errors.fieldofstudy = "Field of study is required;";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
