const adminService = require("../services/admin.service");
const { OK } = require("../core/success.response");

class adminController {
    async getDashboardData(req, res, next) {
        const data = await adminService.getDashboardData();
        new OK({
            message: "Get dashboard data successfully",
            data: data
        }).send(res);
    }
}

module.exports = new adminController();

