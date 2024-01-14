const fs = require('fs');
const path = require('path');

module.exports = class Product {
  constructor(title) {
    this.title = title;
  }

  saveProduct() {
    const p = path.join(path.dirname(process.mainModule.filename),
    'data',
    'products.json');
    fs.readFile(p, (err, fileContent) => {
      let products = [];
      if (!err) {
        products = JSON.parse(fileContent);
      }
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll(callBack) {
    const p = path.join(path.dirname(process.mainModule.filename),
    'data',
    'products.json');
    fs.readFile (p, (err, fileContent) => {
      if (err) {
        callBack([]);
      }
      callBack(JSON.parse(fileContent));
    })
  }
}
