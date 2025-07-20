import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist(allow_guest=True)
def custom_signup(email, full_name, role="Customer"):
    if frappe.db.exists("User", email):
        frappe.throw(_("Email already registered"))

    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": full_name,
        "send_welcome_email": 1,
        "enabled": 1,
        "user_type": "Website User"
    })

    user.insert(ignore_permissions=True)

    # Add selected role
    if role not in ["Customer", "Supplier", "Student"]:
        frappe.throw("Invalid role")
    user.add_roles(role)

    frappe.db.commit()

    return {"message": "Signup successful"}
