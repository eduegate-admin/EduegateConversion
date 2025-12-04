import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import CartService from "../services/cartService";

const CartContext = createContext();

// Debounce utility function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ Products: [] });
  const [cartSummary, setCartSummary] = useState({ Products: [] });
  const [isUpdating, setIsUpdating] = useState(false);

  // Use ref to store debounced functions to prevent recreation
  const updateCartRef = useRef(null);
  const updateCartCountRef = useRef(null);

  const updateCartCount = useCallback(async () => {
    try {
      const cartSummary = await CartService.getShoppingCartSummary();

      if (cartSummary.status !== 200) {
        throw new Error("Failed to fetch cart data");
      }
      setCartSummary(cartSummary.data);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  }, []);

  const updateCart = useCallback(async () => {
    try {
      setIsUpdating(true);
      const response = await CartService.getCartDetails();

      if (response.status !== 200) {
        throw new Error("Failed to fetch cart data");
      }
      setCart(response.data);
      await updateCartCount();
    } catch (error) {
      console.error("Error fetching cart data:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [updateCartCount]);

  // Create debounced versions on mount
  useEffect(() => {
    updateCartRef.current = debounce(updateCart, 500);
    updateCartCountRef.current = debounce(updateCartCount, 500);
  }, [updateCart, updateCartCount]);

  // Debounced update functions
  const debouncedUpdateCart = useCallback(() => {
    if (updateCartRef.current) {
      updateCartRef.current();
    }
  }, []);

  const debouncedUpdateCartCount = useCallback(() => {
    if (updateCartCountRef.current) {
      updateCartCountRef.current();
    }
  }, []);

  // Optimistic update function for quantity changes
  const optimisticUpdateQuantity = useCallback((productId, newQuantity) => {
    setCart((prevCart) => {
      const updatedProducts = prevCart.Products.map((product) =>
        product.SKUID === productId
          ? { ...product, Quantity: newQuantity }
          : product
      );

      // Remove product if quantity is 0
      const filteredProducts = updatedProducts.filter((p) => p.Quantity > 0);

      return {
        ...prevCart,
        Products: filteredProducts,
      };
    });

    // Update summary optimistically
    setCartSummary((prevSummary) => {
      const updatedProducts = prevSummary.Products?.map((product) =>
        product.SKUID === productId
          ? { ...product, Quantity: newQuantity }
          : product
      );

      const filteredProducts =
        updatedProducts?.filter((p) => p.Quantity > 0) || [];

      return {
        ...prevSummary,
        Products: filteredProducts,
        TotalItems: filteredProducts.reduce((sum, p) => sum + p.Quantity, 0),
      };
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartSummary,
        updateCart,
        updateCartCount,
        debouncedUpdateCart,
        debouncedUpdateCartCount,
        optimisticUpdateQuantity,
        setCart,
        isUpdating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
