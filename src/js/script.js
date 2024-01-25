/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
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

  const classNames = {
    menuProduct: {
       wrapperActive: 'active',
       imageVisible: 'active',
     },
     cart: {
       wrapperActive: 'active',
     },
  };

  const settings = {
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

  

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector('#template-cart-product').innerHTML),
  };

  class amountWidget {
    constructor(element) {
      const thisWidget = this;

      console.log('amountWidget:', thisWidget);
      console.log('constructor arguments:', element);

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    initActions() {
      const thisWidget = this;
  
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value); 
      });
  
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault(); 
        thisWidget.setValue(thisWidget.value - 1);
      });
  
      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: add validation */

      if (newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax && !isNaN(newValue)) {
        thisWidget.value = newValue;
        thisWidget.announce();
        
      }
      thisWidget.input.value = thisWidget.value;

    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    announce(){
      const thisWidget = this;
  const event = new CustomEvent('updated', {
    bubbles: true
  });
  thisWidget.element.dispatchEvent(event);
      
    }
  }

  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      /*generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /*create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        /* if there is an active product and it's not thisProduct.element, remove class active from it */
        for (let activeProduct of activeProducts) {
          if (activeProduct !== thisProduct.element) {
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let price = thisProduct.data.price;

      
      //const images = thisProduct.imageWrapper.querySelectorAll('img');

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for (let optionId in param.options) {
          const option = param.options[optionId];
          const isOptionSelected = formData[paramId] && formData[paramId].includes(optionId);

          // Find the image corresponding to the option
          const optionImage = thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`);

          if (optionImage) {
            if (isOptionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          // Calculate the price based on selected options
          const isDefaultOption = option.default === true;
          if (isOptionSelected && !isDefaultOption) {
            price += option.price;
          } else if (!isOptionSelected && isDefaultOption) {
            price -= option.price;
          }
        }
      }
      thisProduct.priceSingle = price;

      /*multiply price by amount */
      price *= thisProduct.amountWidget.value;

      // Update the displayed price
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;
  const productSummary = thisProduct.prepareCartProduct();

  app.cart.add(productSummary);
  thisProduct.amountWidgetElem.addEventListener('updated', function() {
    thisProduct.processOrder();
    app.cart.update();
  });
    }

    prepareCartProduct() {
      const thisProduct = this;
    
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams()
      };
    
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        params[paramId] = {
          label: param.label,
          options: {}
        }
    
       
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            params[paramId].options[optionId] = option.label;
        }
      }
    
      return params;
    }
  }
}

  class Cart{
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

    
      
      thisCart.getElements(element);
      
     
      thisCart.dom.wrapper.addEventListener('cartProductUpdated', function() {
        thisCart.update();
      });
      

      console.log('new Cart', thisCart);
      this.initActions();

    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
        console.log('toggleTrigger:', thisCart.dom.toggleTrigger);
      thisCart.dom.productList = element.querySelector('.cart__order-summary');

      thisCart.dom.deliveryFee = element.querySelector('.cart__order-delivery .cart__order-price-sum');
      thisCart.dom.subtotalPrice = element.querySelector('.cart__order-subtotal .cart__order-price-sum');
      thisCart.dom.totalPrice = element.querySelectorAll('.cart__total-price .cart__order-total');
      thisCart.dom.totalNumber = element.querySelector('.cart__total-number');
      thisCart.dom.form = element.querySelector(select.cart.form);
    }

    initActions() {
      const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });

  
    thisCart.dom.productList.addEventListener('remove', function(event) {
      thisCart.removeProduct(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
      
    }
    

    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
  
      thisCart.dom.productList.appendChild(generatedDOM);
  
      const newCartProduct = new CartProduct(menuProduct, generatedDOM);
      thisCart.products.push(newCartProduct);
  
      this.update();
    }
  
    update() {
      const thisCart = this;
    
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
    
      for (let cartProduct of thisCart.products) {
        thisCart.subtotalPrice += cartProduct.price;
        thisCart.totalNumber += cartProduct.amount;
      }
    
      thisCart.totalPrice = thisCart.subtotalPrice + settings.cart.deliveryFee;
    
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.deliveryFee.innerHTML = settings.cart.deliveryFee;
      
      for (let priceElem of thisCart.dom.totalPrice) {
        priceElem.innerHTML = thisCart.totalPrice;
      }
    }
    

    removeProduct(cartProductToRemove) {
      
      const thisCart = this;

    
    const index = thisCart.products.indexOf(cartProductToRemove);
    if (index !== -1) {
      thisCart.products.splice(index, 1);
    }

  
    cartProductToRemove.dom.wrapper.remove();

    
    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;
  
    const url = settings.db.url + '/' + settings.db.orders;
  
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,   
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,   
      deliveryFee: settings.cart.deliveryFee,
      products: []
    };
  
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
  
    
    fetch(url, options)
    .then(function(response) {
      return response.json();
    })
    .then(function(parsedResponse) {
      console.log('Parsed response:', parsedResponse);
    })
    .catch(function(error) {
      console.error('Error:', error);
    });
}

  }
  



  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
  
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = menuProduct.params;
  
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      this.initActions();
  
      console.log('new CartProduct:', thisCartProduct);
    }
  
    getElements(element) {
      const thisCartProduct = this;
    
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }
    
    
  
    initAmountWidget() {
      const thisCartProduct = this;

  thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidget);

  thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
    thisCartProduct.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
    thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

    thisCartProduct.dom.wrapper.dispatchEvent(new CustomEvent('cartProductUpdated', {
      bubbles: true
    }));
  });
      
    }

    
  initActions() {
    const thisCartProduct = this;
    
    if (thisCartProduct.dom.remove) {
      thisCartProduct.dom.remove.addEventListener('click', event => {
        event.preventDefault();
        thisCartProduct.remove();
      });
    } else {
      console.error('Element "remove" does not exist in the DOM');
    }
  }
    remove(){
      const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  getData() {
    return {
      id: this.id,
      name: this.name,
      amount: this.amount,
      price: this.price,
      priceSingle: this.priceSingle,
      params: this.params,
    };
  }


  }
  

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data', thisApp.data);

      for (let productData in thisApp.data.products) {
        const product = new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        product.initAmountWidget();
      }
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        
        
        thisApp.data.products = parsedResponse;
        
        thisApp.initMenu(); 
      })
      .catch(function(error) {
        console.error('Error:', error);
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
    

    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      console.log(cartElem);
      thisApp.cart = new Cart(cartElem);
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      
      thisApp.initCart();
    },
  };

  app.init();
}
