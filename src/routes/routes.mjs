import { Router } from "express";
import {
  getImage,
  uploadImage,
  listImages,
} from "../controllers/imageController.mjs";
import multer from "multer";

const router = Router();
const upload = multer();

router.post("/upload", upload.single("image"), uploadImage);
router.get("/pictures/:imageName", getImage);
router.get("/pictures", listImages);

export default router;
