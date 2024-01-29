//import amountWidget from '../components/amountwidget';
import CartProduct from '../components/cartproduct.js';
import {settings, select, classNames, templates, utils} from './settings.js';


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

export default Cart;