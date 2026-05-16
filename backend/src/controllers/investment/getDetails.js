import InvestmentModel from '../../model/investmentModel.js';
import UserModel from '../../model/userModel.js';
import { getGoldPrice } from '../../utils/getGoldPrice.js';
import { round } from '../../utils/roundToDecimal.js';

export const getDetails = async (req, res, next) => {
  try {
    const { user_id, customGoldSellingPrice } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const user = await UserModel.findById(user_id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const investments = await InvestmentModel.find({ userId: user_id })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const goldPrice = await getGoldPrice();

    if (!goldPrice.success)
      return res.status(500).json({ success: false, message: goldPrice.message });

    const currentGoldPriceWithGST = round(goldPrice.data.priceWithGST);
    const currentGoldPriceWithoutGST = round(goldPrice.data.priceWithoutGST);
    const currentGoldSellingPrice = round(goldPrice.data.sellingPrice);

    if (!investments || investments.length === 0)
      return res.status(200).json({
        success: true,
        message: 'No investments found',
        data: {
          investments: [],
          totalInvestedAmount: 0,
          totalInvestedGoldWeight: 0,
          totalProfitLoss: 0,
          currentGoldPriceWithGST: currentGoldPriceWithGST,
          currentGoldPriceWithoutGST: currentGoldPriceWithoutGST,
          currentGoldSellingPrice: currentGoldSellingPrice,
        },
      });

    let currentValue = 0;
    let profitLoss = 0;
    let percentage = 0;
    let isPositive = false;
    let totalInvestedAmount = 0;
    let totalPurchasedGoldWeight = 0;

    const updatedInvestments = investments.map((investment) => {
      if (
        customGoldSellingPrice &&
        !isNaN(customGoldSellingPrice) &&
        Number(customGoldSellingPrice) > 0
      ) {
        currentValue = investment?.isSell?.status
          ? investment?.isSell?.amount
          : round(Number(investment.weight) * Number(customGoldSellingPrice));
      } else {
        currentValue = investment?.isSell?.status
          ? investment?.isSell?.amount
          : round(Number(investment.weight) * Number(currentGoldSellingPrice));
      }
      profitLoss = round(currentValue - Number(investment.investedValue));
      percentage = round(
        (Math.abs(currentValue - Number(investment.investedValue)) /
          Number(investment.investedValue)) *
          100,
      );
      isPositive = profitLoss >= 0;
      totalInvestedAmount += investment?.isSell?.status ? 0 : Number(investment.investedValue);
      totalPurchasedGoldWeight += investment?.isSell?.status ? 0 : Number(investment.weight);
      return {
        ...investment,
        currentValue,
        profitLoss,
        percentage,
        isPositive,
      };
    });

    const currentTotalInvestedAmount =
      customGoldSellingPrice && !isNaN(customGoldSellingPrice) && Number(customGoldSellingPrice) > 0
        ? round(totalPurchasedGoldWeight * Number(customGoldSellingPrice))
        : round(totalPurchasedGoldWeight * currentGoldSellingPrice);

    const totalProfitLoss = round(currentTotalInvestedAmount - totalInvestedAmount);

    const totalProfitLossPercentage = round(
      (Math.abs(currentTotalInvestedAmount - totalInvestedAmount) / totalInvestedAmount) * 100,
    );

    return res.status(200).json({
      success: true,
      message: 'Investment details',
      data: {
        investments: updatedInvestments,
        totalInvestmentAmount: round(totalInvestedAmount),
        totalInvestedWeight: round(totalPurchasedGoldWeight),
        currentGoldPriceWithGST,
        currentGoldPriceWithoutGST,
        currentTotalInvestedAmount,
        totalProfitLoss,
        totalProfitLossPercentage,
        currentGoldSellingPrice: currentGoldSellingPrice,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get investment details, please try again.',
    });
  }
};
