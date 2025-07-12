<template>
  <div ref="paypalButtonContainer"></div>
  <!-- Button container -->
</template>

<script>
import axios from "axios"; // For data fetching
import { useProductsList } from "@/stores/products";
import { useCart } from "@/stores/cart";

export default {
  // Exporting data for PayPal API
  name: "PayPalButton",
  props: {
    // Props for data exporting to API
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      // = amount
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
      // Config of PayPal API
      paypalScriptLoaded: false,
      productsStore: useProductsList(),
      cartStore: useCart(),
    };
  },
  mounted() {
    // Calling function to load PayPal button
    this.loadPayPalScript();
  },
  methods: {
    async loadPayPalScript() {
      // Check if script is already loaded to prevent multiple loads
      if (this.paypalScriptLoaded || document.getElementById("paypal-sdk")) {
        this.renderPayPalButtons();
        return;
      }

      // Assign a unique ID to the script element for easier referencing later,
      // particularly useful if you need to remove or reconfigure the PayPal SDK script dynamically.
      const script = document.createElement("script");
      script.id = "paypal-sdk";

      let paypalClientId = null;
      try {
        // getApi is products standard function for GET HTTP feature
        const response = await this.productsStore.getAPI("getpaypalclientid");
        paypalClientId = response.data; // Receiving data from API
      } catch (error) {
        alert("Could not load PayPal payment options. Please try again later.");
        return; // Stop execution if client ID can't be fetched
      }

      if (!paypalClientId) {
        // Fallback if error
        alert("Could not load PayPal payment options. Please try again later.");
        return;
      }

      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=EUR`; // Dynamic script URL
      script.onload = () => {
        // If script loaded, change dynamic state of inner state control variables
        this.paypalScriptLoaded = true;
        this.renderPayPalButtons();
      };
      script.onerror = (error) => {
        // Fallback if error
        alert("Could not load PayPal payment options. Please try again later.");
      };
      document.body.appendChild(script);
      // Appends the created script element to the <body> of the HTML document.
      // This makes the PayPal SDK script available and allows it to execute,
      // enabling PayPal functionalities on the page.
    },
    renderPayPalButtons() {
      if (!window.paypal || !this.$refs.paypalButtonContainer) {
        return;
      } // Fallback if error

      // Clear any existing PayPal buttons before rendering new ones
      while (this.$refs.paypalButtonContainer.firstChild) {
        this.$refs.paypalButtonContainer.removeChild(
          this.$refs.paypalButtonContainer.firstChild
        );
      }

      window.paypal
        .Buttons({
          // Buttons of PayPal config
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
              }); // Asking internal API to create order
              const orderData = response.data;
              if (orderData.id) {
                return orderData.id;
              } else {
                throw new Error("No order ID and DB id returned from backend.");
              }
            } catch (error) {
              alert("Could not create PayPal order. Please try again.");
              throw error;
            }
          },
          // If user approves transaction and no errors on backend
          onApprove: async (data, actions) => {
            try {
              const response = await axios.post(
                `/api/orders/${data.orderID}/capture`
              ); // Capturing created data from internal API
              const orderDetails = response.data;
              this.$emit("payment-success", orderDetails);
            } catch (error) {
              this.$emit("payment-error", error);
              alert("Could not complete PayPal payment. Please try again.");
            }
          }, // Fallbacks if user cancels or error
          onCancel: (data) => {
            this.$emit("payment-cancelled", data);
            alert("PayPal payment was cancelled.");
          },
          onError: (err) => {
            alert(
              "An error occurred with the PayPal payment. Please try again."
            );
          },
        })
        .render(this.$refs.paypalButtonContainer)
        .catch((error) => {
          alert("Failed to display PayPal buttons. Please check your console.");
        });
    },
  },
};
</script>
