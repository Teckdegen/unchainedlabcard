// Application configuration constants
export const CONFIG = {
  // Card creation fee in USD
  CARD_CREATION_AMOUNT: 30,
  
  // Processing fee percentage (5% = 0.05)
  PROCESSING_FEE_PERCENTAGE: 0.05,
  
  // Minimum top-up amount in USD
  MINIMUM_TOPUP_AMOUNT: 10,
  
  // Minimum card creation amount in USD (including fee)
  get MINIMUM_CARD_CREATION_AMOUNT(): number {
    return this.CARD_CREATION_AMOUNT * (1 + this.PROCESSING_FEE_PERCENTAGE);
  },
  
  // Get total amount including processing fee
  getTotalAmountWithFee(amount: number): number {
    return amount * (1 + this.PROCESSING_FEE_PERCENTAGE);
  }
};