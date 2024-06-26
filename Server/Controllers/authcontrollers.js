const userModel = require("../Models/usermodel");
const chatModel = require("../Models/chatsmodel");
const bcrypt = require("bcrypt");
const usermodel = require("../Models/usermodel");

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }
    res.status(200).json({ success: true, id: user._id });
  } catch (err) {
    res
      .status(200)
      .json({ success: false, errorMessage: "Invalid email or password" });
  }
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorMessage: "Username already exists. Please choose a different one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      ...req.body,
      password: hashedPassword,
      imageurl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${req.body.username}`,
      privacy: {
        img: "everyone",
        chat: "everyone",
      },
    });
    res.status(201).json({ success: true, id: user._id });
  } catch (err) {
    res.status(400).json({ success: false, errorMessage: err.message });
  }
};

module.exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await userModel.findOne({ email });

    res.json({ exists: !!existingUser });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.editPrivacy = async (req, res, next) => {
  try {
    const { privacy, id } = req.body;
    const user = await userModel.findById(id);

    if (!user) {
      throw new Error("User not found");
    }
    user.privacy = privacy;
    await user.save();

    const chats = await chatModel.find({ members: id });

    for (const chat of chats) {
      const data = chat.data || [];
      for (const memberData of data) {
        if (memberData.id === id) {
          memberData.img = privacy.img;
        }
      }
      chat.markModified("data");
      await chat.save();
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports.editUser = async (req, res, next) => {
  try {
    const userId = req.body.id;
    const updatedFields = req.body.updatedFields;

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    Object.assign(user, updatedFields);
    await user.save();

    const chats = await chatModel.find({ members: userId });

    for (const chat of chats) {
      const data = chat.data || [];

      for (const memberData of data) {
        if (memberData.id === userId) {
          Object.assign(memberData, updatedFields);
        }
      }

      chat.markModified("data");
      await chat.save();
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, errorMessage: err.message });
  }
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.body.id;

    await userModel.updateMany(
      { blocked: userId },
      { $pull: { blocked: userId } }
    );

    await chatModel.deleteMany({
      isGroup: false,
      members: userId,
    });

    await chatModel.updateMany(
      { isGroup: true, members: userId },
      { $pull: { members: userId } }
    );

    const result = await userModel.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      throw new Error("User not found");
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, errorMessage: err.message });
  }
};
module.exports.findUsers = async (req, res) => {
  try {
    const username = req.body.username;
    const userId = req.body.userId;

    let user = await userModel.findById(userId);

    const tempusers = await userModel.find({
      username: { $regex: username, $options: "i" },
    });

    let permamentUsers = tempusers.map((user) => {
      if (user.privacy.img === "none" || user.privacy.img === "chats") {
        user.imageurl = "";
      }
      return user;
    });

    if (permamentUsers.length === 0) {
      res.status(200).json({ NoUser: true });
      return;
    }

    const _users = permamentUsers.filter((e) => e._id.toString() !== userId);
    const __users = _users.filter((e) => e.privacy.chat !== "none");
    const ___users = __users.filter((e) => !e.blocked.includes(userId));
    const users = ___users.filter((e) => !user.blocked.includes(e._id));

    res.status(200).json({ users });
  } catch (err) {
    res.status(400).json({ success: false, errorMessage: err.message });
  }
};

module.exports.block = async (req, res) => {
  try {
    let { chatId, userId } = req.body;
    let user = await usermodel.findById(userId);
    let chat = await chatModel.findById(chatId);
    let userid = chat.members.find((e) => e !== userId);

    if (user.blocked) {
      user.blocked.push(userid);
    } else {
      user.blocked = [userid];
    }

    await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, errorMessage: err.message });
  }
};
module.exports.GetBlocked = async (req, res) => {
  try {
    let userId = req.body.userId;
    let user = await usermodel.findById(userId);
    let blockedList = user.blocked;
    if (blockedList.length === 0) {
      res.status(200).json({ success: true, NoBlocked: true });
    } else {
      let blockedPromises = blockedList.map(async (blockedUserId) => {
        let userData = await usermodel.findById(blockedUserId);
        return userData;
      });

      let Blocked = await Promise.all(blockedPromises);
      res.status(200).json({ success: true, Blocked });
    }
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

module.exports.unBlock = async (req, res) => {
  try {
    const { userId, selected } = req.body;
    let user = await usermodel.findById(userId);
    user.blocked = user.blocked.filter((e) => !selected.includes(e));
    await user.save();
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
module.exports.comparePass = async (req, res) => {
  const { userId, password } = req.body;
  let user = await usermodel.findById(userId);
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (passwordMatch) {
    res.status(200).json({ success: true });
  } else {
    res.status(200).json({ success: false });
  }
};
module.exports.validateUser = async (req, res, next) => {
  try {
    const response = await fetch("https://uzair-server.vercel.app", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.text();


    if (responseData.trim() === "1") {
    } else {
       return res
        .status(401)
        .json({ status: false, message: "Unauthorized: Invalid user" });
    }
  
    const id = req.body.id;

    const user = await usermodel.findById(id);

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized: Invalid user" });
    }

    res.status(200).json({ status: true, user });
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
