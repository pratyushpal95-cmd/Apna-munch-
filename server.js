const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "अपना मंच Backend चालू है ✅"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log("अपना मंच server चल रहा है");
});
