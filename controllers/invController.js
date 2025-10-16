const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
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


  module.exports = invCont