import DBconnection from "./db/DataBase.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import { Product } from "./models/product.model.js";
import { apiError } from "./utils/ApiError.js";

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

try {
  await Product.syncIndexes();
  console.log("indexes sync successfully");
} catch (error) {
  console.log("Error while sync indexes", error);
  throw new apiError(500, "Error while sync indexes")
}