# online-shop-basics

This template should help get you started with setuping your website. It consists of 3 parts: server, client and database. You can and should setup it on one machine with one IP adress.
If you don't understand what's going on I recommend you to contact with someone who can help you with setup ( also you can DM me directly! ).

# Technologies used

System is written in Javascript, primarly Vue.JS using TailwindCSS as CSS, so it is pretty customazible and was written from scratch mostly ( that means you have direct contact with most functions! ). Development was finished in Summer of 2025, so It can be pretty outdated in technology in future.

# Required software

- Latest Node.JS version is recommended, but you can try different one ( our team tested on version v22.11.0 )
- Latest git version is recommended, but you can try different one ( out team tested on version 2.48.1.windows.1 )
- MongoDB ( refer to SETUP YOUR MONGODB part of instruction for more details )

# How to setup?

1. Clone repo from Github or any other official resource this can be published in the future.
2. Change setting to your situation, this is the list of what you should check:

### .env in /client folder:

- index.html title -> change it to your shop's name

### .env in /server folder:

- VITE_API_URL -> change it to your url that you will use to serve this website ( your domain ) and you should add /api at the end of domain
- MONGODB_URI -> we provide additional setup guide for mongodb if you not familiar with it ( see 3. Setup your Mongodb ), but if you are put your mongodb database host url here.
- DH_PASSWORD -> password for your dashboard that you can access by entering ( your custom domain )/dashboard when website is online.
- JWT_SECRET -> is used to generate safe authorization system. YOU MUST CHANGE IT TO STAY SAFE. Use any safe combination of symbols generated in legitimate source, recommended minimum is 32 bytes.
- PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET -> change it to your data that you will receive when creating PayPal dev account
- PAYPAL_API_BASE -> there are two separate urls, one for testing, one for production.

### Setup your MongoDB

1.  Local MongoDB Setup

- If you prefer to run MongoDB locally:
  Go to the MongoDB Download Center: Open your web browser and navigate to the official MongoDB Community Server download page: https://www.mongodb.com/try/download/community.
  Select Your OS and Download: Choose your operating system and download the appropriate installer.
  Please refer to the official MongoDB Linux installation guide for detailed instructions specific to your operations system and distribution.

  Later, create the 'shop' Database and Collections: Once MongoDB is installed and running, open your mongosh (MongoDB Shell). Execute the following commands to create the shop database and its necessary collections:
  JavaScript
  use shop
  db.createCollection("collections")
  db.createCollection("orders")
  db.createCollection("products")
  db.createCollection("tags")

  Set Your MONGODB_URI: Configure your MONGODB_URI environment variable (or in your project's configuration file) to point to your local database. For a typical local setup, it'll look like this:
  MONGODB_URI=mongodb://localhost:27017/shop (Adjust 27017 if your MongoDB instance is running on a different port.)

MongoDB Atlas Setup (Cloud Database)
Alternatively, you can leverage MongoDB Atlas for a cloud-hosted database:
Refer to the comprehensive MongoDB Atlas Getting Started guide on their official website.
You'll need to create an account, set up a free-tier cluster, and obtain your connection string, which will serve as your MONGODB_URI.
Remember to create the shop database and the collections, orders, products, and tags collections within your Atlas cluster, either through the Atlas UI or programmatically.

4. Run npm install in client and server folder. It will install all required libraries using Node.JS.

5. Build with npm run build in console or using cmd, in folder where client part (normally /client folder) is located.

If you have any questions, you can contact me via email: dimatsarevskyi@proton.me or using Telegram: @madfoz.

# Important warnings and FAQ

1. Is is recommended to not move any files.

#### FAQ:

? My server 'can't serve' /dist folder or i get 'Cannot GET /' error.

- Check if /dist folder is located under client/dist and if not move it there or change DIST_LOCATION at .env file in your server.

## Afterthought

We are currently slowly working on improvments and more versatility for this website and we plan on adding new features and also improve setup process.

ALL RIGHTS RESERVED. MADE BY @madfozjer, 2025. LICENSE IS AVAILABLE ON SOURCE.
