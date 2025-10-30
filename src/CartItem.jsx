import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeItem, updateQuantity } from './CartSlice';
import './CartItem.css';

const CartItem = ({ onContinueShopping, 
                    plantBtnDisabled,
                    cartList, 
                    resetCartList }) => {

  const cart = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  // Calculate total amount for all products in the cart
  const calculateTotalAmount = () => {
    let totalAmount = 0;
    if(cart){
      cart.forEach((item) => totalAmount += (item.quantity * parseFloat(item.cost.substring(1))));
    }
    return totalAmount;
  };

  const handleContinueShopping = (e) => {
    onContinueShopping(e);
  };

  const handleCheckoutShopping = (e) => {
    alert('Coming Soon');
  };

  const handleIncrement = (item) => {
    dispatch(updateQuantity({name: item.name, amount: item.quantity + 1}));
  };

  const handleDecrement = (item) => {
    if(item.quantity > 1){
      dispatch(updateQuantity({name: item.name, amount: item.quantity - 1}));
    } else {
      dispatch(removeItem(item));
      cartList.splice(cartList.indexOf(item.name), 1);
      resetCartList((cartList) => (
        [...cartList]
      ));
      plantBtnDisabled(item.name);
    }
  };

  const handleRemove = (item) => {
    dispatch(removeItem(item));
    cartList.splice(cartList.indexOf(item.name), 1);
    resetCartList((cartList) => (
        [...cartList]
    ));
    plantBtnDisabled(item.name);
  };

  // Calculate total cost based on quantity for an item
  const calculateTotalCost = (item) => {
    return parseFloat(item.cost.substring(1)) * parseInt(item.quantity)
  };

  const resetCartCount = () => {
    return (cart ? cart.lenth : 0)
  };

  return (
    <div className="cart-container">
      <h2 style={{ color: 'black' }}>
        Total Cart Amount: {`$${calculateTotalAmount()}`} 
      </h2>
      <div>
        {cart.map(item => (
          <div className="cart-item" 
               key={item.name}>
            <img className="cart-item-image" 
                 src={item.image} 
                 alt={item.name} />
            <div className="cart-item-details">
              <div className="cart-item-name">
                {item.name}
              </div>
              <div className="cart-item-cost">
                Item Price: {item.cost}
              </div>
              <div className="cart-item-quantity">
                <button className="cart-item-button cart-item-button-dec" 
                        onClick={() => handleDecrement(item)}>
                  &#8211;
                </button>
                <span className="cart-item-quantity-value">
                  {item.quantity}
                </span>
                <button className="cart-item-button cart-item-button-inc"
                        onClick={() => handleIncrement(item)}>
                  &#43;
                </button>
              </div>
              <div className="cart-item-total">
                Item Total: ${calculateTotalCost(item)}
              </div>
              <button className="cart-item-delete" 
                      onClick={() => handleRemove(item)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px', color: 'black' }}
           className='total_cart_amount'>
        {`${cart.length || 0} type(s) of plant`}
      </div>
      <div className="continue_shopping_btn">
        <button className="get-started-button"
                onClick={(e) => handleContinueShopping(e)}>
          Continue Shopping
        </button>
        <br />
        <button className="get-started-button1"
                onClick={ (e) => handleCheckoutShopping(e) }>
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartItem;


