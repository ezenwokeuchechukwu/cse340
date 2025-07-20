
"use strict";

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
	// Get a list of items in inventory based on the classification_id
	const classificationList = document.querySelector("#classificationList");
	if (classificationList) {
		classificationList.addEventListener("change", function () {
			let classification_id = classificationList.value;
			console.log(`classification_id is: ${classification_id}`);
			let classIdURL = "/inv/getInventory/" + classification_id;
			console.log("Fetching from URL:", classIdURL);
			fetch(classIdURL)
				.then(function (response) {
					console.log("Response status:", response.status);
					if (response.ok) {
						return response.json();
					}
					throw Error("Network response was not OK");
				})
				.then(function (data) {
					console.log("Data received:", data);
					buildInventoryList(data);
				})
				.catch(function (error) {
					console.log("There was a problem: ", error.message);
				});
		});
	} else {
		console.error("Classification select list not found");
	}
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
	console.log("Building inventory list with data:", data);
	let inventoryDisplay = document.getElementById("inventoryDisplay");
	// Set up the table labels
	let dataTable = "<thead>";
	dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
	dataTable += "</thead>";
	// Set up the table body
	dataTable += "<tbody>";
	// Iterate over all vehicles in the array and put each in a row
	data.forEach(function (element) {
		console.log("Processing vehicle:", element);
		dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
		dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
		dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
	});
	dataTable += "</tbody>";
	console.log("Final HTML:", dataTable);
	// Display the contents in the Inventory Management view
	inventoryDisplay.innerHTML = dataTable;
}
