"use strict";

// const ErrorHandler = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch((err) => {
//       return next(err);
//     });
//   };
// };
const ErrorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = ErrorHandler;
