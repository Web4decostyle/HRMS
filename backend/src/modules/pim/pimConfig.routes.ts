import express from "express";
import { getPimScreens } from "../../utils/pimScreens";

const router = express.Router();

router.get("/screens", (req, res) => {
  const screens = getPimScreens();
  return res.json(screens);
});

export default router;
