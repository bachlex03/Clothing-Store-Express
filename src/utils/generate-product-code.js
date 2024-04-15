const Brands = {
  gucci: "GC",
  prada: "PR",
  chanel: "CH",
  dior: "DR",
  versace: "VS",
  "louis vuitton": "LV",
};
// 'Outerwear', 'Dresses', 'T-Shirts', 'Blouses', 'Knitwear', 'Pant'
const Categories = {
  outerwear: "OW",
  dresses: "DRE",
  "t-shirt": "TS",
  blouses: "BL",
  knitwear: "KW",
  pant: "PT",
};

const Gender = {
  man: "M",
  woman: "W",
  unisex: "U",
};

const generateProductCode = ({ brand = "", category = "", gender = "" }) => {
  brand = brand.toLowerCase();
  category = category.toLowerCase();
  gender = gender.toLowerCase();

  brand = Brands[brand] ? Brands[brand] : "00";
  category = Categories[category] ? Categories[category] : "00";
  gender = Gender[gender] ? Gender[gender] : "0";

  console.log({
    brand,
    category,
    gender,
  });

  const uniqueIdentifier = Date.now().toString().substring(0, 7);

  const productCode = `#${brand}${category}${gender}-${uniqueIdentifier}`;

  return productCode;
};

module.exports = generateProductCode;
