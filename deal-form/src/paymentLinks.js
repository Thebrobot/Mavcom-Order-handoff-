/**
 * Sales-facing Stripe checkout links + list prices.
 * Master source: Brobot ONE payment-link sheet (Voice, Connect, Growth,
 * and Growth + Agent Broski). Standalone Agent Broski monthly links are not offered here.
 */
/** Appended after dollar amounts (e.g. "/mo" for MRC). Set to "" if amounts are not per month. */
export const PAYMENT_PRICE_SUFFIX = "/mo";

function deviceTier(categoryId, categoryLabel, devices, priceUsd, stripePriceId, url) {
  const noun = devices === 1 ? "Device" : "Devices";
  return {
    id: `${categoryId}-${devices}`,
    shortLabel: `${devices} ${noun}`,
    label: `${categoryLabel} (${devices} ${noun})`,
    priceUsd,
    stripePriceId,
    url,
  };
}

function deviceCategory(id, label, rows) {
  return {
    id,
    label,
    links: rows.map(([devices, priceUsd, stripePriceId, url]) =>
      deviceTier(id, label, devices, priceUsd, stripePriceId, url),
    ),
  };
}

export const PAYMENT_LINK_CATEGORIES = [
  deviceCategory("one-voice", "Brobot One Voice", [
    [1, 152, "price_1THowjKLhcRydgv7LLPOeTLv", "https://buy.stripe.com/28E3cwdfm5ur9bZdQ36sw2m"],
    [2, 168, "price_1THuYGKLhcRydgv7Mdk4VmaF", "https://buy.stripe.com/fZu3cw6QY2if4VJh2f6sw2l"],
    [3, 183, "price_1THuYcKLhcRydgv7OY4eZLnd", "https://buy.stripe.com/aFa9AUcbie0X2NB5jx6sw2k"],
    [4, 199, "price_1THuYwKLhcRydgv7gdQrxJU0", "https://buy.stripe.com/7sY9AU2AI9KHgEr4ft6sw2j"],
    [5, 214, "price_1THuZHKLhcRydgv7pTVtuVjL", "https://buy.stripe.com/7sY9AUejqf510Fth2f6sw2A"],
    [6, 230, "price_1THuZYKLhcRydgv77muSXUNA", "https://buy.stripe.com/8x25kE6QY0a71Jx5jx6sw2i"],
    [7, 246, "price_1TI8FqKLhcRydgv76ABRikqC", "https://buy.stripe.com/7sY28s4IQ9KHgEr7rF6sw2s"],
    [8, 260, "price_1URFmSKLhcRydgv76ABRikqC", "https://buy.stripe.com/bJeeVecbicWT3RFcLZ6sw2z"],
    [9, 275, "price_1URFmVKLhcRydgv7WOUftuhz", "https://buy.stripe.com/7sY9AUejqf510Fth2f6sw2A"],
    [10, 291, "price_1URFmZKLhcRydgv757DSZFxk", "https://buy.stripe.com/8x2aEYa3af51ag3cLZ6sw2B"],
  ]),
  deviceCategory("one-connect", "Brobot One Connect", [
    [1, 172, "price_1URFn0KLhcRydgv7rkWEIBap", "https://buy.stripe.com/5kQ5kE3EM4qnag3eU76sw2C"],
    [2, 208, "price_1URFn2KLhcRydgv7jHD9vQL6", "https://buy.stripe.com/28E28s6QY9KH2NB13h6sw2D"],
    [3, 244, "price_1URFn5KLhcRydgv7TyhgMsF8", "https://buy.stripe.com/4gM9AU4IQf514VJ6nB6sw2E"],
    [4, 280, "price_1URFn8KLhcRydgv7oNWGkrqb", "https://buy.stripe.com/14A5kEfnu5urbk73bp6sw2F"],
    [5, 317, "price_1URFnBKLhcRydgv7kAScRPAL", "https://buy.stripe.com/5kQfZi2AI0a7fAn8vJ6sw2G"],
    [6, 353, "price_1URFnEKLhcRydgv72zxJmkdx", "https://buy.stripe.com/eVq28s1wEf51bk77rF6sw2H"],
    [7, 389, "price_1URFnGKLhcRydgv7sgzQqkoJ", "https://buy.stripe.com/6oU28sejqaOL9bZ6nB6sw2I"],
    [8, 426, "price_1URFnJKLhcRydgv7lDhNdtti", "https://buy.stripe.com/dRm7sM5MU6yv73Rh2f6sw2J"],
    [9, 462, "price_1URFnMKLhcRydgv76AEyyWeu", "https://buy.stripe.com/6oUcN63EMf519bZbHV6sw2K"],
    [10, 499, "price_1URFnPKLhcRydgv7a3HQnf1O", "https://buy.stripe.com/3cIeVe5MU8GDgErcLZ6sw2L"],
  ]),
  deviceCategory("one-growth", "Brobot One Growth", [
    [1, 345, "price_1URFnpKLhcRydgv7F18ZPKgY", "https://buy.stripe.com/00waEYfnu5ur87V9zN6sw2M"],
    [2, 382, "price_1URFnsKLhcRydgv72UwCXDhZ", "https://buy.stripe.com/4gM7sMa3a1ebgEr13h6sw2N"],
    [3, 420, "price_1URFnvKLhcRydgv7xxCSC1f9", "https://buy.stripe.com/bJe00k7V22ifag3eU76sw2O"],
    [4, 457, "price_1URFnxKLhcRydgv7vuwMVlxl", "https://buy.stripe.com/14AbJ27V23mj0Ft8vJ6sw2P"],
    [5, 491, "price_1URFo0KLhcRydgv7kAIGDanf", "https://buy.stripe.com/fZufZi2AIcWT0Ft7rF6sw2Q"],
    [6, 528, "price_1URFo3KLhcRydgv7KFVPzYLx", "https://buy.stripe.com/5kQ00k1wE8GD0Ft3bp6sw2R"],
    [7, 565, "price_1URFo5KLhcRydgv7ZGFIZ8SY", "https://buy.stripe.com/14A3cw0sA9KH9bZ5jx6sw2S"],
    [8, 601, "price_1URFo8KLhcRydgv7ZkFqoGBk", "https://buy.stripe.com/eVqdRa5MUg952NB5jx6sw2T"],
    [9, 638, "price_1URFoBKLhcRydgv73znCHRPE", "https://buy.stripe.com/dRm5kE8Z6e0X0Ft3bp6sw2U"],
    [10, 674, "price_1URFoEKLhcRydgv7TqsAURFZ", "https://buy.stripe.com/4gMeVeejq8GD0Ft5jx6sw2V"],
  ]),
  deviceCategory("growth-ai-receptionist", "Brobot One Growth + AI Receptionist", [
    [1, 862, "price_1URGJOKLhcRydgv7nLArVWw3", "https://buy.stripe.com/4gMeVe2AI3mjag38vJ6sw2Y"],
    [2, 899, "price_1URGJRKLhcRydgv7yyforgA6", "https://buy.stripe.com/28EfZi5MU2if2NBaDR6sw2Z"],
    [3, 935, "price_1URGJUKLhcRydgv7CK5I08bL", "https://buy.stripe.com/5kQ8wQa3acWT5ZN7rF6sw30"],
    [4, 971, "price_1URGJXKLhcRydgv76yAgX75J", "https://buy.stripe.com/dRm14o6QY9KHewj6nB6sw31"],
    [5, 1008, "price_1URGJZKLhcRydgv7vqV8URjX", "https://buy.stripe.com/00w6oI3EM2if5ZN9zN6sw32"],
    [6, 1044, "price_1URGJcKLhcRydgv72HJm9By4", "https://buy.stripe.com/6oUbJ20sA4qnag3h2f6sw33"],
  ]),
  deviceCategory("growth-ai-voice-sms", "Brobot One Growth + AI Growth (Voice + SMS)", [
    [1, 1070, "price_1URGJgKLhcRydgv7FOYm3LOo", "https://buy.stripe.com/fZu14o0sA0a7gEr3bp6sw34"],
    [2, 1107, "price_1URGJjKLhcRydgv7IZzHa5eJ", "https://buy.stripe.com/cNibJ2a3aaOL9bZ6nB6sw35"],
    [3, 1143, "price_1URGJmKLhcRydgv7S7F4UgFq", "https://buy.stripe.com/00w7sM3EM7Cz2NBbHV6sw36"],
    [4, 1180, "price_1URGJpKLhcRydgv7lvBNY9PL", "https://buy.stripe.com/5kQ28sa3a0a7fAn7rF6sw37"],
    [5, 1216, "price_1URGJsKLhcRydgv7NhXhYTfL", "https://buy.stripe.com/aFa00k1wEf510FteU76sw38"],
    [6, 1252, "price_1URGJvKLhcRydgv7Azle0ZW0", "https://buy.stripe.com/eVq4gA6QY0a74VJ8vJ6sw39"],
  ]),
];
