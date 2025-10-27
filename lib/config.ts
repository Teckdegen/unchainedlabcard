// Application configuration constants
export const CONFIG = {
  // Fee structure
  INSURANCE_FEE: 20, // $20 insurance fee
  CARD_BALANCE: 10,  // $10 initial card balance
  
  // Processing fee percentage (5% = 0.05)
  PROCESSING_FEE_PERCENTAGE: 0.05,
  
  // Minimum top-up amount in USD
  MINIMUM_TOPUP_AMOUNT: 10,
  
  // Get total amount including processing fee
  getTotalAmountWithFee(amount: number): number {
    return amount * (1 + this.PROCESSING_FEE_PERCENTAGE);
  },
  
  // Get total payment amount (insurance + card balance + processing fee)
  getTotalPaymentAmount(): number {
    const subtotal = this.INSURANCE_FEE + this.CARD_BALANCE;
    return this.getTotalAmountWithFee(subtotal);
  }
};