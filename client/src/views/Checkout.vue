<script setup>
import CartProduct from "@/components/CartProduct.vue";
import Navigation from "@/components/Navigation.vue";
import PayPalButton from "@/components/PayPalButton.vue";
import router from "@/router/router";
import { useCart } from "@/stores/cart";
import IntlTelInput from "intl-tel-input/vueWithUtils";
import "intl-tel-input/styles";
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import * as yup from "yup";
import validator from "validator";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { useProductsList } from "@/stores/products";

countries.registerLocale(enLocale);

const productsList = useProductsList();
const cart = useCart();
const itemNames = [];
cart.getCart().forEach((item) => {
  // Analyzing cart and putting all names in itemNames for PayPal API
  itemNames.push(item.name);
});

const delivery = ref(""); // Delivery method ref for frontend form
const shippingData = ref({
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  phoneNumber: "",
  email: "",
  notes: "",
  deliveryMethod: delivery.value || "",
  orderNumber: null, // This will be set after payment
});

const phoneNumberValid = ref(null);
const phoneNumberErrorCode = ref(null);
const phoneNumberNotice = ref(null);
const validationErrors = ref({});
const formValidated = ref(false);
const feedback = ref(""); // Data to check for validation or feedback that this validation returns

// Update handleSubmit to provide user feedback
const handleSubmit = async () => {
  validationErrors.value = {};
  phoneNumberNotice.value = null;
  formValidated.value = false;

  try {
    // Validate shippingData using yup schema
    await checkoutSchema.validate(shippingData.value, { abortEarly: false });

    // Phone number validity (from IntlTelInput)
    // Fix: phoneNumberValid can be null/undefined, so check for strict true
    if (phoneNumberValid.value !== true) {
      validationErrors.value.phoneNumber = "Invalid phone number";
      phoneNumberNotice.value = "Error: Invalid phone number";
      feedback.value = "Please correct the errors in the form.";
      return;
    }
    phoneNumberNotice.value = "Valid number";
    formValidated.value = true;
    feedback.value = "Form validated successfully! You can proceed to payment.";
    // Optionally, trigger payment or next step here
  } catch (err) {
    if (err.inner) {
      err.inner.forEach((e) => {
        validationErrors.value[e.path] = e.message;
      });
    } else if (err.path) {
      validationErrors.value[err.path] = err.message;
    }
    feedback.value = "Please correct the errors in the form.";
  }
};

const deliveryMethods = ["Inpost", "Poczta Polska"];
const deliveryFees = {
  Inpost: 5,
  "Poczta Polska": 3,
};

const calculateTotal = computed(() => {
  if (delivery.value != "") {
    return cart.total + deliveryFees[delivery.value];
  } else {
    return cart.total;
  }
});

function handlePaymentSuccess(details) {
  paymentStatus = `Payment successful! Order ID: ${details.id}`;
  paymentStatusClass = "success";
  cart.clearCart();
  console.log(details.captureDetails.id);
  router.push(`/success/${details.captureDetails.id}`); // Sends to SuccessPage
  shippingData.value.orderNumber = details.captureDetails.id;
  shippingData.value.deliveryMethod = delivery.value;
  productsList.postShippingData(shippingData.value);
}

function handlePaymentError() {
  paymentStatus = "Payment failed. Please try again.";
  paymentStatusClass = "error";
}

function handlePaymentCancelled() {
  paymentStatus = "Payment cancelled by user.";
  paymentStatusClass = "cancelled";
}

// Prepare country list for dropdown. Doesn't work??? FIX
const countryNames = countries.getNames("en");
const countryOptions = Object.entries(countryNames).map(([code, name]) => ({
  code,
  name,
}));

// Checks using yup and validates form
const checkoutSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  address: yup
    .string()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters"),
  city: yup
    .string()
    .required("City is required")
    .min(2, "City must be at least 2 characters"),
  postalCode: yup
    .string()
    .required("Postal code is required")
    .test("is-postal-code", "Invalid postal code", function (value) {
      let countryInput = this.parent.country || "any";
      // Try to get ISO code from country name
      let countryCode = countryInput;
      if (countryInput.length > 2) {
        // Try to map name to code
        const found = Object.entries(countries.getNames("en")).find(
          ([code, name]) => name.toLowerCase() === countryInput.toLowerCase()
        );
        if (found) countryCode = found[0];
      }
      return validator.isPostalCode(value || "", countryCode);
    }),
  country: yup
    .string()
    .required("Country is required")
    .test("is-country", "Invalid country", (value) => {
      if (!value) return false;
      const val = value.trim().toLowerCase();
      const countryNamesEn = Object.values(countries.getNames("en")).map((n) =>
        n.toLowerCase()
      );
      return countryNamesEn.includes(val);
    }),
  phoneNumber: yup.string().required("Phone number is required"),
  email: yup.string().required("Email is required").email("Invalid email"),
  notes: yup.string().max(500, "Notes must be at most 500 characters"),
});

// Helper to get flag emoji from country code
function getFlagEmoji(countryCode) {
  if (
    !countryCode ||
    typeof countryCode !== "string" ||
    countryCode.length !== 2
  )
    return "";
  const code = countryCode.toUpperCase();
  // Only allow A-Z
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    code.charCodeAt(0) + 127397,
    code.charCodeAt(1) + 127397
  );
}

// Autocomplete state for country
const countryInput = ref("");
const countryDropdownOpen = ref(false);
const countryAutocompleteRef = ref(null); // ref for the autocomplete container
const filteredCountries = computed(() => {
  if (!countryInput.value) return countryOptions;
  return countryOptions.filter((option) =>
    option.name.toLowerCase().includes(countryInput.value.toLowerCase())
  );
});

// When user selects a country from dropdown
function selectCountry(option) {
  shippingData.value.country = option.name;
  countryInput.value = option.name;
  countryDropdownOpen.value = false;
}

// Watch for changes to keep input in sync with model
watch(
  () => shippingData.value.country,
  (val) => {
    countryInput.value = val;
  }
);

// Click outside handler to close dropdown
function handleClickOutside(event) {
  if (
    countryAutocompleteRef.value &&
    !countryAutocompleteRef.value.contains(event.target)
  ) {
    countryDropdownOpen.value = false;
  }
}

// Event listener for mousedown, mounting and unmouting it. It is for clicking outside of country selection dropbox.
onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});
</script>

<template>
  <Navigation />
  <div class="justify-center flex h-screen">
    <div class="flex flex-col gap-4 mt-12">
      <CartProduct
        v-for="item in cart.cart"
        :key="item.id || item.name"
        :product="item"
        class="border rounded-md w-lg"
      />
      <div>
        <label for="myDropdown" class="pr-1 text-2xl font-semibold">
          Select an option:
        </label>
        <select id="myDropdown" v-model="delivery">
          <option disabled value="">Please select one</option>
          <option
            v-for="option in deliveryMethods"
            :key="option"
            class="text-lg"
          >
            {{ option }}
          </option>
        </select>
        <p class="text-xl font-thin">Your delivery method: {{ delivery }}</p>
      </div>
      <div v-if="delivery != ''">
        <!-- Doesn't appear until delivery method changed. Also novalidate is for html to not validate with standard functions of code. -->
        <form
          class="flex flex-col gap-2"
          @submit.prevent="handleSubmit"
          novalidate
        >
          <!-- Name fields -->
          <div class="flex gap-2">
            <input
              type="text"
              placeholder="First name"
              class="border-1 rounded-md p-2"
              v-model="shippingData.firstName"
            />
            <input
              type="text"
              placeholder="Last name"
              class="border-1 rounded-md p-2"
              v-model="shippingData.lastName"
            />
          </div>
          <span v-if="validationErrors.firstName" style="color: red">
            {{ validationErrors.firstName }}
          </span>
          <span v-if="validationErrors.lastName" style="color: red">
            {{ validationErrors.lastName }}
          </span>

          <!-- Address -->
          <input
            type="text"
            placeholder="Address"
            class="border-1 rounded-md p-2"
            v-model="shippingData.address"
          />
          <span v-if="validationErrors.address" style="color: red">
            {{ validationErrors.address }}
          </span>

          <!-- City & Postal Code -->
          <div class="flex gap-2">
            <input
              type="text"
              placeholder="City"
              class="border-1 rounded-md p-2"
              v-model="shippingData.city"
            />
            <input
              type="text"
              placeholder="Postal Code"
              class="border-1 rounded-md p-2"
              v-model="shippingData.postalCode"
            />
          </div>
          <span v-if="validationErrors.city" style="color: red">
            {{ validationErrors.city }}
          </span>
          <span v-if="validationErrors.postalCode" style="color: red">
            {{ validationErrors.postalCode }}
          </span>

          <!-- Country autocomplete -->
          <label for="countryInput" class="font-semibold">Country:</label>
          <div style="position: relative" ref="countryAutocompleteRef">
            <input
              id="countryInput"
              class="border-1 rounded-md p-2 w-full"
              v-model="countryInput"
              @focus="countryDropdownOpen = true"
              @input="
                countryDropdownOpen = true;
                shippingData.country = countryInput;
              "
              autocomplete="off"
              placeholder="Type to search country"
            />
            <ul
              v-show="countryDropdownOpen && filteredCountries.length"
              class="absolute z-10 bg-white border rounded-md w-full max-h-60 overflow-auto shadow"
              style="list-style: none; padding: 0; margin: 0"
            >
              <li
                v-for="option in filteredCountries"
                :key="option.code"
                @mousedown.prevent="selectCountry(option)"
                class="flex items-center px-2 py-1 hover:bg-blue-100 cursor-pointer"
              >
                <span class="flag-emoji">{{ getFlagEmoji(option.code) }}</span>
                <span>{{ option.name }}</span>
              </li>
            </ul>
          </div>
          <span v-if="validationErrors.country" style="color: red">
            {{ validationErrors.country }}
          </span>

          <!-- Email -->
          <input
            type="email"
            placeholder="Email"
            class="border-1 rounded-md p-2"
            v-model="shippingData.email"
          />
          <span v-if="validationErrors.email" style="color: red">
            {{ validationErrors.email }}
          </span>

          <!-- Phone number -->
          <div>
            <IntlTelInput
              class="w-full border-1 rounded-md p-2 font-mono text-md"
              v-model="shippingData.phoneNumber"
              @changeNumber="shippingData.phoneNumber = $event"
              @changeValidity="phoneNumberValid = $event"
              @changephoneNumberErrorCode="phoneNumberErrorCode = $event"
              :options="{ initialCountry: 'gb' }"
            />
            <div v-if="validationErrors.phoneNumber" style="color: red">
              {{ validationErrors.phoneNumber }}
            </div>
          </div>

          <!-- Notes -->
          <textarea
            placeholder="Notes (optional)"
            class="border-1 rounded-md p-2"
            v-model="shippingData.notes"
            rows="2"
          ></textarea>
          <span v-if="validationErrors.notes" style="color: red">
            {{ validationErrors.notes }}
          </span>

          <!-- Feedback and submit -->
          <button
            type="submit"
            class="bg-blue-500 text-white rounded-md px-4 py-2 mt-2 self-start"
          >
            Validate
          </button>
          <div
            v-if="feedback"
            :class="formValidated ? 'text-green-600' : 'text-red-600'"
            class="mt-2"
          >
            {{ feedback }}
          </div>
        </form>
      </div>
      <span class="text-2xl font-semibold mt-4">
        TOTAL: <span class="font-normal">{{ calculateTotal }}$ </span>
      </span>
      <p class="text-xl font-normal">
        Delivery fee: {{ deliveryFees[delivery] }}
        <span>{{ delivery != "" ? "$" : "" }}</span>
      </p>
      <PayPalButton
        v-if="delivery != '' && formValidated"
        class="mt-4"
        :product-name="JSON.stringify(itemNames)"
        :product-price="parseFloat(calculateTotal)"
        :delivery-fee="deliveryFees[delivery]"
        @payment-success="handlePaymentSuccess"
        @payment-error="handlePaymentError"
        @payment-cancelled="handlePaymentCancelled"
      />
    </div>
  </div>
</template>

<style>
.iti {
  /* This is important for the input and flag container */
  width: 100%;
}

/* Add this for flag emoji compatibility */
.flag-emoji {
  font-family:
    "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji",
    "Twemoji Mozilla", "Android Emoji", "EmojiSymbols", sans-serif;
  font-size: 1.2em;
  margin-right: 8px;
  vertical-align: middle;
}
</style>
