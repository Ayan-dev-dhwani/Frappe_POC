# Copyright (c) 2025, Admin_ayan and contributors
# For license information, please see license.txt

import frappe
import re
from datetime import datetime
from frappe.website.website_generator import WebsiteGenerator
from frappe import _


class Vehicle(WebsiteGenerator):

	def set_title(self):
		self.vehicle_title = f"{self.make} {self.model} {self.year}"

	def set_route(self):
		"""Set the route for the vehicle"""
		if self.vehicle_title and self.is_published != 0:
			# Create a URL-friendly route from the vehicle title
			route = self.vehicle_title.lower()
			# Replace spaces and special characters with hyphens
			route = re.sub(r'[^a-z0-9\s-]', '', route)
			route = re.sub(r'\s+', '-', route)
			route = route.strip('-')
			# 1. Access doctype metadata
			doctype_meta = frappe.get_meta("Vehicle")
			meta_route = doctype_meta.route
			
			# Ensure route is unique
			base_route = route
			counter = 1
			while frappe.db.exists("Vehicle", {"route": route, "name": ["!=", self.name]}):
				route = f"{base_route}-{counter}"
				counter += 1
			
			self.route = meta_route + "/" + route
		else:
			self.route = ""

	def validate(self):
		self.set_title()
		self.set_route()
		"""Validate vehicle data before saving"""
		self.validate_year()
		self.validate_license_plate()
		self.validate_make_model()
		self.validate_color()
	
	def validate_year(self):
		"""Validate year field - must be 4 digits from 2000 to current year"""
		if not self.year:
			frappe.throw(_("Year is required"))
		
		# Check if year is a 4-digit number
		if not isinstance(self.year, int) or len(str(self.year)) != 4:
			frappe.throw(_("Year must be a 4-digit number"))
		
		current_year = datetime.now().year
		
		# Check if year is between 2000 and current year
		if self.year < 2000 or self.year > current_year:
			frappe.throw(_("Year must be between 2000 and {0}").format(current_year))
	
	def validate_license_plate(self):
		"""Validate license plate format - should be like 'HR23BS2345'"""
		if not self.license_plate:
			frappe.throw(_("License Plate is required"))
		
		# Check if license plate already exists (excluding current document)
		existing_vehicle = frappe.db.exists(
			"Vehicle",
			{
				"license_plate": self.license_plate.upper(),
				"name": ["!=", self.name]
			}
		)
		
		if existing_vehicle:
			frappe.throw(_("License Plate {0} already exists").format(self.license_plate))
		
		# Validate license plate format: 2 letters + 2 digits + 2 letters + 4 digits
		# Example: HR23BS2345
		license_pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$'
		
		if not re.match(license_pattern, self.license_plate.upper()):
			frappe.throw(_("License Plate must be in format: 2 letters + 2 digits + 2 letters + 4 digits (e.g., HR23BS2345)"))
	
	def validate_make_model(self):
		"""Validate make and model fields"""
		if not self.make:
			frappe.throw(_("Make is required"))
		
		if not self.model:
			frappe.throw(_("Model is required"))
		
		# Check for minimum length
		if len(self.make.strip()) < 2:
			frappe.throw(_("Make must be at least 2 characters long"))
		
		if len(self.model.strip()) < 2:
			frappe.throw(_("Model must be at least 2 characters long"))
		
		# Check for valid characters (letters, numbers, spaces, hyphens)
		if not re.match(r'^[a-zA-Z0-9\s\-\.]+$', self.make):
			frappe.throw(_("Make can only contain letters, numbers, spaces, hyphens, and periods"))
		
		if not re.match(r'^[a-zA-Z0-9\s\-\.]+$', self.model):
			frappe.throw(_("Model can only contain letters, numbers, spaces, hyphens, and periods"))
	
	def validate_color(self):
		"""Validate color field if provided"""
		if self.color:
			# Check for minimum length
			if len(self.color.strip()) < 2:
				frappe.throw(_("Color must be at least 2 characters long"))
			
			# Check for valid characters (letters, spaces, hyphens)
			if not re.match(r'^[a-zA-Z\s\-]+$', self.color):
				frappe.throw(_("Color can only contain letters, spaces, and hyphens"))
	
	def before_save(self):
		"""Actions to perform before saving"""
		# Capitalize make and model
		if self.make:
			self.make = self.make.strip().title()
		if self.model:
			self.model = self.model.strip().title()
		
		# Capitalize color
		if self.color:
			self.color = self.color.strip().title()
		
		# Format license plate to uppercase
		if self.license_plate:
			self.license_plate = self.license_plate.strip().upper()
