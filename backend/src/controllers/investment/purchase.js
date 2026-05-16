import InvestmentModel from '../../model/investmentModel.js';
import UserModel from '../../model/userModel.js';

export const purchase = async (req, res, next) => {
  try {
    const { date, weight, investedValue, user_id } = req.body;

    if (!date || !weight || !investedValue || !user_id) {
      return res
        .status(400)
        .json({ success: false, message: 'Date, weight, amount, and user_id are required' });
    }

    const user = await UserModel.findById(user_id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const investment = await InvestmentModel.create({
      date,
      weight: Number(weight).toFixed(2),
      investedValue: Number(investedValue).toFixed(2),
      userId: user_id,
    });

    if (!investment)
      return res.status(400).json({ success: false, message: 'Failed to record investment' });

    return res.status(201).json({ success: true, message: 'Investment recorded successfully' });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || 'Investment failed, please try again' });
  }
};
