const queryString = require("querystring");

const crypto = require("crypto");

const {
  vnpay: { hashSecret, tmnCode, vnpUrl },
} = require("../config/config.env");

const createPaymentUrl = async (req) => {
  let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const amount = "100000";

  const date = new Date();

  const { default: dateFormat } = await import("dateformat");

  const createDate = dateFormat(date, "yyyymmddHHmmss");
  const expireDate = dateFormat(
    new Date(date.getTime() + 24 * 60 * 60 * 1000),
    "yyyymmddHHmmss"
  );
  const orderId = dateFormat(date, "HHmmss");
  const LOCALE = "vn";
  const CURR_CODE = "VND";
  const ORDER_TYPE = "200000";
  const RETURN_URL = "http://localhost:3001";

  const vnp_Params = {};
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_CreateDate"] = createDate;
  //   vnp_Params["vnp_ExpireDate"] = expireDate;
  vnp_Params["vnp_CurrCode"] = CURR_CODE;
  vnp_Params["vnp_IpAddr"] = "13.160.92.202";
  vnp_Params["vnp_Locale"] = LOCALE;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang";
  vnp_Params["vnp_OrderType"] = ORDER_TYPE;
  vnp_Params["vnp_ReturnUrl"] = RETURN_URL;
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_Version"] = "2.1.0";
  //   vnp_Params["vnp_BankCode"] = "NCB"; // Optional - Ngân hàng thanh toán

  // Hash data
  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac("sha512", hashSecret);
  var signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  vnpUrl += "?" + new URLSearchParams(vnp_Params).toString();

  return {
    redirect: vnpUrl,
  };
};

module.exports = {
  createPaymentUrl,
};
