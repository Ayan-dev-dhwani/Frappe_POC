// Copyright (c) 2025, Shubham and contributors
// For license information, please see license.txt

frappe.ui.form.on("Ride Order", {
    onload: function(frm) {
        frm.set_query('driver_name', function() {
            return {
                query: "frappe.core.doctype.user.user.user_query",
                filters: {
                    role: "Driver"
                }
            };
        });
    },
	refresh(frm) {
        console.log(frappe.session.user);
        if (frm.doc.status !== "Accepted") {
            frm.add_custom_button("Accept", () =>  {
                frm.set_value("status", "Accepted");
                frm.save();
            })
            frm.add_custom_button("Reject", () =>  {
                frm.set_value("status", "Rejected");
                frm.set_value("driver_name", null);
                frm.save();
            })
        }
	},
    status(frm) {
        console.log(frm.doc.status);
    }
});
