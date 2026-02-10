# MAD Sheet Catalog Project

This project gives you a clean, stable Products API from Google Sheet and a demo website loader.

## Part A — Google Sheet
Headers (row 1) must be:

code | original | price | عربي | עברית | English | category_en | category_ar | category_he | gender_en | gender_ar | gender_he | size | description | image | buy_link_ps | buy_link_il

## Part B — Google Apps Script API
File: apps_script/Code.gs

Steps:
1) In Google Sheet: Extensions > Apps Script
2) Paste Code.gs contents
3) Deploy > New deployment > Web app
   - Execute as: Me
   - Who has access: Anyone
4) Copy the Web App URL and use it in your bot / website.

API examples:
- /exec
- /exec?limit=200
- /exec?q=creed
- /exec?code=W180
- /exec?code=W180&gender=MAN
- /exec?callback=cb   (JSONP for browsers)

## Part C — Site demo (optional)
Folder: site_demo/

Open site_demo/index.html on your host (or locally with a simple server) and test search.

Edit site_demo/catalog.js:
- Set MAD_API_URL to your Web App URL.
