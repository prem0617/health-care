const express = require("express");
const Specialization = require("../models/Specialization");
const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { specialization } = req.body;

    const isSpecializationExists = await Specialization.findOne({
      name: specialization.toLowerCase(),
    });

    if (isSpecializationExists) {
      return res.status(400).json({ message: "Specialization already exists" });
    }

    const newSpecialization = new Specialization({
      name: specialization.toLowerCase(),
    });

    await newSpecialization.save();

    return res.json({ specialization: newSpecialization });
  } catch (error) {
    console.log(error);
    return res.json({ error });
  }
});

router.get("/", async (req, res) => {
  try {
    const specializations = await Specialization.find();
    return res.json({ specializations });
  } catch (error) {}
});

module.exports = router;
