// Copyright (c) 2025, Shubham and contributors
// For license information, please see license.txt

frappe.ui.form.on("Ride Order", {
    // onload: function(frm) {
    //     frm.set_query('driver_name', function() {
    //         return {
    //             query: "frappe.core.doctype.user.user.user_query",
    //             filters: {
    //                 role: "Driver"
    //             }
    //         };
    //     });
    // },
	refresh(frm) {
        console.log(frappe.session);
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
        const isAssignee = frappe.session.user === "assignee@driver.com";
        frm.set_df_property('rate', 'read_only', !isAssignee);
        frm.set_df_property('distance', 'read_only', !isAssignee);
        frm.set_df_property('rate', 'reqd', isAssignee);
        frm.set_df_property('distance', 'reqd', isAssignee);
        frm.trigger("update_total_amount")
	},
    update_total_amount(frm) {
        let total_distance = frm.doc.distance;
        console.log(total_distance);
        const amount  = total_distance * frm.doc.rate;
        frm.set_value("total_amount", amount)
    },
    status(frm) {
        console.log(frm.doc.status);
    },
    distance(frm, cdt, cdn) {
        frm.trigger("update_total_amount")
    },
    rate(frm, cdt, cdn) {
        frm.trigger("update_total_amount")
    },
});
