// Copyright (c) 2025, Admin_ayan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Vehicle", {
	refresh(frm) {
		// Add custom validation on form refresh
		frm.add_custom_button(__('Validate Data'), function() {
			validateVehicleData(frm);
		});
	},

	make(frm) {
		validateMake(frm);
	},

	model(frm) {
		validateModel(frm);
	},

	year(frm) {
		validateYear(frm);
	},

	license_plate(frm) {
		validateLicensePlate(frm);
	},

	color(frm) {
		validateColor(frm);
	}
});

// Validation functions
function validateMake(frm) {
	const make = frm.doc.make;
	
	if (!make) {
		frm.set_df_property('make', 'description', '');
		return;
	}
	
	if (make.length < 2) {
		frm.set_df_property('make', 'description', 'Make must be at least 2 characters long');
		frm.set_df_property('make', 'description_style', 'color: red;');
	} else if (!/^[a-zA-Z0-9\s\-\.]+$/.test(make)) {
		frm.set_df_property('make', 'description', 'Make can only contain letters, numbers, spaces, hyphens, and periods');
		frm.set_df_property('make', 'description_style', 'color: red;');
	} else {
		frm.set_df_property('make', 'description', '✓ Valid make');
		frm.set_df_property('make', 'description_style', 'color: green;');
	}
}

function validateModel(frm) {
	const model = frm.doc.model;
	
	if (!model) {
		frm.set_df_property('model', 'description', '');
		return;
	}
	
	if (model.length < 2) {
		frm.set_df_property('model', 'description', 'Model must be at least 2 characters long');
		frm.set_df_property('model', 'description_style', 'color: red;');
	} else if (!/^[a-zA-Z0-9\s\-\.]+$/.test(model)) {
		frm.set_df_property('model', 'description', 'Model can only contain letters, numbers, spaces, hyphens, and periods');
		frm.set_df_property('model', 'description_style', 'color: red;');
	} else {
		frm.set_df_property('model', 'description', '✓ Valid model');
		frm.set_df_property('model', 'description_style', 'color: green;');
	}
}

function validateYear(frm) {
	const year = frm.doc.year;
	const currentYear = new Date().getFullYear();
	
	if (!year) {
		frm.set_df_property('year', 'description', '');
		return;
	}
	
	// Check if year is a 4-digit number
	if (!Number.isInteger(year) || year.toString().length !== 4) {
		frm.set_df_property('year', 'description', 'Year must be a 4-digit number');
		frm.set_df_property('year', 'description_style', 'color: red;');
		return;
	}
	
	// Check if year is between 2000 and current year
	if (year < 2000 || year > currentYear) {
		frm.set_df_property('year', 'description', `Year must be between 2000 and ${currentYear}`);
		frm.set_df_property('year', 'description_style', 'color: red;');
	} else {
		frm.set_df_property('year', 'description', '✓ Valid year');
		frm.set_df_property('year', 'description_style', 'color: green;');
	}
}

function validateLicensePlate(frm) {
	const licensePlate = frm.doc.license_plate;
	
	if (!licensePlate) {
		frm.set_df_property('license_plate', 'description', '');
		return;
	}
	
	// Check format: 2 letters + 2 digits + 2 letters + 4 digits
	const licensePattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
	
	if (!licensePattern.test(licensePlate.toUpperCase())) {
		frm.set_df_property('license_plate', 'description', 'License plate must be in format: 2 letters + 2 digits + 2 letters + 4 digits (e.g., HR23BS2345)');
		frm.set_df_property('license_plate', 'description_style', 'color: red;');
		return;
	}
	
	// Check uniqueness (only if not a new document)
	if (frm.doc.name && frm.doc.name !== 'Vehicle') {
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Vehicle',
				filters: {
					license_plate: licensePlate.toUpperCase(),
					name: ['!=', frm.doc.name]
				},
				limit: 1
			},
			callback: function(r) {
				if (r.message && r.message.length > 0) {
					frm.set_df_property('license_plate', 'description', 'License plate already exists');
					frm.set_df_property('license_plate', 'description_style', 'color: red;');
				} else {
					frm.set_df_property('license_plate', 'description', '✓ Valid license plate');
					frm.set_df_property('license_plate', 'description_style', 'color: green;');
				}
			}
		});
	} else {
		frm.set_df_property('license_plate', 'description', '✓ Valid license plate format');
		frm.set_df_property('license_plate', 'description_style', 'color: green;');
	}
}

function validateColor(frm) {
	const color = frm.doc.color;
	
	if (!color) {
		frm.set_df_property('color', 'description', '');
		return;
	}
	
	if (color.length < 2) {
		frm.set_df_property('color', 'description', 'Color must be at least 2 characters long');
		frm.set_df_property('color', 'description_style', 'color: red;');
	} else if (!/^[a-zA-Z\s\-]+$/.test(color)) {
		frm.set_df_property('color', 'description', 'Color can only contain letters, spaces, and hyphens');
		frm.set_df_property('color', 'description_style', 'color: red;');
	} else {
		frm.set_df_property('color', 'description', '✓ Valid color');
		frm.set_df_property('color', 'description_style', 'color: green;');
	}
}

function validateVehicleData(frm) {
	let isValid = true;
	const errors = [];
	
	// Validate required fields
	if (!frm.doc.make) {
		errors.push('Make is required');
		isValid = false;
	}
	
	if (!frm.doc.model) {
		errors.push('Model is required');
		isValid = false;
	}
	
	if (!frm.doc.year) {
		errors.push('Year is required');
		isValid = false;
	}
	
	if (!frm.doc.license_plate) {
		errors.push('License Plate is required');
		isValid = false;
	}
	
	// Validate year range
	if (frm.doc.year) {
		const currentYear = new Date().getFullYear();
		if (!Number.isInteger(frm.doc.year) || frm.doc.year.toString().length !== 4) {
			errors.push('Year must be a 4-digit number');
			isValid = false;
		} else if (frm.doc.year < 2000 || frm.doc.year > currentYear) {
			errors.push(`Year must be between 2000 and ${currentYear}`);
			isValid = false;
		}
	}
	
	// Validate license plate format
	if (frm.doc.license_plate) {
		const licensePattern = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
		if (!licensePattern.test(frm.doc.license_plate.toUpperCase())) {
			errors.push('License plate must be in format: 2 letters + 2 digits + 2 letters + 4 digits (e.g., HR23BS2345)');
			isValid = false;
		}
	}
	
	// Show validation results
	if (isValid) {
		frappe.msgprint({
			title: __('Validation Successful'),
			message: __('All vehicle data is valid and ready to save.'),
			indicator: 'green'
		});
	} else {
		frappe.msgprint({
			title: __('Validation Errors'),
			message: __('Please fix the following errors:<br><br>' + errors.join('<br>')),
			indicator: 'red'
		});
	}
}
