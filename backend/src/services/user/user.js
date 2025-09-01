const User = require("../../models/user/user");
const {
  UserInputError,
  AuthenticationError,
} = require("apollo-server-express");

const userService = {
  async getUser(id) {
    return await User.findById(id).populate("followers").populate("following");
  },

  async searchUsers(query) {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    return users;
  },

  async updateProfile(userId, data) {
    const user = await User.findById(userId);

    if (!user) {
      throw new UserInputError("User not found");
    }

    // Update allowed fields
    if (data.name) user.name = data.name;
    if (data.bio) user.bio = data.bio;
    if (data.avatar) user.avatar = data.avatar;

    await user.save();
    return user;
  },

  async followUser(userId, followerId) {
    const [user, follower] = await Promise.all([
      User.findById(userId),
      User.findById(followerId),
    ]);

    if (!user || !follower) {
      throw new UserInputError("User not found");
    }

    if (user.followers.includes(followerId)) {
      throw new UserInputError("Already following this user");
    }

    user.followers.push(followerId);
    follower.following.push(userId);

    await Promise.all([user.save(), follower.save()]);

    return user.populate("followers following");
  },

  async unfollowUser(userId, followerId) {
    const [user, follower] = await Promise.all([
      User.findById(userId),
      User.findById(followerId),
    ]);

    if (!user || !follower) {
      throw new UserInputError("User not found");
    }

    if (!user.followers.includes(followerId)) {
      throw new UserInputError("Not following this user");
    }

    user.followers = user.followers.filter(
      (id) => id.toString() !== followerId.toString()
    );
    follower.following = follower.following.filter(
      (id) => id.toString() !== userId.toString()
    );

    await Promise.all([user.save(), follower.save()]);

    return user.populate("followers following");
  },

  async getFollowers(userId) {
    const user = await User.findById(userId).populate("followers");
    if (!user) {
      throw new UserInputError("User not found");
    }
    return user.followers;
  },

  async getFollowing(userId) {
    const user = await User.findById(userId).populate("following");
    if (!user) {
      throw new UserInputError("User not found");
    }
    return user.following;
  },

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new UserInputError("User not found");
    }

    const isValid = await user.comparePassword(oldPassword);
    if (!isValid) {
      throw new AuthenticationError("Invalid current password");
    }

    user.password = newPassword;
    await user.save();

    return true;
  },
};

module.exports = userService;
