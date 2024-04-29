const crypto = require("crypto");

const {
  vnpay: { hashSecret, tmnCode, vnpUrl },
} = require("../config/config.env");

const createPaymentUrl = async (amount) => {
  console.log("amount: ", amount);
  try {
    amount = parseInt(amount).toString();
  } catch (err) {
    throw new Error("Amount must be a number");
  }

  let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

  const date = new Date();

  const { default: dateFormat } = await import("dateformat");

  const createDate = dateFormat(date, "yyyymmddHHmmss");
  const currTime = dateFormat(new Date(date.getTime()), "yyyymmddHHmmss");
  const expireDate = parseInt(currTime) + 20 * 60;

  const ORDER_ID = dateFormat(date, "HHmmss");
  const LOCALE = "vn";
  const CURR_CODE = "VND";
  const ORDER_TYPE = "200000";
  const RETURN_URL = "http://localhost:3001/api/v1/vnpay/vnpay_ipn";

  const vnp_Params = {};

  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_CreateDate"] = createDate;
  vnp_Params["vnp_CurrCode"] = CURR_CODE;
  vnp_Params["vnp_ExpireDate"] = expireDate;
  vnp_Params["vnp_IpAddr"] = "13.160.92.202";
  vnp_Params["vnp_Locale"] = LOCALE;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang";
  vnp_Params["vnp_OrderType"] = ORDER_TYPE;
  vnp_Params["vnp_ReturnUrl"] = RETURN_URL;
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_TxnRef"] = ORDER_ID;
  vnp_Params["vnp_Version"] = "2.1.0";
  //   vnp_Params["vnp_BankCode"] = "NCB"; // Optional - Ngân hàng thanh toán

  // Hash data
  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac("sha512", hashSecret);
  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  vnpUrl += "?" + new URLSearchParams(vnp_Params).toString();

  return {
    redirect: vnpUrl,
  };
};

const vnpayIpn = async (req) => {
  const secureHash = req.query.vnp_SecureHash;
  const secureHashType = req.query.vnp_SecureHashType;
  const vnp_Params = req.query;

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac("sha512", hashSecret);

  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  let data;

  if (secureHash === signed) {
    data = {
      RspCode: "00",
      message: "Payment success",
    };
  } else {
    data = {
      RspCode: "97",
      message: "Fail checksum",
    };
  }

  _io.emit("payment", data);
};

const vnpayReturn = async (req) => {
  var vnp_Params = req.query;

  var secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  var config = require("config");
  var tmnCode = config.get("vnp_TmnCode");
  var secretKey = config.get("vnp_HashSecret");

  var querystring = require("qs");
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require("crypto");
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

    res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
  } else {
    res.render("success", { code: "97" });
  }
};

module.exports = {
  createPaymentUrl,
  vnpayIpn,
  vnpayReturn,
};
