import InvestmentModel from '../../model/investmentModel.js';
import UserModel from '../../model/userModel.js';
import { round } from '../../utils/roundToDecimal.js';

export const sell = async (req, res) => {
  try {
    const { user_id, investment_id, sellingPrice } = req.body;

    if (!user_id || !investment_id || !sellingPrice)
      return res
        .status(400)
        .json({
          success: false,
          message: 'User ID, Investment ID, and Selling Price are required',
        });

    const user = await UserModel.findById(user_id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const investment = await InvestmentModel.findOne({ _id: investment_id, userId: user_id });

    if (!investment)
      return res.status(404).json({ success: false, message: 'Investment not found' });

    if (investment.isSell?.status)
      return res.status(400).json({ success: false, message: 'Investment already sold' });

    await InvestmentModel.updateOne(
      { _id: investment_id, userId: user_id },
      {
        $set: {
          'isSell.status': true,
          'isSell.amount': round(Number(sellingPrice)),
        },
      },
    );

    return res
      .status(200)
      .json({
        success: true,
        message: `Successfully sold investment with Weight ${investment.weight}`,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Selling failed' });
  }
};
