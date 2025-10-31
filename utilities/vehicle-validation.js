const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}


/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z]+$/)
      .withMessage("Classification name must contain only letters (no spaces, numbers, or special characters)."),
  ]
}


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    })
    return
  }
  next()
}

module.exports = validate