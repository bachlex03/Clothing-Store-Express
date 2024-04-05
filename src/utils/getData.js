const _ = require("lodash");

const getInfoObject = ({ obj = {}, fields = [] }) => {
  return _.pick(obj, fields);
};

module.exports = { getInfoObject };
