/**
 * Static seed data for the Sovereign Blade barbershop.
 * Replace with API calls once the backend endpoints exist.
 */

export interface Service {
  id: string;
  name: string;
  price: number;        // INR
  duration: number;     // minutes
  description: string;
  icon: string;         // emoji stand-in until custom SVGs are ready
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  currentQueue: number; // customers ahead
  avatarInitials: string;
}

export const SERVICES: Service[] = [
  {
    id: "s1",
    name: "Classic Haircut",
    price: 250,
    duration: 30,
    description: "Precision scissor cut with hot towel finish",
    icon: "✂️",
  },
  {
    id: "s2",
    name: "Royal Shave",
    price: 350,
    duration: 45,
    description: "Straight-razor shave with pre-shave oil & post balm",
    icon: "🪒",
  },
  {
    id: "s3",
    name: "Beard Trim & Shape",
    price: 200,
    duration: 20,
    description: "Expert sculpting and line-work for your beard",
    icon: "✦",
  },
  {
    id: "s4",
    name: "Hair & Beard Combo",
    price: 450,
    duration: 50,
    description: "Full haircut plus beard trim — the works",
    icon: "⚜️",
  },
  {
    id: "s5",
    name: "Head Massage",
    price: 150,
    duration: 15,
    description: "Traditional oil massage for relaxation",
    icon: "◈",
  },
  {
    id: "s6",
    name: "Hair Colour",
    price: 600,
    duration: 60,
    description: "Natural or fashion colour with conditioning treatment",
    icon: "✦",
  },
];

export const BARBERS: Barber[] = [
  {
    id: "b1",
    name: "Rajan Mehta",
    specialty: "Classic Cuts & Shaves",
    available: true,
    currentQueue: 2,
    avatarInitials: "RM",
  },
  {
    id: "b2",
    name: "Arjun Shah",
    specialty: "Modern Fades & Colour",
    available: true,
    currentQueue: 1,
    avatarInitials: "AS",
  },
  {
    id: "b3",
    name: "Dev Patel",
    specialty: "Beard Architecture",
    available: false,
    currentQueue: 0,
    avatarInitials: "DP",
  },
  {
    id: "b4",
    name: "Kiran Joshi",
    specialty: "Traditional Techniques",
    available: true,
    currentQueue: 3,
    avatarInitials: "KJ",
  },
];

export const OPENING_HOURS = [
  { day: "Monday – Friday", hours: "9:00 AM – 8:00 PM" },
  { day: "Saturday",        hours: "8:00 AM – 9:00 PM" },
  { day: "Sunday",          hours: "10:00 AM – 6:00 PM" },
];

/** Simulated live queue snapshot — replace with WebSocket/polling. */
export const QUEUE_SNAPSHOT = {
  waiting: 7,
  estimatedWaitMinutes: 35,
  nextAvailableIn: 12,
};
