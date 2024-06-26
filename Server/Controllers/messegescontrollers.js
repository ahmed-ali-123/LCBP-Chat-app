const chatsmodel = require("../Models/chatsmodel");
const messegesModel = require("../Models/messegesmodel");
const usermodel = require("../Models/usermodel");

module.exports.getmesseges = async (req, res) => {
  try {
    const chatID = req.body.chatID;
    const userID = req.body.userID;
    if (!chatID || !userID) {
      throw new Error("IDs are required");
    }

    const messages = await messegesModel.find({ chatID });
    const user = await usermodel.findById(userID);
    const chat = await chatsmodel.findById(chatID);

    if (!user || !chat) {
      return res.status(500).json({ success: false, message: "User invalid" });
    }
    if (messages && messages.length > 0) {
      const updatedMessages = messages.map((message) => {
        if (!message.seenBy.includes(userID)) {
          message.seenBy.push(userID);
        }
        return message;
      });

      await Promise.all(updatedMessages.map((message) => message.save()));
      let data;
      if (chat.isGroup) {
        data = { name: chat.name };
        return res.status(200).json({
          success: true,
          messages: updatedMessages,
          group: chat.isGroup,
          admin: chat.admin,
          data,
          imageurl: chat.imageurl,
        });
      } else {
        data = chat.data.map((e) => {
          if (e.id !== userID && e.img === "none") {
            e.imageurl = "";
          }
          return e;
        });
        return res.status(200).json({
          success: true,
          messages: updatedMessages,
          group: chat.isGroup,
          admin: chat.admin,
          data,
        });
      }
    } else {
      let data;
      if (chat.isGroup) {
        data = { name: chat.name };
        return res.status(200).json({
          success: false,
          message: "No messages found",
          group: chat.isGroup,
          admin: chat.admin,
          data,
          imageurl: chat.imageurl,
        });
      } else {
        data = chat.data.map((e) => {
          if (e.id !== userID && e.img === "none") {
            e.imageurl = "";
          }
          return e;
        });
        return res.status(200).json({
          success: false,
          message: "No messages found",
          group: chat.isGroup,
          admin: chat.admin,
          data,
        });
      }
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports.seen = async (req, res) => {
  try {
    const chatID = req.body.chatID;
    const userID = req.body.userID;
    if (!chatID || !userID) {
      throw new Error("IDs are required");
    }

    const messages = await messegesModel.find({ chatID });
    const user = await usermodel.findById(userID);
    const chat = await chatsmodel.findById(chatID);
    if (!user || !chat) {
      return res.status(500).json({ success: false, message: "User invalid" });
    }
    if (messages && messages.length > 0) {
      const updatedMessages = messages.map((message) => {
        if (!message.seenBy.includes(userID)) {
          message.seenBy.push(userID);
        }
        return message;
      });

      await Promise.all(updatedMessages.map((message) => message.save()));
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const { ObjectId } = require("mongodb");

module.exports.getNewMessagesCount = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const messages = await messegesModel
      .find({ chatID: chatId }, { content: 1, seenBy: 1, createdAt: 1 })
      .sort({ _id: -1 });

    let count = 0;
    let latestMessage = messages.length > 0 ? messages[0].content : "";

    for (const message of messages) {
      if (!message.seenBy.includes(userId)) {
        count++;
      }
    }

    return res.status(200).json({
      newMessageCount: count,
      latestMessage,
      latestUpdated: messages.length > 0 ? messages[0].createdAt : null,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports.createmessege = async (req, res, next) => {
  const chatID = req.body.chatID;
  const userID = req.body.userID;
  const content = req.body.content;

  if (!chatID || !userID || !content) {
    return res.status(400).json({
      success: false,
      error: "fields are required.",
    });
  }

  try {
    const user = await usermodel.findById(userID);
    const chat = await chatsmodel.findById(chatID);

    if (!user || !chat) {
      return res
        .status(500)
        .json({ success: false, message: "User or chat invalid" });
    }

    const message = new messegesModel({
      chatID,
      senderID: userID,
      content,
      seenBy: [userID],
      username: user.username,
    });

    await message.save();

    chat.updatedAt = new Date();
    await chat.save();

    return res.status(201).json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "server error" });
  }
};

module.exports.deletemessege = (req, res) => {
  try {
    const messegeID = req.body.messegeID;
    if (!messegeID) {
      res.json({ success: false, message: "Message id is required" });
      return;
    }
    messegesModel
      .findByIdAndDelete(messegeID)
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        res.status(400).json({ sucess: false });
      });
  } catch (e) {
    res.status(400).json({ sucess: false, message: e.message });
  }
};

module.exports.latestMessages = async (req, res) => {
  try {
    let { chatID, userID } = req.body;
    const messages = await messegesModel.find({ chatID });
    const updatedMessages = messages.map((message) => {
      if (!message.seenBy.includes(userID)) {
        message.seenBy.push(userID);
      }
      return message;
    });

    await Promise.all(updatedMessages.map((message) => message.save()));
    res.status(200).json({ success: true, messages });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
