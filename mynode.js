const fs = require("fs");
const path = require("path");
const successColor = "\x1b[32m%s\x1b[0m";
const checkSign = "\u{2705}";
const dotenv = require("dotenv").config({ path: "src/.env" });

const envFile = `export const firebaseConfig = {
    apiKey: '${process.env.API_KEY}',
    authDomain: '${process.env.AUTH_DOM}',
    projectId: '${process.env.PROJ_ID}',
    storageBucket: '${process.env.STORAGE}',
    messagingSenderId: '${process.env.MESS_SEND_ID}',
    appId: '${process.env.APP_ID}',
    measurementId: '${process.env.MEASURE_ID}',
    googleVisionApiKey : '${process.env.googleVisionApiKey}',
    geminiApiKey : '${process.env.geminiApiKey}',
    databaseURL : '${process.env.databaseURL}',
};
`;
const targetPath = path.join(__dirname, "./src/environment.ts");
fs.writeFile(targetPath, envFile, (err) => {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log(
      successColor,
      `${checkSign} Successfully generated environment.ts`
    );
  }
});
