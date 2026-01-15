const app = require("express").Router();
const bcrypt = require('bcrypt');
const User = require('../modules/UserModule');
const Admin = require('../modules/AdminModule')

app.post('/register', async (req, res) => {
    const data = req.body.user || req.body;
    const { userId, username, email, password } = data;
    try {
        
        if (!userId || !username || !email || !password) {
          return res.status(500).json({ message: "fill all the details" });
        }
        const useexist = await User.findOne({ userId });
        const userexist = await User.findOne({username})
        const emailexist = await User.findOne({email})
        
        if (useexist || emailexist || userexist) {
          return res
            .status(500)
            .json({ message: "User / Email Already Exists" });
        }
        const hashpass = await bcrypt.hash(password, 10);
        const newadmin = new User({
          userId,
          username,
          email,
          password: hashpass,
        });
        newadmin.save()

        res.status(200).json({ message: "User Created Successfully" });
    }
    catch (err) {
        res.status(404).json(err)
    }
})


app.post('/login', async (req, res) => {
    try {
        const data = req.body.user || req.body;
        const { username, password } = data;
        if (!username ||  !password) {
            res.status(500).json({ message: "Fill the Details First" });
        }
        const user = await User.findOne({
          $or: [{ username: username }, { email: username }],
        });
        if (!user) {
          return res.status(500).json({ message: "User Doesn't Exists" });
        }
        const valid_password = await bcrypt.compare(password, user.password);
        if (!valid_password) {
            return res.status(500).json({ message: "Invalid Password" });
        }
        res.status(200).json({ message: "Login Successfull" });

    }
    catch (err) {
        res.status(404).json(err)
    }
})

app.delete('/delete/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const useexist = await User.findOne({ userId });
        if (!useexist)
          return res.status(500).json({ message: "User Does Not Exists" });
        await User.findOneAndDelete({ userId });
        res.status(200).json({ message: "User Deleted Successfully" });

    }
    catch (err) {
        res.status(404).json(err)
    }
});
app.put("/update/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, email } = req.body;

  try {
    // Use findOneAndUpdate to locate by userId and apply changes
    // { new: true } returns the document AFTER the update is applied
    // { runValidators: true } ensures the new data follows your Schema rules
    const updatedUser = await User.findOneAndUpdate(
      { userId: userId },
      { $set: { username, email } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      user: {
        userId: updatedUser.userId,
        username: updatedUser.username,
        email: updatedUser.email,
      },
    });
  } catch (err) {
    // Handling duplicate key errors (e.g., if username/email are unique in schema)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }
    res
      .status(500)
      .json({ message: "Error updating profile", error: err.message });
  }
});

app.get("/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;
    const user = await User.findOne({
      $or: [{ username: adminId }, { email: adminId }],
    });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = app