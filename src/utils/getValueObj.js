const _ = require("lodash");

const getValueObj = ({ obj = {}, fields = [] }) => {
  return _.pick(obj, fields);
};

module.exports = { getValueObj };
