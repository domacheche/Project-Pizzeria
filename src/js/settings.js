export const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[class="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price .cart__order-total',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum',

    },

    
    

    
  };

  export const classNames = {
    menuProduct: {
       wrapperActive: 'active',
       imageVisible: 'active',
     },
     cart: {
       wrapperActive: 'active',
     },
  };

  export const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
    cart: {
      deliveryFee: 10,
      subtotalPrice: 0,
      totalNumber: 0,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },

  };

  

  export const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector('#template-cart-product').innerHTML),
  };