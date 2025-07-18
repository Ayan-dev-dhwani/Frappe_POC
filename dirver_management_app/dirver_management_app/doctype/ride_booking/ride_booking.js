// Copyright (c) 2025, Admin_ayan and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Ride Booking", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("Ride Booking", {
 
    rate(frm) {
        frm.trigger("update_total_amount")
        console.log(frm.doc.rate)
    },
    update_total_amount(frm) {
        let total_distance = 0;
        for (let items of frm.doc.ride_details) {
            total_distance += items.distance;
        }
        const amount  = total_distance * frm.doc.rate;
        frm.set_value("amount", amount)
    }
})
 
frappe.ui.form.on("Ride Detail", {
    refresh(frm) {
 
    },
 
    distance(frm, cdt, cdn) {
        frm.trigger("update_total_amount")
    },
    ride_details_remove(frm) {
        frm.trigger("update_total_amount")
    }
});