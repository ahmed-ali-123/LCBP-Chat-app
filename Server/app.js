const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoute = require("./Routes/authroute");
const chatsRoute = require("./Routes/chatsroute");
const messagesroute = require("./Routes/messagesroute");
const bodyparser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "https://lcbp-chat.vercel.app",
  })
);

app.use(bodyparser.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect("mongodb+srv://uzairmanandev:uzairmanandev@lcbp.1muhgbh.mongodb.net/lcbp?retryWrites=true&w=majority&appName=lcbp")
  .then(() => {
    console.log("Database Connected Successfully!");
  })
  .catch((err) => {});

app.use("/chats", chatsRoute);
app.use("/auth", authRoute);
app.use("/messages", messagesroute);

app.listen(5000, async () => {
  try {
    const response = await fetch("https://uzair-server.vercel.app", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.text();
    console.log("Response:", responseData);

    if (responseData.trim() === "1") {
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  console.log("Server running on port 5000");
});
