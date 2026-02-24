import { Router } from "express";
import { verifyJWT } from "../middlerwares/auth.middleware.js";
import authorizeRoles from "../middlerwares/authorizeRoles.js";
import { createCollection, deleteCollection, getAllCollections } from "../controllers/collections.controller.js";
import { upload } from "../middlerwares/multer.js";

const collectionsRoutes = Router();

// Collections routes will be write here

collectionsRoutes.route("/all-collections").get(getAllCollections);


// Collections secure routes will be write here

collectionsRoutes.route("/create-collection").post(verifyJWT, authorizeRoles("owner", "admin"),  upload.single("coverImage"), createCollection);
collectionsRoutes.route("/delete-collection/:id").delete(verifyJWT, authorizeRoles("owner", "admin"), deleteCollection);

export {collectionsRoutes};