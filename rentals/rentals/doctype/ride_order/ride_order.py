# Copyright (c) 2025, Shubham and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from math import radians, sin, asin, cos, sqrt, atan2

def haversine(lat1, lon1, lat2, lon2):
    # convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

class RideBooking(Document):
    def before_save(self):
        if self.ordere:
            ride_order = frappe.get_doc("Ride Order", self.ordere)
            pickup = ride_order.pickup_address  # Should be [lat, lng]
            drop = ride_order.drop_location     # Should be [lat, lng]
            if pickup and drop:
                try:
                    pickup_lat, pickup_lng = map(float, pickup.split(","))
                    drop_lat, drop_lng = map(float, drop.split(","))
                    distance = haversine(pickup_lat, pickup_lng, drop_lat, drop_lng)
                    # You can store this in a field or in ride_detail_items as needed
                    self.total_distance = distance
                except Exception as e:
                    frappe.throw(f"Error calculating distance: {e}")


class RideOrder(Document):
    def validate(self):
        # Only assignee@driver.com can set rate and distance, and they are required for this user
        if frappe.session.user == "assignee@driver.com":
            if not self.rate:
                frappe.throw("Rate is mandatory for assignee@driver.com")
            if not self.distance:
                frappe.throw("Distance is mandatory for assignee@driver.com")
        else:
            # Prevent others from setting these fields
            if self.rate or self.distance:
                frappe.throw("Only assignee@driver.com can set rate and distance.")


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