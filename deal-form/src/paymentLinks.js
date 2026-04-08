/**
 * Sales-facing Stripe checkout links + list prices.
 * Keep each priceUsd in sync with your Stripe product / internal price sheet.
 */
/** Appended after dollar amounts (e.g. "/mo" for MRC). Set to "" if amounts are not per month. */
export const PAYMENT_PRICE_SUFFIX = "/mo";

export const PAYMENT_LINK_CATEGORIES = [
  {
    id: "one-basic-devices",
    label: "Brobot One Basic",
    links: [
      {
        id: "basic-dev-1",
        shortLabel: "1 Device",
        label: "Brobot One Basic (1 Device)",
        priceUsd: 152,
        url: "https://buy.stripe.com/4gM6ol8Z6g9587V5jx6sw2h",
      },
      {
        id: "basic-dev-2",
        shortLabel: "2 Devices",
        label: "Brobot One Basic (2 Devices)",
        priceUsd: 168,
        url: "https://buy.stripe.com/8x25kE6QY0a71Jx5jx6sw2i",
      },
      {
        id: "basic-dev-3",
        shortLabel: "3 Devices",
        label: "Brobot One Basic (3 Devices)",
        priceUsd: 183,
        url: "https://buy.stripe.com/7sY9AU2AI9KHgEr4ft6sw2j",
      },
      {
        id: "basic-dev-4",
        shortLabel: "4 Devices",
        label: "Brobot One Basic (4 Devices)",
        priceUsd: 199,
        url: "https://buy.stripe.com/aFa9AUcbie0X2NB5jx6sw2k",
      },
      {
        id: "basic-dev-5",
        shortLabel: "5 Devices",
        label: "Brobot One Basic (5 Devices)",
        priceUsd: 214,
        url: "https://buy.stripe.com/fZu3cw6QY2if4VJh2f6sw2l",
      },
      {
        id: "basic-dev-6",
        shortLabel: "6 Devices",
        label: "Brobot One Basic (6 Devices)",
        priceUsd: 230,
        url: "https://buy.stripe.com/28E3cwdfm5ur9bZdQ36sw2m",
      },
      {
        id: "basic-dev-7",
        shortLabel: "7 Devices",
        label: "Brobot One Basic (7 Devices)",
        priceUsd: 246,
        url: "https://buy.stripe.com/7sY28s4IQ9KHgEr7rf6sw2s",
      },
    ],
  },
  {
    id: "one-core-devices",
    label: "Brobot One Core",
    links: [
      {
        id: "core-dev-1",
        shortLabel: "1 Device",
        label: "Brobot One Core (1 Device)",
        priceUsd: 335,
        url: "https://buy.stripe.com/fZu4gAcbi5ur87VaDR6sw2n",
      },
      {
        id: "core-dev-2",
        shortLabel: "2 Devices",
        label: "Brobot One Core (2 Devices)",
        priceUsd: 361,
        url: "https://buy.stripe.com/fZu8wQ8Z67CzfAn13h6sw2t",
      },
      {
        id: "core-dev-3",
        shortLabel: "3 Devices",
        label: "Brobot One Core (3 Devices)",
        priceUsd: 387,
        url: "https://buy.stripe.com/eVq8wQ3EMg951JxaDR6sw2o",
      },
      {
        id: "core-dev-4",
        shortLabel: "4 Devices",
        label: "Brobot One Core (4 Devices)",
        priceUsd: 413,
        url: "https://buy.stripe.com/9B614o1wEe0X5ZN6nB6sw2p",
      },
      {
        id: "core-dev-5",
        shortLabel: "5 Devices",
        label: "Brobot One Core (5 Devices)",
        priceUsd: 439,
        url: "https://buy.stripe.com/4gM6ola3a2ifdsf3bp6sw2q",
      },
      {
        id: "core-dev-6",
        shortLabel: "6 Devices",
        label: "Brobot One Core (6 Devices)",
        priceUsd: 465,
        url: "https://buy.stripe.com/5kQaEYB7e5ur4VJ9zN6sw2r",
      },
    ],
  },
  {
    id: "one-core-broski-aire",
    label: "Agent Broski (Ai Receptionist)",
    links: [
      {
        id: "aire-1",
        shortLabel: "1 Device",
        label: "Agent Broski (Ai Receptionist) (1 Device)",
        priceUsd: 852,
        url: "https://buy.stripe.com/8x23cw1wEe0X3RF7rF6sw2b",
      },
      {
        id: "aire-2",
        shortLabel: "2 Devices",
        label: "Agent Broski (Ai Receptionist) (2 Devices)",
        priceUsd: 878,
        url: "https://buy.stripe.com/5kQfZi5MUg953RF3bp6sw2c",
      },
      {
        id: "aire-3",
        shortLabel: "3 Devices",
        label: "Agent Broski (Ai Receptionist) (3 Devices)",
        priceUsd: 904,
        url: "https://buy.stripe.com/28EcN68Z64qn5ZNFYb6sw2d",
      },
      {
        id: "aire-4",
        shortLabel: "4 Devices",
        label: "Agent Broski (Ai Receptionist) (4 Devices)",
        priceUsd: 930,
        url: "https://buy.stripe.com/bJefZi2AI8GD3RF13h6sw2e",
      },
      {
        id: "aire-5",
        shortLabel: "5 Devices",
        label: "Agent Broski (Ai Receptionist) (5 Devices)",
        priceUsd: 956,
        url: "https://buy.stripe.com/fZufZifnubSPag3eU76sw2f",
      },
      {
        id: "aire-6",
        shortLabel: "6 Devices",
        label: "Agent Broski (Ai Receptionist) (6 Devices)",
        priceUsd: 982,
        url: "https://buy.stripe.com/7sY9AUa3a9KH0ftaDR6sw2g",
      },
    ],
  },
  {
    id: "one-core-broski",
    label: "Agent Broski (Ai Voice + SMS)",
    links: [
      {
        id: "broski-1",
        shortLabel: "1 Device",
        label: "Agent Broski (Ai Voice + SMS) (1 Device)",
        priceUsd: 1042,
        url: "https://buy.stripe.com/dRmbJ25MU4qn0fth2f6sw25",
      },
      {
        id: "broski-2",
        shortLabel: "2 Devices",
        label: "Agent Broski (Ai Voice + SMS) (2 Devices)",
        priceUsd: 1068,
        url: "https://buy.stripe.com/7sYcN65MU0a71Jx27l6sw26",
      },
      {
        id: "broski-3",
        shortLabel: "3 Devices",
        label: "Agent Broski (Ai Voice + SMS) (3 Devices)",
        priceUsd: 1094,
        url: "https://buy.stripe.com/aFa00k8Z62iffAn27l6sw27",
      },
      {
        id: "broski-4",
        shortLabel: "4 Devices",
        label: "Agent Broski (Ai Voice + SMS) (4 Devices)",
        priceUsd: 1120,
        url: "https://buy.stripe.com/bJefZi1wE0a7cobh2f6sw28",
      },
      {
        id: "broski-5",
        shortLabel: "5 Devices",
        label: "Agent Broski (Ai Voice + SMS) (5 Devices)",
        priceUsd: 1146,
        url: "https://buy.stripe.com/28EdRadfmcWTgEr3bp6sw29",
      },
      {
        id: "broski-6",
        shortLabel: "6 Devices",
        label: "Agent Broski (Ai Voice + SMS) (6 Devices)",
        priceUsd: 1172,
        url: "https://buy.stripe.com/00w00k1wEe0XewjdQ36sw2a",
      },
    ],
  },
];
