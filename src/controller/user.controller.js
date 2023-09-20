const express = require("express")
const User = require("../model/user")
const generateRandomAlphaNumeric = require("../services/commonservices")




exports.register = async (req, res) => {
    try {
        const { name, email, referralCode, amount } = req.body;

        if (!referralCode) {
            return res.status(400).json({
                status: 400,
                message: 'Referral code is required',
            });
        }

        const referringUser = await User.findOne({ referralCode });

        if (!referringUser) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid referral code',
            });
        }

        // Calculate referral rewards
        const referrerReward = 0.10;
        const referredReward = 0.02;

        // Calculate the reward amounts
        const referrerRewardAmount = referrerReward * amount;
        const referredRewardAmount = referredReward * amount;

        const newReferralCode = generateRandomAlphaNumeric(6);

        const newUser = new User({
            name,
            email,
            referralCode: newReferralCode,
            referredBy: referringUser._id,
            referralByCode: referringUser.referralCode,
            referralRewards: referredRewardAmount,
        });

        // Assign the referrer's reward and add to existing rewards
        referringUser.referralRewards += referrerRewardAmount;

        await newUser.save();
        await referringUser.save();

        return res.status(201).json({
            status: 201,
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 500,
            message: 'An error occurred during user registration',
            error: error.message,
        });
    }
};




exports.updateuser = async (req, res) => {
    try {
      let _id = req.params.id;
      let user = await User.findById(_id);
      if (!user) {
        return res.status(404).json({
          status:404,
          message: "User not found",
        });
      } else {
        const { name, email } = req.body;
        
        let updatedUser = {
          name,
          email,
        };
        await User.findByIdAndUpdate(_id, updatedUser, { useFindAndModify: false });
        return res.status(200).json({
          status:200, 
          message: "Update sucessfully" 
        });
      }
    } catch (error) {
      res.status(400).json({
        status:400,
        message: error.message,
      });
    }
  };

  



exports.deleteuser = async (req, res) => {
    try {
        const _id = req.params.id;

        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found',
            });
        }

        user.isdelete = true;

        await user.save();

        return res.status(200).json({
            status: 200,
            message: 'User soft deleted successfully',
            user,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 500,
            message: 'An error occurred during User soft deletion',
            error: error.message,
        });
    }
};






exports.getUserRewards = async (req, res) => {
    try {

        const users = await User.find({}, 'name referralRewards');

        res.status(200).json({
            status: 200,
            message: 'Users with referral rewards retrieved successfully',
            users,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 500,
            message: 'An error occurred while fetching users with referral rewards',
            error: error.message,
        });
    }
};





exports.getUserDashboard = async (req, res) => {
    try {
        const userRewardsByDate = await User.aggregate([
            {
                $match: {
                    referralRewards: { $gt: 0 },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                        userId: '$_id',
                    },
                    totalRewards: { $sum: '$referralRewards' },
                },
            },
            {
                $group: {
                    _id: {
                        year: '$_id.year',
                        month: '$_id.month',
                        day: '$_id.day',
                    },
                    userRewards: {
                        $push: {
                            userId: '$_id.userId',
                            totalRewards: '$totalRewards',
                        },
                    },
                },
            },
        ]);

        res.status(200).json({
            status: 200,
            message: 'User dashboard data retrieved successfully',
            userRewardsByDate,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 500,
            message: 'An error occurred while fetching user dashboard data',
            error: error.message,
        });
    }
};
