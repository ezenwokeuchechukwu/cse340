const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data
  try {
    data = await invModel.getClassifications()
  } catch (error) {
    console.error("Error getting classifications:", error)
    return "<ul><li>Error loading navigation</li></ul>"
  }

  if (!data || data.length === 0) {
    console.error("No classification data returned.")
    return "<ul><li>No classifications found</li></ul>"
  }

  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.forEach((row) => {
    list += "<li>"
    list += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`
    list += "</li>"
  })

  // ✅ Add My Account link here
  list += '<li><a href="/account" title="My Account">My Account</a></li>'

  list += "</ul>"
  return list
}



/* ****************************************
 * Middleware For Handling Errors
 * Wrap controller functions with this
 **************************************** */
Util.handleErrors = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Build HTML for a single vehicle detail view
 **************************************** */
Util.buildVehicleDetail = function (vehicle) {
  return `
    <div class="vehicle-detail">
      <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
      <div class="vehicle-info">
        <p><strong>Price:</strong> $${vehicle.inv_price.toLocaleString()}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Miles:</strong> ${vehicle.inv_miles.toLocaleString()}</p>
      </div>
    </div>
  `
}
/* ****************************************
 * Build the classification grid view
 * Accepts an array of vehicle objects
 **************************************** */
Util.buildClassificationGrid = function (data) {
  let grid = '<ul id="inv-display">';
  data.forEach(vehicle => {
    grid += '<li>';
    grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`;
    grid += `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">`;
    grid += '</a>';
    grid += '<hr>';
    grid += `<h2>`;
    grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">`;
    grid += `${vehicle.inv_make} ${vehicle.inv_model}`;
    grid += '</a>';
    grid += '</h2>';
    grid += `<span>$${vehicle.inv_price.toLocaleString()}</span>`;
    grid += '</li>';
  });
  grid += '</ul>';
  return grid;
};

module.exports = Util
