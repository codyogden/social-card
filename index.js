require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');

String.prototype.formatUnicorn = function() {
  var str = this.toString();
  if (arguments.length) {
    var t = typeof arguments[0];
    var key;
    var args = ("string" === t || "number" === t) ?
      Array.prototype.slice.call(arguments)
      : arguments[0];

    for (key in args) {
      str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
    }
  }

  return str;
};


// App
const app = express();
const listener = app.listen(process.env.PORT ?? 3333);
const renderPath = 'render';

const getTemplate = (template) => {
  const templateName = (template) ? template : 'default';
  if (fs.existsSync(path.resolve(`templates/${templateName}.html`))) {
    return path.resolve(`templates/${templateName}.html`);
  } else {
    return path.resolve(`templates/default.html`)
  }
};

app.get(`/${renderPath}`, (req, res) => {
  const template = getTemplate(req.query.template);
  fs.readFile(template, 'utf8', async function (err, data) {
    res.writeHead(200, null, { 'Content-Type': 'text/html' });
    res.end(data.formatUnicorn(req.query));
  });
});

app.get('/', async (req, res) => {
  const queryStr = JSON.stringify(req.query);
  const queryHash = crypto.createHash('md5').update(queryStr).digest('hex');
  const newFilePath = path.resolve(__dirname, 'cached') + `/${queryHash}-${new Date().getTime()}.png`;
  return new Promise((resolve) => {
    glob(path.resolve(__dirname, 'cached') + `/${queryHash}-*.png`, function (er, files) {
      if(files.length) {
        const filePath = files[0];
        const split = files[0].split('/');
        const [hash, timestamp] = split[split.length - 1].split('-').reduce((arr, item) => {
          arr.push(item.split('.')[0]);
          return arr;
        }, []);
        if (!((timestamp + (60 * 60)) < new Date().getTime())) {
          resolve(filePath);
        } else {
          fs.unlinkSync(filePath);
          resolve(newFilePath);
        }
      } else {
        resolve(newFilePath);
      }
    });
  })
  .then(async (filePath) => {
    if(!fs.existsSync(filePath)) {
      const browser = await puppeteer.launch({
        defaultViewport: {
          width: 1200,
          height: 628,
          deviceScaleFactor: 2,
        }
      });

      const page = await browser.newPage();
      const url = new URL(`http://localhost:${listener.address().port}/${renderPath}`);
      Object.keys(req.query).map((key) => url.searchParams.append(key, req.query[key]));
      await page.goto(url, { waitUntil: 'networkidle0' });
      await page.screenshot({ path: filePath });
      await browser.close();
    }
    return filePath;
  })
  .then((filePath) => res.sendFile(filePath));
});
