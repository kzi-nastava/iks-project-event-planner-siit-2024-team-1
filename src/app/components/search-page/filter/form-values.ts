export interface FilterFormValues {
    showEvents: boolean;
    showServices: boolean;
    showProducts: boolean;
    events: {
      eventDate: Date[] | string[];
      type: string;
      city: string;
    };
    services: {
      priceMin: number | string;
      priceMax: number | string;
      category: string;
      durationMin: number | string;
      durationMax: number | string;
      city: string;
    };
    products: {
      priceMin: number | string;
      priceMax: number | string;
      category: string;
      durationMin: number | string;
      durationMax: number | string;
      city: string;
    };
  }