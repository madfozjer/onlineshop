# online-shop-basics

This template should help get you started with setuping your website. It consists of 3 parts: server, client and database. You can and should setup it on one machine with one IP adress.
If you don't understand what's going on I recommend you to contact with someone who can help you with setup ( also you can DM me directly! ).

# Technologies used

System is written in Javascript, primarly Vue.JS using TailwindCSS as CSS, so it is pretty customazible and was written from scratch mostly ( that means you have direct contact with most functions! ). Development was finished in Summer of 2025, so It can be pretty outdated in technology in future.

# How to setup?

1. Clone repo from Github or any other official resource this can be published in the future.
2. Change setting to your situation, this is the list of what you should check:

### .env in /client folder:

- index.html title -> change it to your shop's name

### .env in /server folder:

- VITE_API_URL -> change it to your url that you will use to serve this website ( your domain ) and you should add /api at the end of domain
- MONGODB_URI -> we provide additional setup guide for mongodb if you not familiar with it, but if you are put your mongodb database host url here.
- DH_PASSWORD -> password for your dashboard that you can access by entering ( your custom domain )/dashboard when website is online.
- JWT_SECRET -> is used to generate safe authorization system. YOU MUST CHANGE IT TO STAY SAFE. Use any safe combination of symbols generated in legitimate source, recommended minimum is 32 bytes.
- PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET -> change it to your data that you will receive when creating PayPal dev account
- PAYPAL_API_BASE -> there are two separate urls, one for testing, one for production.

3. Setup your Mongodb.
4. Build with 'npm run build' in console or using cmd, in folder where client part ( normally /client folder ) is located.

# Important warnings and FAQ

1. Is is recommended to not move any files.

#### FAQ:

? My server 'can't serve' /dist folder or i get 'Cannot GET /' error.

- Check if /dist folder is located under client/dist and if not move it there or change DIST_LOCATION at .env file in your server.

## Afterthought

We are currently slowly working on improvments and more versatility for this website and we plan on adding new features and also improve setup process.

ALL RIGHTS RESERVED. MADE BY @madfozjer, 2025. LICENSE IS AVAILABLE ON SOURCE.
