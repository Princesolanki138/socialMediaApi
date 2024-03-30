import JWT from "jsonwebtoken"
import { comparePassd, hashPassword } from "../helper/authHelper.js"
import User from "../models/userModel.js"
import { uploadFile } from "../utils/cloudinery.config.js"
import { followUser } from "../helper/notificationService.js"

export const signupController = async (req, res) => {
  try {
    const { userName, email, password, profile_picture_url, role } = req.body

    if (!userName || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide username, email and password",
      })
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists. Please login.' });
    }

    const hashedPassword = await hashPassword(password);


    const newuser = await User.create({
      userName,
      email,
      password: hashedPassword,
      role,
      profile_picture_url,
    })

    res.status(201).send({
      success: true,
      message: "User Created Successfully",
      newuser,
    })

  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error in signup",
      error,
    })

  }
}


export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User does not exist",
      })
    }

    const match = await comparePassd(password, user.password)

    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Invalid email and password",
      })
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    })
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_picture_url: user.profile_picture_url
      },
      token,
    })

  }

  catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    })

  }
}

export const logoutController = (req, res) => {
  try {

    res.clearCookie('token'); // Clear the token cookie

    // Send a success response
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    // If an error occurs, send a 500 Internal Server Error response
    console.error('Error while logging out:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


export const updateprofile = async (req, res) => {
  try {
    const { userName, email } = req.body;

    const profileLocalPath = req.file?.path

    const profile_picture_url = await uploadFile(profileLocalPath)

    console.log(profileLocalPath);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        userName,
        email,
        profile_picture_url: profile_picture_url?.url
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      user: user
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating profile",
      error: error.message
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    const users = await User.find({ $or: [{ username: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }] });

    res.status(200).send({
      success: true,
      users,
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in searching users",
      error: error.message
    })
  }
}

export const followUsercontroller = async (req, res) => {
  try {
    if (req.user._id !== req.params.id) {

      const user = await User.findById(req.params.id)
      const currentUser = await User.findById(req.user._id);
      if (!user.followers.includes(req.user._id)) {

        await user.updateOne({ $push: { followers: req.user._id } });
        await currentUser.updateOne({ $push: { following: req.params.id } });
        user.save();
        await followUser(currentUser._id, user._id)
        res.status(200).send({
          success: true,
          message: "User followed successfully",
          followers: user.followers,
          following: currentUser.following
        })
      } else {

        res.status(403).send({
          success: false,
          message: "You already follow this user",
        })
      }
    } else {

      res.status(403).send({
        success: false,
        message: "You can't follow yourself",
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in following user",
      error: error.message
    })
  }
}

export const UnfollowUsercontroller = async (req, res) => {
  try {
    if (req.user._id !== req.params.id) {

      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id);
      if (user.followers.includes(req.user._id)) {

        await user.updateOne({ $pull: { followers: req.user._id } });
        await currentUser.updateOne({ $pull: { following: req.params.id } });
        res.status(200).send({
          success: true,
          message: "User Unfollowed successfully",
        })
      } else {
        res.status(403).send({
          success: false,
          message: "You don't follow this user",
        })
      }
    } else {
      res.status(403).send({
        success: false,
        message: "You can't unfollow yourself",
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Unfollowing user",
      error: error.message
    })
  }
}

// display user follower and following list 

export const getUserFollowerandFollowingList = async (req, res) => {
  try {

    //Get the user ID of the logged-in user
    const loggedInUserId = req.user._id;

    // Find the logged-in user
    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      return res.status(404).send({
        success: false,
        message: "User Not Found"
      })
    }

    const followers = await User.find({ _id: { $in: loggedInUser.followers } });

    const following = await User.find({ _id: { $in: loggedInUser.following } });

    res.status(200).send({
      success: true,
      users: {
        followers: followers,
        following: following
      }
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting user follower and following list",
      error: error.message
    })

  }
}

// get all user list

export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find();

    res.status(200).send({
      success: true,
      message: "All users fetched successfully",
      users
    })
  } catch (error) {

  }
}

// delete user
export const deleteUserController = async (req, res) => {
  try {

    const user = await User.findByIdAndDelete(req.params.id);

    res.status(200).send({
      success: true,
      message: "User deleted successfully",
      user
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting user",
      error: error.message
    })
  }
}

