# Copyright (c) 2025, Admin_ayan and contributors
# For license information, please see license.txt

import frappe
import re
from frappe.model.document import Document
from frappe import _


class Driver(Document):
	def validate(self):
		"""Validate driver data before saving"""
		self.validate_license_number()
		self.validate_phone_number()
		self.validate_names()
		self.validate_profile_image()
	
	def validate_license_number(self):
		"""Validate license number format and uniqueness"""
		if not self.license_number:
			frappe.throw(_("License Number is required"))
		
		# Check if license number already exists (excluding current document)
		existing_driver = frappe.db.exists(
			"Driver",
			{
				"license_number": self.license_number,
				"name": ["!=", self.name]
			}
		)
		
		if existing_driver:
			frappe.throw(_("License Number {0} already exists").format(self.license_number))
		
		# Validate license number format (alphanumeric, 8-15 characters)
		if not re.match(r'^[A-Z0-9]{8,15}$', self.license_number.upper()):
			frappe.throw(_("License Number must be 8-15 characters long and contain only letters and numbers"))
	
	def validate_phone_number(self):
		"""Validate phone number format"""
		if not self.phone_number:
			frappe.throw(_("Phone Number is required"))
		
		# Remove spaces, dashes, and parentheses for validation
		clean_phone = re.sub(r'[\s\-\(\)]', '', self.phone_number)
		
		# Check if it's a valid phone number (10-15 digits)
		if not re.match(r'^\+?[0-9]{10,15}$', clean_phone):
			frappe.throw(_("Please enter a valid phone number"))
	
	def validate_names(self):
		"""Validate first and last names"""
		if not self.first_name:
			frappe.throw(_("First Name is required"))
		
		if self.first_name and len(self.first_name.strip()) < 2:
			frappe.throw(_("First Name must be at least 2 characters long"))
		
		if self.last_name and len(self.last_name.strip()) < 2:
			frappe.throw(_("Last Name must be at least 2 characters long"))
		
		# Check for special characters in names
		if self.first_name and not re.match(r'^[a-zA-Z\s\-\.]+$', self.first_name):
			frappe.throw(_("First Name can only contain letters, spaces, hyphens, and periods"))
		
		if self.last_name and not re.match(r'^[a-zA-Z\s\-\.]+$', self.last_name):
			frappe.throw(_("Last Name can only contain letters, spaces, hyphens, and periods"))
	
	def validate_profile_image(self):
		"""Validate profile image if provided"""
		if self.profile_image:
			# Check if the file exists
			if not frappe.db.exists("File", {"file_url": self.profile_image}):
				frappe.throw(_("Profile image file not found"))
			
			# Check file size (max 5MB)
			file_doc = frappe.get_doc("File", {"file_url": self.profile_image})
			if file_doc.file_size and file_doc.file_size > 5 * 1024 * 1024:  # 5MB
				frappe.throw(_("Profile image size should not exceed 5MB"))
	
	def before_save(self):
		"""Actions to perform before saving"""
		# Capitalize names
		if self.first_name:
			self.first_name = self.first_name.strip().title()
		if self.last_name:
			self.last_name = self.last_name.strip().title()
		
		# Format license number to uppercase
		if self.license_number:
			self.license_number = self.license_number.strip().upper()
