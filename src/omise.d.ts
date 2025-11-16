declare module 'omise' {
  interface OmiseInstance {
    charges: {
      create(params: any): Promise<any>;
      retrieve(id: string): Promise<any>;
    };
    customers: {
      create(params: any): Promise<any>;
      retrieve(id: string): Promise<any>;
    };
    tokens: {
      create(params: any): Promise<any>;
    };
  }

  function Omise(options: {
    secretKey: string;
    publicKey: string;
  }): OmiseInstance;

  export = Omise;
}
