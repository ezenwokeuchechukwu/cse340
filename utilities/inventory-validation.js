const utilities = require(".");
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a classification name.")
            .matches(/^[^\s\W]+$/)
            .withMessage("Classification name cannot contain spaces or special characters.")
    ]
}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
    return [
        body("classification_id")
            .isNumeric()
            .withMessage("Please select a classification."),

        body("inv_make")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide the vehicle make."),

        body("inv_model")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide the vehicle model."),

        body("inv_year")
            .trim()
            .isLength({ min: 4, max: 4 })
            .isNumeric()
            .withMessage("Please provide a valid 4-digit year."),

        body("inv_description")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a vehicle description."),

        body("inv_image")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide an image path."),

        body("inv_thumbnail")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a thumbnail path."),

        body("inv_price")
            .trim()
            .isNumeric()
            .withMessage("Please provide a valid price."),

        body("inv_miles")
            .trim()
            .isNumeric()
            .withMessage("Please provide valid mileage."),

        body("inv_color")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a vehicle color.")
    ]
}

/*  **********************************
 *  Check data and return errors or continue to registration
 * ********************************* */
validate.checkData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        if (req.originalUrl.includes('add-inventory')) {
            const classificationList = await utilities.buildClassificationList(req.body.classification_id)
            res.render("inventory/add-inventory", {
                errors: errors.array(),
                title: "Add New Vehicle",
                nav,
                classificationList,
                ...req.body,
            })
        } else {
            res.render("inventory/add-classification", {
                errors: errors.array(),
                title: "Add New Classification",
                nav,
            })
        }
        return
    }
    next()
}

/* ******************************
 * Check data and return to edit view if errors exist
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    return
  }
  next()
}

module.exports = validate