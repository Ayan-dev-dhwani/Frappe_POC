// Copyright (c) 2025, Admin_ayan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Driver", {
	refresh(frm) {
		// Add custom validation on form refresh
		frm.add_custom_button(__('Validate Data'), function() {
			validateDriverData(frm);
		});
	},

	first_name(frm) {
		validateFirstName(frm);
	},

	last_name(frm) {
		validateLastName(frm);
	},

	license_number(frm) {
		validateLicenseNumber(frm);
	},

	phone_number(frm) {
		validatePhoneNumber(frm);
	},

	profile_image(frm) {
		validateProfileImage(frm);
	}
});

// Validation functions
function validateFirstName(frm) {
	const firstName = frm.doc.first_name;
	
	if (!firstName) {
		frm.set_df_property('first_name', 'description', '');
		return;
	}
	
	if (firstName.length < 2) {
		frm.set_df_property('first_name', 'description', 'First name must be at least 2 characters long');
		frm.set_df_property('first_name', 'description_style', 'color: red;');
	} else if (!/^[a-zA-Z\s\-\.]+$/.test(firstName)) {
		frm.set_df_property('first_name', 'description', 'First name can only contain letters, spaces, hyphens, and periods');
		frm.set_df_property('first_name', 'description_style', 'color: red;');
	} else {
		frm.set_df_property('first_name', 'description', '✓ Valid first name');
		frm.set_df_property('first_name', 'description_style', 'color: green;');
	}
}

function validateLastName(frm) {
	const lastName = frm.doc.last_name;
	
	if (!lastName) {
		frm.set_df_property('last_name', 'description', '');
		return;
	}
	
	if (lastName.length < 2) {
		frm.set_df_property('last_name', 'description', 'Last name must be at least 2 characters long');
		frm.set_df_property('last_name', 'description_style', 'color: red;');
	} else if (!/^[a-zA-Z\s\-\.]+$/.test(lastName)) {
		frm.set_df_property('last_name', 'description', 'Last name can only contain letters, spaces, hyphens, and periods');
		frm.set_df_property('last_name', 'description_style', 'color: red;');
	} else {
		frm.set_df_property('last_name', 'description', '✓ Valid last name');
		frm.set_df_property('last_name', 'description_style', 'color: green;');
	}
}

function validateLicenseNumber(frm) {
	const licenseNumber = frm.doc.license_number;
	
	if (!licenseNumber) {
		frm.set_df_property('license_number', 'description', '');
		return;
	}
	
	// Check format
	if (!/^[A-Z0-9]{8,15}$/.test(licenseNumber.toUpperCase())) {
		frm.set_df_property('license_number', 'description', 'License number must be 8-15 characters long and contain only letters and numbers');
		frm.set_df_property('license_number', 'description_style', 'color: red;');
		return;
	}
	
	// Check uniqueness (only if not a new document)
	if (frm.doc.name && frm.doc.name !== 'Driver') {
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Driver',
				filters: {
					license_number: licenseNumber.toUpperCase(),
					name: ['!=', frm.doc.name]
				},
				limit: 1
			},
			callback: function(r) {
				if (r.message && r.message.length > 0) {
					frm.set_df_property('license_number', 'description', 'License number already exists');
					frm.set_df_property('license_number', 'description_style', 'color: red;');
				} else {
					frm.set_df_property('license_number', 'description', '✓ Valid license number');
					frm.set_df_property('license_number', 'description_style', 'color: green;');
				}
			}
		});
	} else {
		frm.set_df_property('license_number', 'description', '✓ Valid license number format');
		frm.set_df_property('license_number', 'description_style', 'color: green;');
	}
}

function validatePhoneNumber(frm) {
	const phoneNumber = frm.doc.phone_number;
	
	if (!phoneNumber) {
		frm.set_df_property('phone_number', 'description', '');
		return;
	}
	
	// Remove spaces, dashes, and parentheses for validation
	const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
	
	if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
		frm.set_df_property('phone_number', 'description', 'Please enter a valid phone number (10-15 digits)');
		frm.set_df_property('phone_number', 'description_style', 'color: red;');
	} else {
		frm.set_df_property('phone_number', 'description', '✓ Valid phone number');
		frm.set_df_property('phone_number', 'description_style', 'color: green;');
	}
}

function validateProfileImage(frm) {
	const profileImage = frm.doc.profile_image;
	
	if (!profileImage) {
		frm.set_df_property('profile_image', 'description', '');
		return;
	}
	
	// Check file size (client-side check)
	const fileInput = frm.get_field('profile_image').$input;
	if (fileInput && fileInput.files && fileInput.files[0]) {
		const fileSize = fileInput.files[0].size;
		const maxSize = 5 * 1024 * 1024; // 5MB
		
		if (fileSize > maxSize) {
			frm.set_df_property('profile_image', 'description', 'File size should not exceed 5MB');
			frm.set_df_property('profile_image', 'description_style', 'color: red;');
		} else {
			frm.set_df_property('profile_image', 'description', '✓ Valid image file');
			frm.set_df_property('profile_image', 'description_style', 'color: green;');
		}
	}
}

function validateDriverData(frm) {
	let isValid = true;
	const errors = [];
	
	// Validate required fields
	if (!frm.doc.first_name) {
		errors.push('First Name is required');
		isValid = false;
	}
	
	if (!frm.doc.license_number) {
		errors.push('License Number is required');
		isValid = false;
	}
	
	if (!frm.doc.phone_number) {
		errors.push('Phone Number is required');
		isValid = false;
	}
	
	// Show validation results
	if (isValid) {
		frappe.msgprint({
			title: __('Validation Successful'),
			message: __('All driver data is valid and ready to save.'),
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
