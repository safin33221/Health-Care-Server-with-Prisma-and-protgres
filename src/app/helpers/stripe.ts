import Stripe from 'stripe';
import config from '../../config';


const stripe = new Stripe(config.strip.STRIPE_SECRET_KEY || '');

export default stripe;
