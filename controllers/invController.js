const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
    // If invalid number, throw early
  if (isNaN(classification_id)) {
    return next({ status: 400, message: "Invalid classification ID." })
  }
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  if (data.length === 0) {
    // No vehicles found for the classification
    res.render("inventory/classification", {
      title: "No Vehicles Found",
      nav,
      grid: null,
    })
    return
  }
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build Vehicle Details view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id)
  const nav = await utilities.getNav()

  if (!data || data.length === 0) {
    // Vehicle not found
    const detail = '<p class="notice">Sorry, no matching vehicle could be found.</p>'
    res.render("inventory/detail", {
      title: "Vehicle Not Found",
      nav,
      detail,
    })
    return
  }
  
  const vehicleData = data[0]

  // Build the HTML string for the detail section
  const detail = await utilities.buildVehicleDetail([vehicleData])

  // Render the template
  res.render("inventory/detail", {
    title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    detail,
  })
}

/* ***************************
 *  Build Managment view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()  
  // Build the HTML Links for managing
  const links = await utilities.buildVehicleManagementLinks()

  // Render the template
  res.render("inventory/vehiclemanagement", {
    title: "Vehicle Management",
    nav,
    links,
    errors: null,
  })
}

/* ***************************
 *  Build Add Classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  const links = await utilities.buildVehicleManagementLinks()
  // Render the template
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    links,
    errors: null,
  })
}


/* ****************************************
*  Process New Classification
* *************************************** */
invCont.registerClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const classificationResult = await invModel.registerClassification(classification_name)
  if (classificationResult) {
    req.flash(
      "success",
      `The classification ${classification_name} was added successfully.`
    )    
    const nav = await utilities.getNav()
    res.status(201).render("inventory/add-classification", {
      title: "Add Classification",
      nav,     
      errors: null,
    })
  } else {
    req.flash(
      "notice",
      `The classification ${classification_name} was not added successfully.`
    )
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  Build Add Vehicle view
 * ************************** */
invCont.buildAddVehicle = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  // Render the template
  res.render("inventory/add-vehicle", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
  })  
}

/* ****************************************
*  Process New Vehicle
* *************************************** */
invCont.registerVehicle = async function (req, res) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  let { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  inv_thumbnail = "/" + inv_thumbnail  
  const vehicleResult = await invModel.registerVehicle(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
  if (vehicleResult) {
    req.flash(
      "success",
      `The vehicle ${inv_make} ${inv_model} was added successfully.`
    )
    res.status(201).render("inventory/add-vehicle", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
    })
  } else {
    req.flash(
      "notice",
      `The vehicle ${inv_make} ${inv_model} was not added successfully.`
    )
    res.status(501).render("inventory/add-vehicle", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: null,
    })
  }
}

/* ***************************
 *  Intentional Error 
 * ************************** */
invCont.causeError = async function(req, res, next) {
    
    throw new Error("This is an intentional error.");
    
    res.render("./", {
        title: "Intentional Error",
    })
}

  module.exports = invCont