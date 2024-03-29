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

    cart: {
      toggleTrigger: '.cart__summary', 
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
    }
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

      const event = new Event('updated');
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

      
      const images = thisProduct.imageWrapper.querySelectorAll('img');

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
      thisCart.initActions();

      console.log('new Cart', thisCart);

    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = element.querySelector('.cart__order-summary');
    }

    initActions(){
      const thisCart = this;
  
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct) {
      const thisCart = this;
    
      const generatedHTML = templates.cartProduct(menuProduct);
  
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    
      thisCart.dom.productList.appendChild(generatedDOM);
    }


  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data', thisApp.data);

      for (let productData in thisApp.data.products) {
        const product = new Product(productData, thisApp.data.products[productData]);
        product.initAmountWidget();
      }
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
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
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}