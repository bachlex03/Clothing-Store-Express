"use strict";

const userModel = require("../models/user.model");
const invoiceModel = require("../models/invoice.model");
const productModel = require("../models/product.model");

module.exports = {
    async getDashboardData() {
        // Get total revenues from paid invoices (convert VND to USD)
        const invoices = await invoiceModel.find({ invoice_status: "paid" });
        const total_revenues = Math.round(
            invoices.reduce((sum, invoice) => sum + (invoice.invoice_total || 0), 0) / 25000
        );

        // Get total verified users
        const total_users = await userModel.find({ verified: true }).count();

        // Get total products sold from paid invoices
        const total_sales = invoices.reduce((sum, invoice) => {
            return sum + invoice.invoice_products.reduce((productSum, product) => {
                return productSum + (product.product_quantity || 0);
            }, 0);
        }, 0);

        // Get total active products
        const total_product_actives = await productModel.find({ 
            product_status: "Published" 
        }).count();

        return {
            total_revenues,
            total_users,
            total_sales,
            total_product_actives
        };
    }
};
