import express from "express";
import { requireSignIn, isAdmin } from "../middleware/authMidleware.js";
import { UnfollowUsercontroller, deleteUserController, followUsercontroller, getAllUsers, getUserFollowerandFollowingList, loginController, logoutController, searchUsers, signupController, updateprofile } from "../controller/authController.js";
import { upload } from "../middleware/multer.middleware.js";
import { getNotifications } from "../controller/notificationcontroller.js";

const router = express.Router();

//signup route

router.post("/signup", signupController);

//login route

router.post("/login", loginController);

// logout route
router.post("/logout", requireSignIn, logoutController)

// user profile update route

router.put("/profile", upload.single('profile_picture_url'), requireSignIn, updateprofile);


// GET /search?q=query
router.get('/search', searchUsers);

//follow a user route
router.put("/:id/follow", requireSignIn, followUsercontroller);

//unfollow a user route
router.put("/:id/unfollow", requireSignIn, UnfollowUsercontroller);

// list of followers and following route
router.get("/list", requireSignIn, getUserFollowerandFollowingList)

// get all user
router.get("/all-users", requireSignIn, isAdmin, getAllUsers)

// remove user
router.delete("/:id", requireSignIn, isAdmin, deleteUserController)

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({
    success: true,
    message: "User Authenticated",
    user: req.user,
  });
});
//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({
    success: true,
    message: "Admin Authenticated",
  });
});

// test route
router.get("/hello", requireSignIn, (req, res) => {
  res.send("hello")
})

router.get('/notifications', requireSignIn, async (req, res) => {
  try {
    const notifications = await getNotifications(req.user._id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id', requireSignIn, async (req, res) => {
  try {
    await markNotificationAsRead(req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});



export default router