import express from "express";
import {
  getEducation, createEducation, deleteEducation,
  getLicenses, createLicense, deleteLicense,
  getLanguages, createLanguage, deleteLanguage,
} from "../qualifications/Qualification.Controller";

const router = express.Router();

// EDUCATION
router.route("/education").get(getEducation).post(createEducation);
router.route("/education/:id").delete(deleteEducation);

// LICENSES
router.route("/licenses").get(getLicenses).post(createLicense);
router.route("/licenses/:id").delete(deleteLicense);

// LANGUAGES
router.route("/languages").get(getLanguages).post(createLanguage);
router.route("/languages/:id").delete(deleteLanguage);

export default router;
