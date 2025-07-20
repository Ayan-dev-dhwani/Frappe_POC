# Copyright (c) 2025, Shubham and contributors
# For license information, please see license.txt

# import frappe
from frappe.website.website_generator import WebsiteGenerator
import re
import frappe


class Vehicle(WebsiteGenerator):
	def validate(self):
		self.set_title()
		self.set_route()

	def set_title(self):
		self.vehicle_title = f"{self.make} {self.model} {self.year}"

	def set_route(self):
		if self.is_published:
			if self.vehicle_title:
				# Get web form route from the current request
				web_form_route = ''
				if frappe.request and hasattr(frappe.request, 'form_dict'):
					web_form_name = frappe.request.form_dict.get('web_form_name')
					if web_form_name:
						web_form_route = frappe.db.get_value('Web Form', web_form_name, 'route') or ''
				
				# Create base route from vehicle title
				route = self.vehicle_title.lower()
				route = re.sub(r'[^a-z0-9\s-]', '', route)
				route = re.sub(r'\s+', '-', route)
				route = route.strip('-')
				
				# Prepend web form route if it exists
				if web_form_route:
					route = f"{web_form_route}/{route}"
				
				# Ensure route is unique
				base_route = route
				meta = frappe.get_meta("Vehicle")
				meta_route = meta.route
				counter = 1
				while frappe.db.exists("Vehicle", {"route": route, "name": ["!=", self.name]}):
					route = f"{base_route}-{counter}"
					counter += 1
				
				self.route = meta_route + "/" + route
		else:
			# Clear route if not published
			self.route = ""
