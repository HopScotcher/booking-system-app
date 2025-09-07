export const SERVICES = [
  {
    id: "BASIC_CLEANING",
    name: "Basic Cleaning",
    description:
      "Standard cleaning: dusting, vacuuming, mopping, bathrooms, and kitchen surfaces.",
    duration: 2, // hours
    basePrice: 120,
  },
  {
    id: "DEEP_CLEANING",
    name: "Deep Cleaning",
    description:
      "Thorough deep clean: baseboards, inside appliances, detailed bathroom and kitchen.",
    duration: 4, // hours
    basePrice: 200,
  },
  {
    id: "MOVE_IN_OUT_CLEANING",
    name: "Move-in/Move-out Cleaning",
    description:
      "Comprehensive cleaning tailored for moving: cabinets, closets, appliances, and fixtures.",
    duration: 5, // hours
    basePrice: 260,
  },
] as const

export type ServiceConfig = typeof SERVICES[number]


