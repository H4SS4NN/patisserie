declare module 'paypal-rest-sdk' {
  interface PayPalConfig {
    mode: string;
    client_id: string;
    client_secret: string;
  }

  interface PayPalLink {
    rel: string;
    href: string;
  }

  interface PayPalSale {
    id: string;
  }

  interface PayPalRelatedResource {
    sale?: PayPalSale;
  }

  interface PayPalTransaction {
    related_resources?: PayPalRelatedResource[];
  }

  interface PayPalPayment {
    id?: string;
    state?: string;
    links?: PayPalLink[];
    transactions?: PayPalTransaction[];
  }

  type PayPalPaymentResponse = (error: any, payment: PayPalPayment) => void;
  type PayPalPaymentExecuteResponse = (error: any, payment: PayPalPayment) => void;

  function configure(config: PayPalConfig): void;
  
  interface PayPalPaymentAPI {
    create(
      paymentJson: any,
      callback: PayPalPaymentResponse
    ): void;
    execute(
      paymentId: string,
      executeJson: any,
      callback: PayPalPaymentExecuteResponse
    ): void;
  }

  interface PayPalAPI {
    configure: typeof configure;
    payment: PayPalPaymentAPI;
  }

  const paypal: PayPalAPI;
  export default paypal;
}

