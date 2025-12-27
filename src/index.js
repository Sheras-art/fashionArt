import DBconnection from "./db/DataBase.js";
import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({
    path: "../.env"
})

const Port = process.env.PORT || 3000;

DBconnection()
  .then(() => {
    app.listen(Port, () => {
      console.log(`Server running at ${Port}`);
    });
  })
  .catch((err) => {
    console.log(`Db Connection Failed: ${err}`);
  });