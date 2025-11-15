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
 * Check classification data and return errors or continue to registration
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

/*  **********************************
  *  Vehicle Data Validation Rules
  * ********************************* */
validate.vehicleRules = () => {
  return [
    // Vehicle Classification
    body("classification_id")
      .trim()
      .notEmpty()      
      .withMessage("Vehicle classification ID is mandatory."),

    // Vehicle Make
    body("inv_make")
      .trim()      
      .isLength({ min: 2 })
      .withMessage("Vehicle make is mandatory and must be at least 2 characters long."),

    // Vehicle Model
    body("inv_model")
      .trim()      
      .isLength({ min: 2 })
      .withMessage("Vehicle model is mandatory and must be at least 2 characters long."),

    // Vehicle Description
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Vehicle description is required."),

    // Vehicle Image
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Vehicle image is required."),

    // Vehicle Thumbnail
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Vehicle thumbnail is required."),

    // Vehicle Price
    body("inv_price")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Vehicle price must be a number."),

    // Vehicle Year
    body("inv_year")
      .trim()
      .notEmpty()
      .isNumeric()
      .matches(/^(19[0-9]{2}|20[0-2][0-9]|2030)$/)
      .withMessage("Vehicle year must be a number between 1900 and 2030."),

    // Vehicle Miles
    body("inv_miles")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Vehicle miles must be a number."),

    // Vehicle Color
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Vehicle color is required."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkVehicleData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {    
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-vehicle", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}

/* ******************************
 * Errors will be directed back to edit view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {    
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/edit-vehicle", {
      title: "Edit Vehicle",
      nav,
      classificationList,
      errors,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id
    })
    return
  }
  next()
}



module.exports = validate