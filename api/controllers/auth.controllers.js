import bcryptjs from 'bcryptjs'
import User from "../models/user.model.js";
import generateTokenAndSetCookie from '../utils/generateToken.js';

export const signup = async (req, res) => {
    try {
     const {fullName, userName, password, confirmPassword, gender} = req.body;

     if (password !== confirmPassword) {
        return res.status(400).json({error:"Passwords don't match"})
     }
     
     const user = User.findOne({userName});

     if(user) {
        return res.status(400).json({error:"User already exists"})
     }

     // HASH PASSWORD HERE
     const passwordHash = await bcryptjs.hash(password, 10);


     // https://avatar-placeholder.iran.liara.run
     const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`
     const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`

     const newUser = new User({
        fullName,
        userName,
        password: passwordHash,
        gender,
        profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
     })
       
     if (newUser) {
        //generate JWT token here
        generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();

        res.status(201).json({
           _id: newUser._id,
           fullName: newUser.fullName,
           userName: newUser.userName,
           profilePic: newUser.profilePic
        })
     } else {
        res.status(400).json({error:"Failed to create user"})
     }
     

    } catch (error) {
      console.log("Error in signup controller", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
   // console.log("signupUser");
}

export const login = (req, res) => {
    try {
        const { userName, password } = req.body;
		const user =  User.findOne({ userName });
		const isPasswordCorrect =  bcrypt.compare(password, user?.password || "");

		if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.userName,
			profilePic: user.profilePic,
		});
    } catch (error) {
        console.log("Error in signup controller", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
}

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};