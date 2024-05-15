const Brands = {
  gucci: "GC",
  prada: "PR",
  chanel: "CH",
  dior: "DR",
  versace: "VS",
  "louis vuitton": "LV",
};

//, Earring, Handbags, Shawl, Tunic, Jackets, Blazers
//, Trousers, Jeans, Palazzos, Maxi, Cocktail, Sun Hats
//, Dressy Blouses, Winter Coats,  Rain Jackets, Short Sleeve
const Categories = {
  earring: "EA",
  handbags: "HB",
  shawl: "SL",
  tunic: "TC",
  jackets: "JT",
  blazers: "BZ",
  trousers: "TS",
  jeans: "JN",
  palazzos: "PZ",
  maxi: "MA",
  cocktail: "CO",
  "sun hats": "SH",
  "dressy blouses": "DB",
  "winter coats": "WC",
  "rain jackets": "RJ",
  "short sleeve": "SS",
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

  const uniqueIdentifier = Date.now().toString().substring(1, 10);

  const productCode = `#${brand}${category}${gender}-${uniqueIdentifier}`;

  return productCode;
};

module.exports = generateProductCode;
