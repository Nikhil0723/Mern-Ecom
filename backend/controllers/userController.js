import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error in authUser:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error in registerUser:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, password } = req.body;

    const updatedName = typeof name === 'string' ? name.trim() : user.name;
    const updatedEmail =
      typeof email === 'string' ? email.trim().toLowerCase() : user.email;

    if (!updatedName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!updatedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailInUse = await User.findOne({
      email: updatedEmail,
      _id: { $ne: user._id },
    });

    if (emailInUse) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    user.name = updatedName;
    user.email = updatedEmail;

    const isNewPassword = typeof password === 'string' && password.length > 0;

    if (isNewPassword) {
      if (password.length < 8) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters',
        });
      }

      user.password = password;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    console.error('Error in updateUserProfile:', error.message);
    return res.status(500).json({ message: 'Unable to update profile' });
  }
};




const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    return res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsers:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin user' });
    }

    await User.deleteOne({ _id: user._id });

    return res.status(200).json({ message: 'User removed' });
  } catch (error) {
    console.error('Error in deleteUser:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
};