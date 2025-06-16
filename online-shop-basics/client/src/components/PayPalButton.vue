<template>
  <div ref="paypalButtonContainer"></div>
</template>

<script>
import axios from "axios";
import { useProductsList } from "@/stores/products";
import { useCart } from "@/stores/cart";

export default {
  name: "PayPalButton",
  props: {
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    deliveryFee: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      paypalScriptLoaded: false,
      productsStore: useProductsList(),
      cartStore: useCart(),
    };
  },
  mounted() {
    this.loadPayPalScript();
  },
  methods: {
    async loadPayPalScript() {
      // Check if script is already loaded to prevent multiple loads
      if (this.paypalScriptLoaded || document.getElementById("paypal-sdk")) {
        this.renderPayPalButtons();
        return;
      }

      const script = document.createElement("script");
      script.id = "paypal-sdk";

      let paypalClientId = null;
      try {
        // Assuming getAPI is an async method that fetches the client ID
        const response = await this.productsStore.getAPI("getpaypalclientid");
        paypalClientId = response.data;
      } catch (error) {
        console.error("Failed to fetch PayPal client ID:", error);
        alert("Could not load PayPal payment options. Please try again later.");
        return; // Stop execution if client ID can't be fetched
      }

      if (!paypalClientId) {
        console.error("PayPal Client ID is null or undefined.");
        alert("Could not load PayPal payment options. Please try again later.");
        return;
      }

      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR`;
      script.onload = () => {
        this.paypalScriptLoaded = true;
        this.renderPayPalButtons();
      };
      script.onerror = (error) => {
        console.error("Failed to load PayPal SDK script:", error);
        alert("Could not load PayPal payment options. Please try again later.");
      };
      document.body.appendChild(script);
    },
    renderPayPalButtons() {
      if (!window.paypal || !this.$refs.paypalButtonContainer) {
        console.warn("PayPal SDK not loaded or container not found yet.");
        return;
      }

      const totalPrice = (this.productPrice * this.quantity).toFixed(2);
      const cartItem = {
        name: this.productName,
        price: this.productPrice.toFixed(2),
        quantity: this.quantity,
      };

      // Clear any existing PayPal buttons before rendering new ones
      while (this.$refs.paypalButtonContainer.firstChild) {
        this.$refs.paypalButtonContainer.removeChild(
          this.$refs.paypalButtonContainer.firstChild
        );
      }

      window.paypal
        .Buttons({
          style: {
            layout: "vertical", // or 'horizontal'
            color: "blue", // 'gold', 'silver', 'blue', 'white', 'black'
            shape: "rect", // 'rect' or 'pill'
            label: "paypal", // 'paypal', 'checkout', 'pay', 'buynow', 'installment'
          },
          createOrder: async (data, actions) => {
            try {
              const response = await axios.post("/api/orders", {
                cart: this.cartStore.getCart(),
                deliveryFee: this.deliveryFee,
              });
              const orderData = response.data;
              if (orderData.id) {
                return orderData.id;
              } else {
                throw new Error("No order ID returned from backend.");
              }
            } catch (error) {
              console.error("Error creating PayPal order on backend:", error);
              alert("Could not create PayPal order. Please try again.");
              throw error;
            }
          },
          onApprove: async (data, actions) => {
            try {
              const response = await axios.post(
                `/api/orders/${data.orderID}/capture`
              );
              const orderDetails = response.data;
              this.$emit("payment-success", orderDetails);
              console.log("Payment details:", orderDetails);
            } catch (error) {
              console.error("Error capturing PayPal order on backend:", error);
              this.$emit("payment-error", error);
              alert("Could not complete PayPal payment. Please try again.");
            }
          },
          onCancel: (data) => {
            console.log("Payment cancelled:", data);
            this.$emit("payment-cancelled", data);
            alert("PayPal payment was cancelled.");
          },
          onError: (err) => {
            console.error("PayPal button error:", err);
            alert(
              "An error occurred with the PayPal payment. Please try again."
            );
          },
        })
        .render(this.$refs.paypalButtonContainer)
        .catch((error) => {
          console.error("Failed to render PayPal Buttons:", error);
          alert("Failed to display PayPal buttons. Please check your console.");
        });
    },
  },
};
</script>
