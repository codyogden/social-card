require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');

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

app.get(`/${renderPath}`, (req, res) => {
  fs.readFile('template.html', 'utf8', async function (err, data) {
    res.writeHead(200, null, { 'Content-Type': 'text/html' });
    res.end(data.formatUnicorn(req.query));
  });
});

app.get('/', async (req, res) => {
  fs.readFile('template.html', 'utf8', async function (err, data) {
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
    await page.goto(url, {waitUntil: 'networkidle0'});
    res.writeHead(200, null, { 'Content-Type': 'image/png' });
    const buffer = await page.screenshot();
    res.end(Buffer.from(buffer, 'base64'));
    await browser.close();
  });
});