# Copyright (c) 2025, Shubham and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class RideOrder(Document):
	pass

def driver_permission_query_conditions(user):
    if not user or user == "Administrator":
        return None

    if "Driver Assignee" in frappe.get_roles(user):
        return f"`tabRide Order`.status = 'New'"
    return f"`tabRide Order`.driver_name = '{user}'"

def driver_has_permission(user):
    if user == "Administrator" or user == "Guest":
        return True

    if "Driver Assignee" in frappe.get_roles(user):
        return frappe.db.get_value("Ride Order", {"status": "New"})
	
    return frappe.db.get_value("Ride Order", {"driver_name": user})