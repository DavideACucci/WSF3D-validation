<img src="/wsf3d/public/images/logo-black.png" alt="MindEarth logo" width="200">

# WSF3D-validation
A web application for crowd labeling to collect validation data for the World Settlements Footprint 3D. The user is presented with images taken from the level of the street and he/she is asked to click the tallest building in the scene. Next, the user can assign a number of floors to that building. 

<img src="/wsf3d/public/images/tutorial/tut_3.jpg" alt="screenshot 1" width="200"> <img src="/wsf3d/public/images/tutorial/tut_8.jpg" alt="screenshot 2" width="200"> <img src="/wsf3d/public/images/tutorial/tut_11.jpg" alt="screenshot 3" width="200">

This software has been developed by [MindEarth](http://www.mindearth.org) and has been funded by [The World Bank](http://www.worldbank.org) under the initiative "Digital Jobs For Urban Resilience - Microtasking For 3d Urban Morphology In Africa".

## Setup

This application runs a website on the local host. It is built around [node.js](http://nodejs.org), [Express](https://expressjs.com/) and [Node Package Manager](https://www.npmjs.com/). Those can be installed on any platform or host system, running Linux, Windows, or Mac OS. In order to do so, it is sufficient to install `node.js`, e.g., following [this link](https://nodejs.org/en/download/) and then proceeding trought the next configuration steps.

Next, an SQL server must be available and reachable by the application, for example running on the same machine. Such a server, (e.g., [MySQL](http://www.mysql.org)), must be configured separately. A dump of a functional database is provided in the `db.sql` file. In order for the application to succesfully connect and operate on the database, the connection details must be specified in the `wsf3d/routes/mysql_config.js` file as follows:

```javascript
var pool  = mysql.createPool({
    connectionLimit : 50,
    host : '<PUT THE HOST NAME HERE>',
    user : '<PUT THE DB USER NAME HERE>',
    password : '<PUT THE DB PASSWORD HERE>',
    database : '<PUT THE DATABASE NAME HERE>',
    multipleStatements: true
});
```
The necessary npm packages can be installed as follows

```bash
cd wsf3d
npm install
```

## Run
In order to run the web server and the application, it is sufficient to:

```bash
cd wsf3d
npm start
```






