const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI नहीं मिला");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.json({
    success: true,
    message: "अपना मंच Backend चालू है",
    database:
      mongoose.connection.readyState === 1
        ? "MongoDB Connected"
        : "MongoDB Not Connected"
  });
});

app.get("/api/health", function (req, res) {
  res.json({
    success: true,
    server: "online",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "not connected"
  });
});

app.post("/api/users", async function (req, res) {
  try {
    const { name, mobile, email } = req.body;

    if (!name || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile और email जरूरी हैं"
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number 10 digit का होना चाहिए"
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { mobile: mobile },
        { email: email.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "यह mobile या email पहले से registered है"
      });
    }

    const user = await User.create({
      name: name,
      mobile: mobile,
      email: email
    });

    res.status(201).json({
      success: true,
      message: "User successfully created",
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function () {
  console.log("अपना मंच server चल रहा है");
});
