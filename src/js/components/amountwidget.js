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

export default amountWidget;