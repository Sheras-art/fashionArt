import { Router } from "express";
import { submitUserFeedback } from "../controllers/contactUs.controller.js";
import contactLimiter from "../middlerwares/contactLimiter.js";
import { validateContact } from "../middlerwares/validateConact.js";

const contactRouter = Router();

contactRouter.route("/submit-feedback").post(contactLimiter, validateContact, submitUserFeedback);

export default contactRouter;