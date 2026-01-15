const app = require("express").Router();
const bcrypt = require('bcrypt');
const Admin = require('../modules/AdminModule');

app.post('/register', async (req, res) => {
    const { adminId, username, email, password } = req.body;
    try {
        
        if (!adminId || !username || !email || !password) { return res.status(500).json({ message: "fill all the details" }); }
        const adminexist = await Admin.findOne({adminId});
        const userexist = await Admin.findOne({username})
        const emailexist = await Admin.findOne({email})
        
        if (adminexist || emailexist || userexist)
        { return res.status(500).json({ message: "Admin / Email Already Exists" }); }
        const hashpass = await bcrypt.hash(password, 10);
        const newadmin = new Admin({ adminId, username, email, password: hashpass })
        newadmin.save()

        res.status(200).json({ message: "Admin Created Successfully" });
    }
    catch (err) {
        res.status(404).json(err)
    }
})


app.post('/login', async (req, res) => {
    try {
         const data = req.body.user || req.body;
         const {  username, password } = data;
        if (!username ||  !password) {
            res.status(500).json({ message: "Fill the Details First" });
        }
        const admin = await Admin.findOne({
            $or: [{ username: username }, { email: username }],
        });
        if (!admin) {
            return res.status(500).json({message:"Admin Doesn't Exists"})
        }
        const valid_password = await bcrypt.compare(password, admin.password);
        if (!valid_password) {
            return res.status(500).json({ message: "Invalid Password" });
        }
        res.status(200).json({ message: "Login Successfull" });

    }
    catch (err) {
        res.status(404).json(err)
    }
})

app.delete('/delete/:adminId', async (req, res) => {
    try {
        const { adminId } = req.params;
        const adminexist = await Admin.findOne({ adminId });
        if (!adminexist) return res.status(500).json({ message: "Admin Does Not Exists" });
        await Admin.findOneAndDelete({ adminId });
        res.status(200).json({ message: "Admin Deleted Successfully" });

    }
    catch (err) {
        res.status(404).json(err)
    }
});

app.get('/:adminId', async (req, res) => {
    try {
        const { adminId } = req.params;
        const user = await Admin.findOne({
          $or: [{ username: adminId }, { email: adminId }],
        });
        res.status(200).json({ user });
        
    }
    catch (err)
    {
        res.status(500).json(err)
    }
})

module.exports = app