import {select} from './settings.js';
import amountWidget from '../components/amountwidget';

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

export default CartProduct;