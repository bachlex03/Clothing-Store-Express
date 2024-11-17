const crypto = require("crypto");
const paymentEvent = require("../events/payment.event");
const inventoryService = require("../services/inventory.service");
const invoiceService = require("../services/invoice.service");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const {
  vnpay: { hashSecret, tmnCode, vnpUrl, clientReturnUrl },
} = require("../config/config.env");
const sortObjectParamsVnpay = require("../utils/sortObjectParamsVnpay");

const createPaymentUrl = () => {
  const vnpayUrl = vnpayParamsBuilder();

  return vnpayUrl;
};

// const createPaymentUrl = async (amount, boughtItems, invoice = {}) => {
//   try {
//     amount = parseInt(amount).toString();
//   } catch (err) {
//     throw new Error("Amount must be a number");
//   }

//   let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

//   const date = new Date();
//   const { default: dateFormat } = await import("dateformat");
//   const createDate = dateFormat(date, "yyyymmddHHMMss");

//   const ORDER_ID = dateFormat(date, "HHmmss");
//   const LOCALE = "vn";
//   const CURR_CODE = "VND";
//   const ORDER_TYPE = "200000";
//   const RETURN_URL = "http://localhost:3000/cart";

//   var vnp_Params = {};

//   vnp_Params["vnp_Amount"] = amount * 100;
//   vnp_Params["vnp_Command"] = "pay";
//   vnp_Params["vnp_CreateDate"] = createDate;
//   vnp_Params["vnp_CurrCode"] = CURR_CODE;
//   vnp_Params["vnp_IpAddr"] = "13.160.92.202";
//   vnp_Params["vnp_Locale"] = LOCALE;
//   vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang";
//   vnp_Params["vnp_OrderType"] = ORDER_TYPE;
//   vnp_Params["vnp_ReturnUrl"] = RETURN_URL;
//   vnp_Params["vnp_TmnCode"] = tmnCode;
//   vnp_Params["vnp_TxnRef"] = ORDER_ID;
//   vnp_Params["vnp_Version"] = "2.1.0";
//   // vnp_Params["vnp_BankCode"] = "NCB";

//   vnp_Params = sortObjectParamsVnpay(vnp_Params);

//   const signData = new URLSearchParams(vnp_Params).toString();
//   const hmac = crypto.createHmac("sha512", hashSecret);
//   var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

//   vnp_Params["vnp_SecureHash"] = signed;

//   vnpUrl += "?" + new URLSearchParams(vnp_Params).toString();

//   global._paymentEvent.on("payment-success", async (data) => {
//     await inventoryService.reduceQuantity(boughtItems);

//     invoice.setStatus("paid");

//     console.log("invoice", invoice);

//     await invoiceService.create({
//       user_id: invoice.user,
//       status: invoice.status,
//       total: invoice.total,
//       boughtProducts: invoice.products,
//       note: invoice.note,
//     });

//     return data;
//   });

//   return vnpUrl;
// };

const vnpayIpn = async (req) => {
  const secureHash = req.query.vnp_SecureHash;
  const secureHashType = req.query.vnp_SecureHashType;
  const responseCode = req.query.vnp_ResponseCode;
  const vnp_Params = req.query;

  // console.log("req.query", req.query);

  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac("sha512", hashSecret);

  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  let data;

  if (secureHash === signed && responseCode === "00") {
    data = {
      RspCode: "00",
      message: "Payment success",
    };

    global._paymentEvent.emit("payment-success", data);

    return data;
  } else {
    data = {
      RspCode: "97",
      message: "Fail checksum",
    };

    return data;
  }
};

const vnpayReturn = async (req) => {
  var vnp_Params = req.query;

  console.log("vnp_Params", vnp_Params);

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
    res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
  } else {
    res.render("success", { code: "97" });
  }
};

const vnpayParamsBuilder = () => {
  const expireDate = dayjs()
    .tz("Asia/Ho_Chi_Minh")
    .add(1, "day")
    .format("YYYYMMDDHHmmss");

  const createDate = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYYMMDDHHmmss");
  let VNPAY_URL = vnpUrl;
  var ipAddr = "13.160.92.202";
  var info = "Thanh toan don hang";
  var amount = 1000000;
  var RETURN_CLIENT_URL = clientReturnUrl;
  const VNPAY_TMN_CODE = tmnCode;
  const VNPAY_HASH_SECRET = hashSecret;

  var vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = VNPAY_TMN_CODE;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = Date.now().toString();
  vnp_Params["vnp_OrderInfo"] = "account_id " + info;
  vnp_Params["vnp_OrderType"] = "bill payment";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = RETURN_CLIENT_URL;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  // vnp_Params['vnp_BankCode'] = 'NCB';

  vnp_Params = sortObjectParamsVnpay(vnp_Params);

  var querystring = require("qs");

  var signData = querystring.stringify(vnp_Params, { encode: false });

  var crypto = require("crypto");

  var hmac = crypto.createHmac("sha512", VNPAY_HASH_SECRET);

  var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;

  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  return vnpUrl;
};

module.exports = {
  createPaymentUrl,
  vnpayIpn,
  vnpayReturn,
};
