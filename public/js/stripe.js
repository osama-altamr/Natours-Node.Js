import axios from 'axios';
const stripe = Stripe(
  'pk_test_51Mx0P2DP18rLTwvkDmtith0mfeSdAaNPUHqtWtqbMmEQZzy61Durj2R9MzsKijyFgWapsxQizgNpStxbWNhCgIKb00Fgmc9VJN'
);
export const bookTour = async (tourId) => {
  // 1) Get checkout session from API
  const session = await axios(
    `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
  );
  cosnole.log(session);
  // 2) Create checkout form + charge credit card
};
