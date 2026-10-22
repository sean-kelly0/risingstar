import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import nicosiaRoadProperty from "./imports/nicosia-road-property.jpg";
import stokeNewingtonProperty from "./imports/1100xxs.webp";

type Screen =
  | "home"
  | "housemates"
  | "chat"
  | "recommendations"
  | "area"
  | "rooms"
  | "questions"
  | "adjust"
  | "accessibility";

type ChatMessage = {
  from: "you" | "guide";
  text: string;
  options?: string[];
  listingIds?: string[];
  profileNames?: string[];
  review?: boolean;
};
type Listing = {
  id: string;
  area: string;
  title: string;
  place: string;
  price: string;
  image: string;
  description: string;
  listingType: "Rent" | "Buy";
  homeType: "Room" | "Shared home" | "Entire home";
  propertyType: "Room" | "Flat" | "House";
  bedrooms: number;
  roomType?: "Single" | "Double";
  tags: string[];
  housemates?: string;
};

type SearchStage = "welcome" | "goal" | "budget" | "commute" | "lifestyle" | "housing" | "roommates" | "review";
type SearchGoal = "Rent a room" | "Rent a flat" | "Rent a house" | "Buy a flat" | "Buy a house";
type SearchAnswers = {
  goal: SearchGoal | "";
  budget: string;
  commute: string;
  lifestyle: string;
  housing: string;
  roommates: string;
};
type HousemateProfile = {
  id: string;
  name: string;
  age: number;
  job: string;
  area: string;
  budget: number;
  moveIn: string;
  bio: string;
  tags: string[];
  avatar: string;
  photo: string;
  colors: [string, string];
};
type HousemateTab = "Home" | "Housemates" | "Homie Chat" | "Coming Soon";
type HousematePanel = "deck" | "matches" | "chat";
type SwipeSnapshot = {
  index: number;
  missesSinceMatch: number;
  totalLikes: number;
  matches: HousemateProfile[];
};
type SwipeDirection = "left" | "right";

const areas = [
  {
    name: "Leyton",
    image: "/images/leyton-home.jpg",
    note: "Creative, connected and still down to earth.",
    price: "Sample rooms from £895 pcm",
    tags: ["Green space", "Easy commute", "Local cafés", "Garden", "Good value"],
    commuteScores: { "Central London": 3, "City / Canary Wharf": 2, "Mostly remote / flexible": 2 },
    overview: "Independent places, quick connections and streets that feel familiar sooner than you’d expect.",
    feel: "Morning coffee, market Saturdays and neighbours who say hello. It has energy without feeling rushed.",
    everyday: "Francis Road brings together independent cafés, useful shops and neighbourhood events.",
    gettingAround: "The Central line makes journeys across London straightforward, while home still feels separate from it.",
    goodToKnow: "Busy around Francis Road at the weekend, with peaceful side streets nearby.",
  },
  {
    name: "Walthamstow",
    image: nicosiaRoadProperty,
    note: "Neighbourly, lively and full of green space.",
    price: "Sample rooms from £825 pcm",
    tags: ["Green space", "Good value", "Community", "Easy commute", "Local cafés", "Garden"],
    commuteScores: { "Central London": 2, "City / Canary Wharf": 2, "Mostly remote / flexible": 2 },
    overview: "A neighbourly feel, generous green space and a lively local high street.",
    feel: "Neighbourly and lively, with parks nearby when you need a slower afternoon.",
    everyday: "Markets, parks and independent shops make it easy to find a local routine.",
    gettingAround: "The Victoria line connects Walthamstow Central with central London.",
    goodToKnow: "Walthamstow has a strong community feel and plenty of outdoor space.",
  },
  {
    name: "Stoke Newington",
    image: stokeNewingtonProperty,
    note: "Leafy streets, good food and a slower rhythm.",
    price: "Sample rooms from £950 pcm",
    tags: ["Green space", "Local cafés", "Character", "Easy commute"],
    commuteScores: { "Central London": 1, "City / Canary Wharf": 3, "Mostly remote / flexible": 2 },
    overview: "Leafy streets, independent cafés and a slower rhythm in a characterful part of north London.",
    feel: "Leafy residential streets offer a calmer pace, with independent places close by.",
    everyday: "Local cafés, shops and green spaces give the area an easy neighbourhood pace.",
    gettingAround: "Overground and bus routes connect the neighbourhood to the wider city.",
    goodToKnow: "The quieter residential streets sit close to a lively local high street.",
  },
];

const listingDrafts: Omit<Listing, "propertyType" | "bedrooms" | "roomType" | "tags">[] = [
  {
    id: "leyton-house",
    area: "Leyton",
    title: "Bright double room",
    place: "Leyton · 4 bedroom house",
    price: "£895 pcm",
    image: "/images/properties/leyton-bright-double.jpg",
    description: "A calm, light-filled room in a friendly shared home near Francis Road.",
    listingType: "Rent",
    homeType: "Room",
    housemates: "A friendly household who enjoy cooking together and having their own downtime.",
  },
  {
    id: "leyton-flat",
    area: "Leyton",
    title: "Quiet single room overlooking the garden",
    place: "Leyton · 3 bedroom flat",
    price: "£875 pcm",
    image: "/images/properties/leyton-garden-room.jpg",
    description: "A bright single room overlooking the garden, with bills included.",
    listingType: "Rent",
    homeType: "Room",
    housemates: "Two considerate housemates, shared garden and relaxed weeknight energy.",
  },
  {
    id: "walthamstow-house",
    area: "Walthamstow",
    title: "Victorian double room near the market",
    place: "Walthamstow · 3 bedroom shared house",
    price: "£825 pcm",
    image: "/images/properties/walthamstow-victorian-room.jpg",
    description: "A characterful shared home close to local shops, cafés and transport.",
    listingType: "Rent",
    homeType: "Room",
    housemates: "Two social, easy-going housemates who like market trips and a tidy kitchen.",
  },
  {
    id: "stoke-newington-flat",
    area: "Stoke Newington",
    title: "Leafy street shared home",
    place: "Stoke Newington · 4 bedroom shared house",
    price: "£950 pcm",
    image: "/images/properties/stoke-shared-house.jpg",
    description: "A bright shared home on a residential street, a short walk from local cafés.",
    listingType: "Rent",
    homeType: "Room",
    housemates: "Three friendly housemates who love good food, local walks and a calm home.",
  },
  {
    id: "leyton-maisonette-rent",
    area: "Leyton",
    title: "Two-bed Victorian maisonette",
    place: "Leyton · 2 bedroom entire home",
    price: "£1,850 pcm",
    image: "/images/properties/leyton-maisonette.jpg",
    description: "A bright, characterful home with a separate living room and easy Central line connections.",
    listingType: "Rent",
    homeType: "Entire home",
  },
  {
    id: "walthamstow-room",
    area: "Walthamstow",
    title: "Sunny room in a friendly terrace",
    place: "Walthamstow · 4 bedroom shared house",
    price: "£975 pcm",
    image: "/images/properties/walthamstow-sunny-room.jpg",
    description: "A comfortable double room close to the market, with a shared garden and spacious kitchen.",
    listingType: "Rent",
    homeType: "Room",
    housemates: "Three warm, sociable housemates who enjoy a shared dinner now and then.",
  },
  {
    id: "stoke-flat-rent",
    area: "Stoke Newington",
    title: "Bright two-bed garden flat",
    place: "Stoke Newington · 2 bedroom entire home",
    price: "£2,250 pcm",
    image: "/images/properties/stoke-garden-flat.jpg",
    description: "A calm, well-connected home with a private garden and independent cafés nearby.",
    listingType: "Rent",
    homeType: "Entire home",
  },
  {
    id: "leyton-flat-buy",
    area: "Leyton",
    title: "Modern two-bed Leyton flat",
    place: "Leyton · 2 bedroom flat",
    price: "£425,000",
    image: "/images/properties/leyton-flat-buy.jpg",
    description: "A sample first-home option with a bright open-plan living space and local shops close by.",
    listingType: "Buy",
    homeType: "Entire home",
  },
  {
    id: "walthamstow-terrace-buy",
    area: "Walthamstow",
    title: "Three-bed Walthamstow terrace",
    place: "Walthamstow · 3 bedroom house",
    price: "£595,000",
    image: "/images/properties/walthamstow-terrace.jpg",
    description: "A sample family-sized terrace with room to grow and green space within easy reach.",
    listingType: "Buy",
    homeType: "Entire home",
  },
  {
    id: "stoke-maisonette-buy",
    area: "Stoke Newington",
    title: "Character two-bed maisonette",
    place: "Stoke Newington · 2 bedroom maisonette",
    price: "£575,000",
    image: "/images/properties/stoke-maisonette.jpg",
    description: "A sample period home near local cafés and neighbourhood green spaces.",
    listingType: "Buy",
    homeType: "Entire home",
  },
  {
    id: "leyton-garden-house-rent",
    area: "Leyton",
    title: "Garden room in a friendly terrace",
    place: "Leyton · 3 bedroom shared house",
    price: "£1,050 pcm",
    image: "/images/properties/leyton-garden-house.jpg",
    description: "A relaxed double room in a shared terrace with a sunny garden and an open-plan kitchen.",
    listingType: "Rent",
    homeType: "Room",
    housemates: "Two sociable housemates who enjoy a shared meal and respect quiet evenings.",
  },
  {
    id: "walthamstow-loft-rent",
    area: "Walthamstow",
    title: "Bright two-bed loft apartment",
    place: "Walthamstow · 2 bedroom flat",
    price: "£2,100 pcm",
    image: "/images/properties/walthamstow-loft.jpg",
    description: "A spacious, light-filled flat with an open living area and easy access to the market.",
    listingType: "Rent",
    homeType: "Entire home",
  },
  {
    id: "stoke-newington-room-rent",
    area: "Stoke Newington",
    title: "Calm double room near Church Street",
    place: "Stoke Newington · 3 bedroom shared house",
    price: "£1,025 pcm",
    image: "/images/properties/stoke-newington-room.jpg",
    description: "A comfortable room in a shared home, close to independent shops and local bus routes.",
    listingType: "Rent",
    homeType: "Room",
    housemates: "Two friendly housemates who like a tidy kitchen and low-key weekends.",
  },
  {
    id: "leyton-victorian-terrace-buy",
    area: "Leyton",
    title: "Three-bed Victorian terrace",
    place: "Leyton · 3 bedroom house",
    price: "£535,000",
    image: "/images/properties/leyton-victorian-terrace.jpg",
    description: "A sample period home with generous living space and a private rear garden.",
    listingType: "Buy",
    homeType: "Entire home",
  },
  {
    id: "walthamstow-flat-buy",
    area: "Walthamstow",
    title: "Two-bed garden apartment",
    place: "Walthamstow · 2 bedroom flat",
    price: "£390,000",
    image: "/images/properties/walthamstow-flat-buy.jpg",
    description: "A sample first-home option with bright interiors and a private outdoor space.",
    listingType: "Buy",
    homeType: "Entire home",
  },
  {
    id: "stoke-newington-flat-buy",
    area: "Stoke Newington",
    title: "One-bed character flat",
    place: "Stoke Newington · 1 bedroom flat",
    price: "£465,000",
    image: "/images/properties/stoke-newington-flat-buy.jpg",
    description: "A sample period flat with a separate living room close to the neighbourhood high street.",
    listingType: "Buy",
    homeType: "Entire home",
  },
  {
    id: "walthamstow-whole-house-rent",
    area: "Walthamstow",
    title: "Three-bed family home near the park",
    place: "Walthamstow · 3 bedroom house",
    price: "£2,450 pcm",
    image: "/images/properties/walthamstow-rental-house.jpg",
    description: "A spacious sample rental with a private garden, generous living room and green space nearby.",
    listingType: "Rent",
    homeType: "Entire home",
  },
  {
    id: "leyton-whole-house-rent",
    area: "Leyton",
    title: "Bright four-bed Leyton terrace",
    place: "Leyton · 4 bedroom house",
    price: "£3,100 pcm",
    image: "/images/properties/leyton-family-rental-house.jpg",
    description: "A roomy terrace with a garden and straightforward Central line connections.",
    listingType: "Rent",
    homeType: "Entire home",
  },
];

const listingTagsById: Record<string, string[]> = {
  "leyton-house": ["Green space", "Easy commute", "Local cafés", "Shared dinners", "Friendly & independent", "Pet-friendly", "Work-from-home friendly"],
  "leyton-flat": ["Green space", "Garden", "Easy commute", "Quiet, tidy household", "Pet-friendly"],
  "walthamstow-house": ["Easy commute", "Local cafés", "Shared dinners", "Friendly & independent", "Work-from-home friendly"],
  "stoke-newington-flat": ["Green space", "Local cafés", "Easy commute", "Quiet, tidy household", "Friendly & independent"],
  "leyton-maisonette-rent": ["Green space", "Easy commute", "Local cafés", "Garden", "Good value"],
  "walthamstow-room": ["Green space", "Garden", "Easy commute", "Shared dinners", "Pet-friendly"],
  "stoke-flat-rent": ["Green space", "Local cafés", "Easy commute", "Garden"],
  "leyton-flat-buy": ["Easy commute", "Local cafés", "Good value"],
  "walthamstow-terrace-buy": ["Green space", "Easy commute", "Garden", "Good value"],
  "stoke-maisonette-buy": ["Green space", "Local cafés", "Easy commute"],
  "leyton-garden-house-rent": ["Green space", "Easy commute", "Garden", "Shared dinners", "Quiet, tidy household"],
  "walthamstow-loft-rent": ["Green space", "Easy commute", "Local cafés", "Good value"],
  "stoke-newington-room-rent": ["Local cafés", "Easy commute", "Quiet, tidy household", "Friendly & independent"],
  "leyton-victorian-terrace-buy": ["Green space", "Easy commute", "Garden", "Good value"],
  "walthamstow-flat-buy": ["Green space", "Easy commute", "Garden", "Good value"],
  "stoke-newington-flat-buy": ["Local cafés", "Easy commute"],
  "walthamstow-whole-house-rent": ["Green space", "Easy commute", "Garden", "Local cafés"],
  "leyton-whole-house-rent": ["Green space", "Easy commute", "Garden", "Local cafés"],
};

const roomTypesById: Record<string, "Single" | "Double"> = {
  "leyton-house": "Double",
  "leyton-flat": "Single",
  "walthamstow-house": "Double",
  "stoke-newington-flat": "Double",
  "walthamstow-room": "Double",
  "leyton-garden-house-rent": "Double",
  "stoke-newington-room-rent": "Double",
};

const listings: Listing[] = listingDrafts.map((listing) => {
  const propertyText = `${listing.title} ${listing.place}`.toLocaleLowerCase("en-GB");
  const propertyType =
    listing.homeType === "Room"
      ? "Room"
      : /flat|maisonette|apartment/.test(propertyText)
        ? "Flat"
        : "House";
  const bedrooms = Number(propertyText.match(/(\d+)[ -]bed(?:room)?/)?.[1] ?? 0);
  return {
    ...listing,
    propertyType,
    bedrooms,
    roomType: roomTypesById[listing.id],
    tags: listingTagsById[listing.id] ?? [],
  };
});

function getAreaPriceLabel(
  areaName: string,
  listingMode: "All" | "Rent" | "Buy",
  answers: SearchAnswers,
): string {
  if (listingMode === "All") {
    return areas.find((area) => area.name === areaName)?.price ?? "Sample prices vary";
  }

  const matchingListings = listings.filter(
    (listing) =>
      listing.area === areaName &&
      matchesListingPreferences(listing, answers, listingMode),
  );
  const lowestPrice = matchingListings
    .slice()
    .sort((first, second) => {
      const firstPrice = Number(first.price.replace(/[£,]/g, "").match(/\d+/)?.[0]);
      const secondPrice = Number(second.price.replace(/[£,]/g, "").match(/\d+/)?.[0]);
      return firstPrice - secondPrice;
    })[0]?.price;

  if (!lowestPrice) {
    return listingMode === "Buy" ? "No sample purchase prices yet" : "No sample rental prices yet";
  }
  return listingMode === "Buy"
    ? `Sample purchase prices from ${lowestPrice}`
    : `Sample rental prices from ${lowestPrice}`;
}

const roommateProfiles = [
  {
    name: "Alex",
    area: "Leyton",
    budget: "Up to £950 pcm",
    bio: "Creative, friendly and big on shared dinners — equally happy with a quiet night in.",
    vibe: "Social, tidy, relaxed",
    tags: ["Shared dinners", "Friendly & independent", "Pet-friendly"],
  },
  {
    name: "Sam",
    area: "Walthamstow",
    budget: "Up to £900 pcm",
    bio: "Works hybrid, loves a weekend market wander and appreciates clear, kind communication.",
    vibe: "Easy-going, considerate",
    tags: ["Friendly & independent", "Work-from-home friendly"],
  },
  {
    name: "Jamie",
    area: "Stoke Newington",
    budget: "Up to £1,000 pcm",
    bio: "Into cooking, local cafés and keeping home peaceful after a busy day.",
    vibe: "Calm, sociable, clean",
    tags: ["Shared dinners", "Quiet, tidy household"],
  },
];

// Edit these demo profiles to change the people shown in the housemate swipe deck.
const housemateSwipeProfiles: HousemateProfile[] = [
  { id: "maya", name: "Maya", age: 27, job: "Graphic designer", area: "Camden", budget: 1100, moveIn: "1 June", bio: "Collects cookbooks, knows every good coffee spot, and is always up for a gallery wander.", tags: ["Loves cooking", "Tidy", "Works from home"], avatar: "M", photo: "/images/housemates/maya.jpg", colors: ["#ffb28e", "#e66780"] },
  { id: "leo", name: "Leo", age: 29, job: "Primary school teacher", area: "Clapham", budget: 1250, moveIn: "15 June", bio: "Friendly homebody who likes Sunday roasts, plants, and keeping the kitchen clear.", tags: ["Early riser", "Pet-friendly", "Gym-goer"], avatar: "L", photo: "/images/housemates/leo.jpg", colors: ["#72c6b4", "#287a91"] },
  { id: "amara", name: "Amara", age: 25, job: "Product researcher", area: "Shoreditch", budget: 1350, moveIn: "Flexible", bio: "Big on creative projects, low-key evenings, and sharing the occasional homemade dessert.", tags: ["Non-smoker", "Tidy", "Loves cooking"], avatar: "A", photo: "/images/housemates/amara.jpg", colors: ["#aa8cf0", "#5262ae"] },
  { id: "elliot", name: "Elliot", age: 31, job: "Architect", area: "Islington", budget: 1400, moveIn: "1 July", bio: "Design nerd, weekend cyclist, and respectful flatmate who appreciates a calm home.", tags: ["Early riser", "Non-smoker", "Works from home"], avatar: "E", photo: "/images/housemates/elliot.jpg", colors: ["#e7ad55", "#bd5f45"] },
  { id: "sana", name: "Sana", age: 26, job: "Nurse", area: "Brixton", budget: 1050, moveIn: "15 June", bio: "Shift worker, plant enthusiast, and fan of clear communication and shared playlists.", tags: ["Pet-friendly", "Tidy", "Night owl"], avatar: "S", photo: "/images/housemates/sana.jpg", colors: ["#e887bd", "#9860aa"] },
  { id: "oliver", name: "Oliver", age: 28, job: "Software developer", area: "Hackney", budget: 1300, moveIn: "1 August", bio: "Hybrid worker who likes bouldering, a friendly chat, and a properly good flat playlist.", tags: ["Works from home", "Gym-goer", "Non-smoker"], avatar: "O", photo: "/images/housemates/oliver.jpg", colors: ["#67a9ec", "#3b68a4"] },
  { id: "zara", name: "Zara", age: 24, job: "Fashion buyer", area: "Peckham", budget: 1000, moveIn: "Flexible", bio: "Thrift-shop explorer and enthusiastic cook who keeps things warm, welcoming, and relaxed.", tags: ["Loves cooking", "Social", "Pet-friendly"], avatar: "Z", photo: "/images/housemates/zara.jpg", colors: ["#f3a456", "#ce5369"] },
  { id: "noah", name: "Noah", age: 30, job: "Environmental consultant", area: "Walthamstow", budget: 1150, moveIn: "1 June", bio: "Outdoorsy, considerate, and happiest after a long walk followed by a big bowl of pasta.", tags: ["Early riser", "Tidy", "Non-smoker"], avatar: "N", photo: "/images/housemates/noah.jpg", colors: ["#84bf72", "#418c82"] },
  { id: "imani", name: "Imani", age: 27, job: "Music producer", area: "Dalston", budget: 1200, moveIn: "15 July", bio: "Creative but respectful of quiet hours, with a soft spot for live music and houseplants.", tags: ["Night owl", "Pet-friendly", "Works from home"], avatar: "I", photo: "/images/housemates/imani.jpg", colors: ["#9a83dc", "#d469a5"] },
  { id: "freddie", name: "Freddie", age: 26, job: "Chef", area: "Deptford", budget: 950, moveIn: "1 June", bio: "Will absolutely cook too much food and offer you some. Clean, cheerful, and easy-going.", tags: ["Loves cooking", "Social", "Tidy"], avatar: "F", photo: "/images/housemates/freddie.jpg", colors: ["#e99862", "#b95440"] },
];

function shuffledHousemates() {
  const shuffled = [...housemateSwipeProfiles];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }
  return shuffled;
}

function getQuestionReply(question: string): string {
  const normalized = question.toLocaleLowerCase("en-GB");
  if (normalized.includes("bill") || normalized.includes("cost")) {
    return "Quick money chat: the Quiet garden room in Leyton says bills are included. The other sample listings don’t say, so check with the provider before your budget starts doing parkour.";
  }
  if (normalized.includes("bike") || normalized.includes("cycle")) {
    return "Bike storage isn’t listed in these samples, so Homie can’t promise your bike a VIP parking spot. Check with the provider before deciding.";
  }
  if (normalized.includes("who") || normalized.includes("housemate") || normalized.includes("live")) {
    return "Housemates are a huge part of the home lore. I can show sample profiles and shared-home matches; always confirm who lives there and how the household works with the provider.";
  }
  return "I can help with the details we have so far. Try asking about bills, bike storage or housemates.";
}

function getChatFaqReply(question: string): string | null {
  const normalized = question.toLocaleLowerCase("en-GB");
  if (normalized.includes("bill") || normalized.includes("cost")) return getQuestionReply(question);
  if (normalized.includes("bike") || normalized.includes("cycle")) return getQuestionReply(question);
  if (
    normalized.includes("housemate") ||
    normalized.includes("roommate") ||
    normalized.includes("who would i live")
  ) {
    return getQuestionReply(question);
  }
  return null;
}

function getUnsupportedChatReply(): string {
  return "Sorry, I can't help with that. I can help you find a room, flat or house to rent, or a flat or house to buy; set your budget and commute; choose lifestyle and room or bedroom preferences; and review matching sample homes. Please choose one of the options shown.";
}

const areaTabs = ["Feel", "Everyday life", "Getting around", "Good to know"] as const;

const searchChoices = {
  goal: ["Rent a room", "Rent a flat", "Rent a house", "Buy a flat", "Buy a house"],
  commute: ["Central London", "City / Canary Wharf", "Mostly remote / flexible"],
  lifestyle: ["Green space & parks", "Cafés & local food", "Easy commute", "Garden / outdoor space"],
  roommates: [
    "Sociable, shared dinners",
    "Friendly but independent",
    "Quiet, tidy household",
    "Pet-friendly household",
    "Works-from-home friendly",
  ],
} as const;

function getBudgetChoices(goal: SearchGoal | ""): string[] {
  switch (goal) {
    case "Rent a room":
      return ["Under £900 pcm", "£900–£1,500 pcm", "Flexible rental budget"];
    case "Rent a flat":
      return ["Under £2,000 pcm", "£2,000–£3,000 pcm", "Flexible rental budget"];
    case "Rent a house":
      return ["Under £2,500 pcm", "£2,500–£3,500 pcm", "Flexible rental budget"];
    case "Buy a flat":
      return ["Under £450k", "£450k–£600k", "Flexible purchase budget"];
    case "Buy a house":
      return ["Under £550k", "£550k–£700k", "Flexible purchase budget"];
    default:
      return ["Under £900 pcm", "£900–£1,500 pcm", "Flexible rental budget"];
  }
}

function getListingModeFromGoal(goal: SearchGoal | ""): "Rent" | "Buy" | "All" {
  if (goal.startsWith("Buy")) return "Buy";
  if (goal.startsWith("Rent")) return "Rent";
  return "All";
}

function getListingModeFromBudget(budget: string): "Rent" | "Buy" {
  return budget.toLowerCase().includes("purchase") || budget.includes("k") ? "Buy" : "Rent";
}

function getHousingChoices(goal: SearchGoal | ""): string[] {
  if (goal === "Rent a room") return ["Single room", "Double room", "Any room size"];
  return ["1 bedroom", "2 bedrooms", "3+ bedrooms", "Any number of bedrooms"];
}

function getLifestyleTag(lifestyle: string): string {
  if (lifestyle.startsWith("Green")) return "Green space";
  if (lifestyle.startsWith("Cafés")) return "Local cafés";
  if (lifestyle.startsWith("Garden")) return "Garden";
  return "Easy commute";
}

function getRoommateTag(preference: string): string {
  if (preference.startsWith("Sociable")) return "Shared dinners";
  if (preference.startsWith("Friendly")) return "Friendly & independent";
  if (preference.startsWith("Quiet")) return "Quiet, tidy household";
  if (preference.startsWith("Pet")) return "Pet-friendly";
  return "Work-from-home friendly";
}

function getPriceBounds(budget: string): [number, number] | null {
  if (!budget || budget.startsWith("Flexible")) return null;
  const values = [...budget.matchAll(/£([\d,]+)(k)?/gi)].map((match) => {
    const amount = Number(match[1].replace(/,/g, ""));
    return match[2] ? amount * 1000 : amount;
  });
  if (!values.length) return null;
  return values.length === 1 ? [0, values[0]] : [values[0], values[1]];
}

function getPropertyKind(goal: SearchGoal | ""): Listing["propertyType"] | null {
  if (goal === "Rent a room") return "Room";
  if (goal.endsWith("a flat")) return "Flat";
  if (goal.endsWith("a house")) return "House";
  return null;
}

function matchesListingPreferences(
  listing: Listing,
  answers: SearchAnswers,
  fallbackMode: "All" | "Rent" | "Buy" = "All",
): boolean {
  const mode = answers.goal ? getListingModeFromGoal(answers.goal) : fallbackMode;
  if (mode !== "All" && listing.listingType !== mode) return false;

  const propertyKind = getPropertyKind(answers.goal);
  if (propertyKind && listing.propertyType !== propertyKind) return false;

  const price = Number(listing.price.replace(/[£,]/g, "").match(/\d+/)?.[0]);
  const budgetBounds = getPriceBounds(answers.budget);
  if (budgetBounds && (price < budgetBounds[0] || price > budgetBounds[1])) return false;

  const lifestyleTag = answers.lifestyle ? getLifestyleTag(answers.lifestyle) : "";
  if (lifestyleTag && !listing.tags.includes(lifestyleTag)) return false;

  if (answers.housing === "Single room" && listing.roomType !== "Single") return false;
  if (answers.housing === "Double room" && listing.roomType !== "Double") return false;
  if (answers.housing === "1 bedroom" && listing.bedrooms !== 1) return false;
  if (answers.housing === "2 bedrooms" && listing.bedrooms !== 2) return false;
  if (answers.housing === "3+ bedrooms" && listing.bedrooms < 3) return false;

  if (
    answers.goal === "Rent a room" &&
    answers.roommates &&
    !listing.tags.includes(getRoommateTag(answers.roommates))
  ) {
    return false;
  }
  return true;
}

function getSearchPrompt(
  stage: SearchStage,
  answers?: SearchAnswers,
): Pick<ChatMessage, "text" | "options"> | null {
  const prompts: Partial<Record<SearchStage, Pick<ChatMessage, "text" | "options">>> = {
    welcome: {
      text: "Hey, I’m Homie 🏠 Your London home hunt just got a sidekick. I’ll ask a few quick questions, then bring back areas, homes and potential housemates. No awkward DMs, no 47-tab spiral.",
      options: ["Start my search", "How does it work?", "Browse sample listings"],
    },
    goal: {
      text: "First plot point: what kind of place are you looking for? Choose a home type and I’ll keep the results focused.",
      options: [...searchChoices.goal],
    },
    budget: {
      text: "What budget should I keep in mind? Choose the closest fit for this kind of home — we’re not doing rent-price jump scares.",
      options: getBudgetChoices(answers?.goal ?? ""),
    },
    commute: {
      text: "What’s your regular commute destination (or are you gloriously remote)? This helps me rank the areas, not judge your WFH setup.",
      options: [...searchChoices.commute],
    },
    lifestyle: {
      text: "Beyond the commute, what should your everyday vibe look like? Think parks, coffee, or main-character city energy.",
      options: [...searchChoices.lifestyle],
    },
    housing: {
      text:
        answers?.goal === "Rent a room"
          ? "What kind of room are you hoping to find?"
          : "How many bedrooms would feel right?",
      options: getHousingChoices(answers?.goal ?? ""),
    },
    roommates: {
      text: "Last people-fit question: what kind of existing household would feel good to join?",
      options: [...searchChoices.roommates],
    },
    review: {
      text: "Search brief: assembled ✨ Give it a quick once-over below. Change anything that’s off, then I’ll pull your matches.",
      options: ["Generate recommendations", "Start over", "Browse all sample listings"],
    },
  };
  return prompts[stage] ?? null;
}

function getStageTransition(
  stage: SearchStage,
  selected: string,
  nextStage: SearchStage,
): string {
  const reactions: Partial<Record<SearchStage, string>> = {
    goal: `Got you: ${selected.toLowerCase()}.`,
    budget: `Budget noted: ${selected}. Keeping the maths visible and the vibes immaculate.`,
    commute: "Commute noted. Now for the everyday-life stuff that makes a place feel like yours.",
    lifestyle: "Vibe check: passed. Let’s match that to the right kind of home setup.",
    housing: "Home setup noted.",
    roommates: "Housemate vibe noted. No awkward flatmate auditions required — just a useful starting point.",
  };
  const nextStageCopy: Partial<Record<SearchStage, string>> = {
    budget: "Next, let’s set the budget.",
    commute: "Where do you need to get to?",
    lifestyle: "What should your everyday feel like?",
    housing: "What kind of home are we matching?",
    roommates: "One final people-fit question.",
    review: "That’s the brief. Let’s review it together.",
  };
  const reaction = reactions[stage] ?? "";
  const nextCopy = nextStageCopy[nextStage] ?? "";
  return [reaction, nextCopy].filter(Boolean).join(" ");
}

function Logo({ goHome }: { goHome: () => void }) {
  return (
    <button className="logo" onClick={goHome} aria-label="Rising Star Homes, back to home">
      <span className="logo-mark">✦</span>
      <span>Rising Star Homes</span>
    </button>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [history, setHistory] = useState<Screen[]>([]);
  const [mobileNav, setMobileNav] = useState(false);
  const [searchStage, setSearchStage] = useState<SearchStage>("welcome");
  const [searchAnswers, setSearchAnswers] = useState<SearchAnswers>({
    goal: "",
    budget: "",
    commute: "",
    lifestyle: "",
    housing: "",
    roommates: "",
  });
  const [filters, setFilters] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState("Leyton");
  const [tab, setTab] = useState("Feel");
  const [saved, setSaved] = useState<string[]>([]);
  const [housemateShortlist, setHousemateShortlist] = useState<string[]>([]);
  const [interestNotice, setInterestNotice] = useState("");
  const [roomModal, setRoomModal] = useState<Listing | null>(null);
  const [listingMode, setListingMode] = useState<"All" | "Rent" | "Buy">("All");
  const [listingArea, setListingArea] = useState("Leyton");
  const roomModalRef = useRef<HTMLDivElement>(null);
  const roomModalCloseRef = useRef<HTMLButtonElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "guide",
      ...getSearchPrompt("welcome")!,
    },
  ]);
  const [memory, setMemory] = useState<string[]>(["Move within 6–8 weeks"]);
  const [chatInput, setChatInput] = useState("");
  const [questionMessages, setQuestionMessages] = useState<ChatMessage[]>([
    { from: "guide", text: "Ask anything. Homie’s got your search context." },
  ]);
  const [questionInput, setQuestionInput] = useState("");
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    email: true,
    messages: true,
    data: "essential",
  });
  const [preferencesNotice, setPreferencesNotice] = useState("");
  const [housemateTab, setHousemateTab] = useState<HousemateTab>("Housemates");
  const [housematePanel, setHousematePanel] = useState<HousematePanel>("deck");
  const [housemateDeck, setHousemateDeck] = useState(shuffledHousemates);
  const [housemateIndex, setHousemateIndex] = useState(0);
  const [housemateMatches, setHousemateMatches] = useState<HousemateProfile[]>([]);
  const [activeMatch, setActiveMatch] = useState<HousemateProfile | null>(null);
  const [matchVisible, setMatchVisible] = useState(false);
  const [missesSinceMatch, setMissesSinceMatch] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<SwipeSnapshot[]>([]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);
  const [conversationProfile, setConversationProfile] = useState<HousemateProfile | null>(null);
  const [housemateMessages, setHousemateMessages] = useState<{ from: "match" | "you"; text: string }[]>([]);
  const [housemateMessageInput, setHousemateMessageInput] = useState("");
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const swipeTimer = useRef<number | undefined>(undefined);
  const swipeLock = useRef(false);

  useEffect(
    () => () => {
      if (swipeTimer.current !== undefined) window.clearTimeout(swipeTimer.current);
    },
    [],
  );

  useEffect(() => {
    try {
      const storedPreferences = window.localStorage.getItem("rising-star-preferences");
      if (!storedPreferences) return;

      const stored: unknown = JSON.parse(storedPreferences);
      if (typeof stored !== "object" || stored === null) {
        throw new Error("Saved preferences have an invalid format.");
      }

      const value = stored as Record<string, unknown>;
      setPreferences((current) => ({
        reducedMotion:
          typeof value.reducedMotion === "boolean" ? value.reducedMotion : current.reducedMotion,
        highContrast:
          typeof value.highContrast === "boolean" ? value.highContrast : current.highContrast,
        email: typeof value.email === "boolean" ? value.email : current.email,
        messages: typeof value.messages === "boolean" ? value.messages : current.messages,
        data: value.data === "personalised" ? "personalised" : "essential",
      }));
    } catch (error) {
      console.error("Unable to load saved preferences.", error);
      setPreferencesNotice("Saved preferences could not be read. You can choose and save them again.");
    }
  }, []);

  const navigate = (next: Screen) => {
    if (next === screen) return;
    setHistory((old) => [...old, screen]);
    setScreen(next);
    setMobileNav(false);
    scrollToTop();
  };

  const scrollToTop = () => {
    const reducedMotion =
      preferences.reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  };

  const goHome = () => {
    setHistory([]);
    setScreen("home");
    setMobileNav(false);
    scrollToTop();
  };

  const goBack = () => {
    const previous = history.at(-1) ?? "home";
    setHistory((old) => old.slice(0, -1));
    setScreen(previous);
    scrollToTop();
  };

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", preferences.reducedMotion);
    document.documentElement.classList.toggle("high-contrast", preferences.highContrast);
  }, [preferences.reducedMotion, preferences.highContrast]);

  useEffect(() => {
    if (!roomModal) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    roomModalCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRoomModal(null);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = roomModalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [roomModal]);

  const sendChat = (text = chatInput) => {
    const clean = text.trim();
    if (!clean) return;

    const appendGuide = (message: ChatMessage) => {
      setMessages((old) => [...old, { from: "you", text: clean }, message]);
    };

    if (searchStage === "welcome") {
      const normalized = clean.toLocaleLowerCase("en-GB");
      const faqReply = getChatFaqReply(clean);
      if (faqReply) {
        appendGuide({
          from: "guide",
          text: faqReply,
          options: ["Start my search", "How does it work?", "Browse sample listings"],
        });
        setChatInput("");
        return;
      }
      if (normalized.includes("browse")) {
        setMessages((old) => [...old, { from: "you", text: clean }]);
        setChatInput("");
        browseListings("All areas", "All");
        return;
      }
      if (normalized.includes("work") || normalized.includes("how")) {
        appendGuide({
          from: "guide",
          text: "Homie will help set your home type, budget, commute and day-to-day preferences, then show matching sample homes. Choose a room and we’ll also consider the existing household. You can review or change everything before seeing recommendations.",
          options: ["Start my search", "How does it work?", "Browse sample listings"],
        });
        setChatInput("");
        return;
      }
      if (!normalized.includes("start")) {
        appendGuide({
          from: "guide",
          text: getUnsupportedChatReply(),
          options: ["Start my search", "How does it work?", "Browse sample listings"],
        });
        setChatInput("");
        return;
      }
      setSearchStage("goal");
      appendGuide({ from: "guide", ...getSearchPrompt("goal")! });
      setChatInput("");
      return;
    }

    if (searchStage === "review") {
      const normalized = clean.toLocaleLowerCase("en-GB");
      if (normalized.includes("generate")) {
        setListingArea("All areas");
        setSelectedArea("Leyton");
        setChatInput("");
        navigate("recommendations");
        return;
      }
      if (normalized.includes("start over")) {
        setSearchAnswers({ goal: "", budget: "", commute: "", lifestyle: "", housing: "", roommates: "" });
        setFilters([]);
        setListingMode("All");
        setSearchStage("welcome");
        setMessages([{ from: "guide", ...getSearchPrompt("welcome")! }]);
        setChatInput("");
        return;
      }
      if (normalized.includes("browse")) {
        setChatInput("");
        browseListings("All areas", "All");
        return;
      }
      appendGuide({
        from: "guide",
        text: getUnsupportedChatReply(),
        options: ["Generate recommendations", "Start over", "Browse sample listings"],
      });
      setChatInput("");
      return;
    }

    const stageChoices =
      searchStage === "budget"
        ? getBudgetChoices(searchAnswers.goal)
        : searchStage === "housing"
          ? getHousingChoices(searchAnswers.goal)
        : searchChoices[searchStage as keyof typeof searchChoices];
    const selected = stageChoices.find((option) => option.toLocaleLowerCase("en-GB") === clean.toLocaleLowerCase("en-GB"));
    if (!selected) {
      const faqReply = getChatFaqReply(clean);
      appendGuide({
        from: "guide",
        text: faqReply ?? getUnsupportedChatReply(),
        options: [...stageChoices],
      });
      setChatInput("");
      return;
    }

    const answerKey: Record<Exclude<SearchStage, "welcome" | "review">, keyof SearchAnswers> = {
      goal: "goal",
      budget: "budget",
      commute: "commute",
      lifestyle: "lifestyle",
      housing: "housing",
      roommates: "roommates",
    };
    const currentAnswerKey = answerKey[searchStage as keyof typeof answerKey];
    const updatedAnswers = { ...searchAnswers, [currentAnswerKey]: selected } as SearchAnswers;
    setSearchAnswers(updatedAnswers);

    let nextStage: SearchStage;
    switch (searchStage) {
      case "goal":
        setListingMode(getListingModeFromGoal(selected as SearchGoal));
        nextStage = "budget";
        break;
      case "budget":
        setListingMode(getListingModeFromBudget(selected));
        nextStage = "commute";
        break;
      case "commute":
        nextStage = "lifestyle";
        break;
      case "lifestyle":
        setFilters([getLifestyleTag(selected)]);
        nextStage = "housing";
        break;
      case "housing": {
        nextStage = updatedAnswers.goal === "Rent a room" ? "roommates" : "review";
        break;
      }
      case "roommates":
      default:
        nextStage = "review";
    }

    setSearchStage(nextStage);
    const nextPrompt = getSearchPrompt(nextStage, updatedAnswers);
    const transition = getStageTransition(searchStage, selected, nextStage);
    if (nextStage === "review") {
      appendGuide({
        from: "guide",
        ...nextPrompt!,
        text: `${transition} ${nextPrompt!.text}`,
        review: true,
      });
    } else {
      appendGuide({ from: "guide", ...nextPrompt!, text: `${transition} ${nextPrompt!.text}` });
    }
    setMemory((old) => (old.includes(clean) ? old : [...old, clean].slice(-5)));
    setChatInput("");
  };

  const sendQuestion = (question = questionInput) => {
    const clean = question.trim();
    if (!clean) return;
    setQuestionMessages((old) => [
      ...old,
      { from: "you", text: clean },
      { from: "guide", text: getQuestionReply(clean) },
    ]);
    setQuestionInput("");
  };

  const selectedLifestyleTag = searchAnswers.lifestyle ? getLifestyleTag(searchAnswers.lifestyle) : "";
  const recommendedAreas = [...areas].sort((first, second) => {
    const scoreArea = (area: (typeof areas)[number]) =>
      (area.commuteScores[searchAnswers.commute as keyof typeof area.commuteScores] ?? 0) * 2 +
      Number(Boolean(searchAnswers.lifestyle) && area.tags.includes(selectedLifestyleTag)) +
      filters.filter((filter) => area.tags.includes(filter)).length;
    return scoreArea(second) - scoreArea(first);
  });
  const currentArea = areas.find((area) => area.name === selectedArea) ?? areas[0];
  const areaListings = listings.filter(
    (listing) =>
      listing.area === selectedArea &&
      matchesListingPreferences(listing, searchAnswers, listingMode),
  );
  const selectedAreaPrice = getAreaPriceLabel(
    selectedArea,
    listingMode,
    searchAnswers,
  );
  const roommateSearch = searchAnswers.goal === "Rent a room";
  const recommendationListingMode = searchAnswers.goal
    ? getListingModeFromGoal(searchAnswers.goal)
    : listingMode;
  const recommendationListings = listings
    .filter((listing) => matchesListingPreferences(listing, searchAnswers, listingMode))
    .sort((first, second) => {
      const getCommuteScore = (listing: Listing) =>
        areas.find((area) => area.name === listing.area)?.commuteScores[
          searchAnswers.commute as keyof (typeof areas)[number]["commuteScores"]
        ] ?? 0;
      return getCommuteScore(second) - getCommuteScore(first);
    });
  const comparisonListings = listings.filter((listing) => saved.includes(listing.id));
  const roommateStyleTerms = searchAnswers.roommates.startsWith("Sociable")
    ? ["social", "sociable", "shared"]
    : searchAnswers.roommates.startsWith("Friendly")
      ? ["easy-going", "considerate", "independent"]
      : searchAnswers.roommates.startsWith("Quiet")
        ? ["calm", "clean", "quiet", "tidy"]
        : searchAnswers.roommates.startsWith("Pet")
          ? ["pet", "animal"]
          : ["work", "hybrid", "home"];
  const roommateMatchScore = (profile: (typeof roommateProfiles)[number]) =>
    Number(roommateStyleTerms.some((term) => profile.vibe.toLocaleLowerCase("en-GB").includes(term)));
  const recommendationProfiles = roommateProfiles
    .filter((profile) => !searchAnswers.roommates || profile.tags.includes(getRoommateTag(searchAnswers.roommates)))
    .sort((first, second) => roommateMatchScore(second) - roommateMatchScore(first));
  const progressStages: SearchStage[] = [
    "goal",
    "budget",
    "commute",
    "lifestyle",
    "housing",
    ...(roommateSearch ? ["roommates" as const] : []),
    "review",
  ];
  const progressIndex = progressStages.indexOf(searchStage);
  const progressPercent =
    progressIndex < 0 ? 0 : Math.round(((progressIndex + 1) / progressStages.length) * 100);
  const reviewFields: { key: keyof SearchAnswers; label: string; options: readonly string[] }[] = [
    { key: "goal", label: "What you’re looking for", options: searchChoices.goal },
    { key: "budget", label: "Budget", options: getBudgetChoices(searchAnswers.goal) },
    { key: "commute", label: "Commute", options: searchChoices.commute },
    { key: "lifestyle", label: "Lifestyle", options: searchChoices.lifestyle },
    { key: "housing", label: "Housing setup", options: getHousingChoices(searchAnswers.goal) },
    { key: "roommates", label: "Roommate vibe", options: searchChoices.roommates },
  ];
  const visibleListings = listings.filter(
    (listing) =>
      (listingArea === "All areas" || listing.area === listingArea) &&
      (listingMode === "All" || listing.listingType === listingMode),
  );
  const currentHousemate = housemateDeck[housemateIndex];

  const activeNav =
    screen === "home"
      ? "Home"
      : screen === "housemates"
        ? "Find a Housemate"
        : ["chat", "recommendations", "area", "adjust"].includes(screen)
        ? screen === "chat"
          ? "Homie Chat"
          : "Find a Housemate"
        : screen === "questions"
          ? "Homie Chat"
      : screen === "rooms"
        ? listingMode === "Buy"
          ? "Buy"
          : "Rent"
        : "Accessibility";

  const navItems: [string, Screen][] = [
    ["Home", "home"],
    ["Homie Chat", "chat"],
    ["Rent", "rooms"],
    ["Buy", "rooms"],
    ["Find a Housemate", "housemates"],
    ["Accessibility", "accessibility"],
  ];

  const toggleFilter = (filter: string) =>
    setFilters((old) => (old.includes(filter) ? old.filter((item) => item !== filter) : [...old, filter]));

  const toggleSaved = (id: string) =>
    setSaved((old) => (old.includes(id) ? old.filter((item) => item !== id) : [...old, id]));

  const expressPropertyInterest = (listing: Listing) =>
    setInterestNotice(`Your sample interest in ${listing.title} is noted. No agent was contacted.`);

  const openArea = (name: string) => {
    setSelectedArea(name);
    setListingArea(name);
    setTab("Feel");
    navigate("area");
  };

  const browseListings = (area = "All areas", type: "All" | "Rent" | "Buy" = "All") => {
    setListingArea(area);
    setListingMode(type);
    navigate("rooms");
  };

  const startHousemateSearch = () => {
    if (searchStage === "welcome") {
      setSearchStage("goal");
      setMessages((old) => [...old, { from: "guide", ...getSearchPrompt("goal")! }]);
    }
    navigate("chat");
  };

  const openHousemateFeature = () => {
    setHousemateTab("Housemates");
    setHousematePanel("deck");
    setMatchVisible(false);
    navigate("housemates");
  };

  const handleNavigation = (label: string, destination: Screen) => {
    if (label === "Find a Housemate") {
      openHousemateFeature();
    } else if (label === "Rent") {
      browseListings("All areas", "Rent");
    } else if (label === "Buy") {
      browseListings("All areas", "Buy");
    } else {
      navigate(destination);
    }
  };

  const requestHousemateConnection = (name: string) => {
    const alreadyAdded = housemateShortlist.includes(name);
    setHousemateShortlist((old) =>
      alreadyAdded ? old.filter((item) => item !== name) : [...old, name],
    );
    setInterestNotice(
      alreadyAdded
        ? `${name} was removed from your sample roommate shortlist.`
        : `Interest in ${name} is saved for this demo. No message was sent.`,
    );
  };

  const adjustSearch = (filter: string) => {
    setFilters([filter]);
    navigate("recommendations");
  };

  const savePreferences = () => {
    try {
      window.localStorage.setItem("rising-star-preferences", JSON.stringify(preferences));
      setPreferencesNotice("Your choices have been saved on this device.");
    } catch (error) {
      console.error("Unable to save preferences.", error);
      setPreferencesNotice("Your choices are active for this visit but could not be saved on this device.");
    }
  };

  const triggerHousemateSwipe = (direction: SwipeDirection) => {
    if (!currentHousemate || swipeLock.current) return;
    swipeLock.current = true;
    swipeStart.current = null;
    setIsDragging(false);
    setSwipeDirection(direction);
    setDragOffset({ x: direction === "right" ? 520 : -520, y: dragOffsetRef.current.y });
    swipeTimer.current = window.setTimeout(() => {
      setSwipeHistory((old) => [
        ...old,
        { index: housemateIndex, missesSinceMatch, totalLikes, matches: housemateMatches },
      ]);
      setHousemateIndex((index) => index + 1);
      if (direction === "right") {
        const isMatch = totalLikes === 0 || missesSinceMatch >= 2 || Math.random() < 0.4;
        setTotalLikes((count) => count + 1);
        if (isMatch) {
          setMissesSinceMatch(0);
          setHousemateMatches((old) =>
            old.some((match) => match.id === currentHousemate.id) ? old : [...old, currentHousemate],
          );
          setActiveMatch(currentHousemate);
          setMatchVisible(true);
        } else {
          setMissesSinceMatch((count) => count + 1);
        }
      }
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
      dragOffsetRef.current = { x: 0, y: 0 };
      swipeLock.current = false;
      swipeTimer.current = undefined;
    }, preferences.reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 340);
  };

  const handleHousematePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!currentHousemate || swipeLock.current || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    swipeStart.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
  };

  const handleHousematePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!swipeStart.current || swipeLock.current) return;
    const offset = {
      x: event.clientX - swipeStart.current.x,
      y: event.clientY - swipeStart.current.y,
    };
    dragOffsetRef.current = offset;
    setDragOffset(offset);
  };

  const handleHousematePointerUp = () => {
    if (!swipeStart.current || swipeLock.current) return;
    const { x } = dragOffsetRef.current;
    swipeStart.current = null;
    setIsDragging(false);
    if (Math.abs(x) >= 110) {
      triggerHousemateSwipe(x > 0 ? "right" : "left");
    } else {
      setDragOffset({ x: 0, y: 0 });
      dragOffsetRef.current = { x: 0, y: 0 };
    }
  };

  const undoHousemateSwipe = () => {
    if (swipeLock.current) return;
    const snapshot = swipeHistory.at(-1);
    if (!snapshot) return;
    setHousemateIndex(snapshot.index);
    setMissesSinceMatch(snapshot.missesSinceMatch);
    setTotalLikes(snapshot.totalLikes);
    setHousemateMatches(snapshot.matches);
    setSwipeHistory((old) => old.slice(0, -1));
    setActiveMatch(null);
    setMatchVisible(false);
    setHousematePanel("deck");
    setDragOffset({ x: 0, y: 0 });
    dragOffsetRef.current = { x: 0, y: 0 };
  };

  const restartHousemateDeck = () => {
    setHousemateDeck(shuffledHousemates());
    setHousemateIndex(0);
    setMissesSinceMatch(0);
    setTotalLikes(0);
    setSwipeHistory([]);
    setActiveMatch(null);
    setMatchVisible(false);
    setHousematePanel("deck");
    setHousemateTab("Housemates");
  };

  const openHousemateChat = (profile: HousemateProfile) => {
    setConversationProfile(profile);
    setHousemateMessages([
      {
        from: "match",
        text: `Hey! Are you still looking for a place around ${profile.area}?`,
      },
    ]);
    setHousemateMessageInput("");
    setMatchVisible(false);
    setHousematePanel("chat");
  };

  const sendHousemateMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanMessage = housemateMessageInput.trim();
    if (!cleanMessage) return;
    setHousemateMessages((old) => [...old, { from: "you", text: cleanMessage }]);
    setHousemateMessageInput("");
  };

  return (
    <div className={screen === "housemates" ? "app app-housemates" : "app"}>
      <header className="site-header">
        <Logo goHome={goHome} />
        <nav className={mobileNav ? "nav open" : "nav"} aria-label="Main navigation">
          {navItems.map(([label, destination]) => (
            <button
              key={label}
              className={activeNav === label ? "nav-link active" : "nav-link"}
              onClick={() => handleNavigation(label, destination)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          className="menu-button"
          aria-expanded={mobileNav}
          aria-label="Toggle navigation"
          onClick={() => setMobileNav((open) => !open)}
        >
          {mobileNav ? "Close" : "Menu"}
        </button>
      </header>

      <main key={screen} className={screen === "housemates" ? "screen housemates-screen fade-in" : "screen fade-in"}>
        {screen !== "home" && screen !== "chat" && screen !== "housemates" && (
          <button className="back-link" onClick={goBack}>
            ← Back
          </button>
        )}

        {screen === "housemates" && (
          <section className="housemate-phone" aria-label="Find a Housemate demo">
            <header className="housemate-header">
              {housematePanel === "chat" ? (
                <button
                  className="housemate-header-back"
                  aria-label="Back to matches"
                  onClick={() => setHousematePanel("matches")}
                >
                  ←
                </button>
              ) : (
                <button
                  className="housemate-header-back"
                  aria-label="Back to previous page"
                  onClick={goBack}
                >
                  ←
                </button>
              )}
              <div className="housemate-heading">
                <h1>{housematePanel === "chat" ? conversationProfile?.name ?? "Messages" : "Find a Housemate 🏠"}</h1>
                <p>{housematePanel === "chat" ? "London · demo chat" : "London"}</p>
              </div>
              {housematePanel === "chat" ? (
                <span className="housemate-chat-status">Demo</span>
              ) : (
                <button
                  className="matches-button"
                  onClick={() => {
                    setHousematePanel("matches");
                    setHousemateTab("Housemates");
                  }}
                  aria-label={`View matches, ${housemateMatches.length} total`}
                >
                  Matches <span className="matches-count">{housemateMatches.length}</span>
                </button>
              )}
            </header>

            <div className="housemate-content">
              {housemateTab !== "Housemates" && (
                <section className="housemate-placeholder">
                  <div className="placeholder-emoji" aria-hidden="true">
                    {housemateTab === "Home" ? "🏡" : housemateTab === "Homie Chat" ? "💬" : "✨"}
                  </div>
                  <p className="housemate-eyebrow">Rising Star Homes · London</p>
                  <h2>
                    {housemateTab === "Home"
                      ? "Your next chapter starts here."
                      : housemateTab === "Homie Chat"
                        ? "Chat with Homie."
                        : "Something lovely is on the way."}
                  </h2>
                  <p>
                    {housemateTab === "Home"
                      ? "Explore the housemate demo, or take a look around the rest of the site."
                      : housemateTab === "Homie Chat"
                        ? "Get help exploring homes, areas and housemate options."
                        : "More ways to find a place and people who fit are coming soon."}
                  </p>
                  <button
                    className="primary"
                    onClick={() => {
                      setHousemateTab("Housemates");
                      setHousematePanel("deck");
                    }}
                  >
                    Back to housemates
                  </button>
                </section>
              )}

              {housemateTab === "Housemates" && housematePanel === "deck" && currentHousemate && (
                <div className="housemate-deck-view">
                  <div className="deck-intro">
                    <div>
                      <span className="housemate-eyebrow">Good people, better house shares</span>
                      <h2>Meet your next housemate.</h2>
                    </div>
                    <span className="deck-counter">{housemateIndex + 1} / {housemateDeck.length}</span>
                  </div>
                  <div className="profile-stack" aria-label="Housemate profiles">
                    {housemateDeck[housemateIndex + 1] && <div className="profile-peek profile-peek-back" />}
                    {housemateDeck[housemateIndex + 1] && <div className="profile-peek profile-peek-front" />}
                    <article
                      className={`housemate-profile-card${isDragging ? " is-dragging" : ""}${swipeDirection ? ` is-swiping-${swipeDirection}` : ""}`}
                      style={{
                        transform: swipeDirection
                          ? undefined
                          : `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x / 22}deg)`,
                        transition: isDragging ? "none" : undefined,
                        background: `linear-gradient(145deg, ${currentHousemate.colors[0]}, ${currentHousemate.colors[1]})`,
                      }}
                      onPointerDown={handleHousematePointerDown}
                      onPointerMove={handleHousematePointerMove}
                      onPointerUp={handleHousematePointerUp}
                      onPointerCancel={handleHousematePointerUp}
                    >
                      <div className="profile-card-topline">
                        <span>HOUSEMATE SPOTLIGHT</span>
                        <span className="profile-london">LONDON</span>
                      </div>
                      <div className="profile-avatar">
                        <img src={currentHousemate.photo} alt={`${currentHousemate.name}, ${currentHousemate.age}`} />
                      </div>
                      <div className="profile-card-details">
                        <h3>{currentHousemate.name}, {currentHousemate.age}</h3>
                        <p className="profile-job">{currentHousemate.job}</p>
                        <div className="profile-facts">
                          <span>⌖ {currentHousemate.area}</span>
                          <span>£{currentHousemate.budget.toLocaleString("en-GB")} / month</span>
                          <span>Move-in: {currentHousemate.moveIn}</span>
                        </div>
                        <p className="profile-bio">{currentHousemate.bio}</p>
                        <div className="profile-tags">
                          {currentHousemate.tags.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                      </div>
                      <div
                        className={`swipe-stamp stamp-like${dragOffset.x > 0 ? " is-visible" : ""}`}
                        style={{ opacity: Math.min(Math.max(dragOffset.x / 75, 0), 1) }}
                        aria-hidden="true"
                      >
                        LIKE
                      </div>
                      <div
                        className={`swipe-stamp stamp-nope${dragOffset.x < 0 ? " is-visible" : ""}`}
                        style={{ opacity: Math.min(Math.max(-dragOffset.x / 75, 0), 1) }}
                        aria-hidden="true"
                      >
                        NOPE
                      </div>
                    </article>
                  </div>
                  <div className="swipe-controls" aria-label="Choose whether to pass or like">
                    <button
                      className="swipe-control undo-control"
                      onClick={undoHousemateSwipe}
                      disabled={!swipeHistory.length || swipeLock.current}
                      aria-label="Undo last swipe"
                      title="Undo last swipe"
                    >
                      ↺
                    </button>
                    <button
                      className="swipe-control pass-control"
                      onClick={() => triggerHousemateSwipe("left")}
                      disabled={swipeLock.current}
                      aria-label={`Pass on ${currentHousemate.name}`}
                      title="Pass"
                    >
                      ✕
                    </button>
                    <button
                      className="swipe-control like-control"
                      onClick={() => triggerHousemateSwipe("right")}
                      disabled={swipeLock.current}
                      aria-label={`Like ${currentHousemate.name}`}
                      title="Like"
                    >
                      ♥
                    </button>
                  </div>
                  <p className="swipe-hint">Swipe right to like · left to pass</p>
                </div>
              )}

              {housemateTab === "Housemates" && housematePanel === "deck" && !currentHousemate && (
                <section className="deck-empty">
                  <div className="placeholder-emoji" aria-hidden="true">🎉</div>
                  <p className="housemate-eyebrow">That’s everyone for now</p>
                  <h2>You’ve seen everyone nearby.</h2>
                  <p>Take another look — the deck will be shuffled for a fresh start.</p>
                  <button className="primary" onClick={restartHousemateDeck}>Start again</button>
                  {swipeHistory.length > 0 && (
                    <button className="secondary deck-undo-button" onClick={undoHousemateSwipe}>
                      ↺ Undo last swipe
                    </button>
                  )}
                </section>
              )}

              {housemateTab === "Housemates" && housematePanel === "matches" && (
                <section className="matches-view">
                  <div className="matches-view-heading">
                    <div>
                      <span className="housemate-eyebrow">The good connections</span>
                      <h2>Your matches</h2>
                    </div>
                    <button className="text-link" onClick={() => setHousematePanel("deck")}>Back to swiping</button>
                  </div>
                  {housemateMatches.length === 0 ? (
                    <div className="matches-empty">
                      <span aria-hidden="true">💛</span>
                      <h3>Your matches will show up here.</h3>
                      <p>Like someone in the deck to get the good vibes started.</p>
                      <button className="primary" onClick={() => setHousematePanel("deck")}>Meet housemates</button>
                    </div>
                  ) : (
                    <div className="matches-list">
                      {housemateMatches.map((profile) => (
                        <article className="match-list-card" key={profile.id}>
                          <div
                            className="match-list-avatar"
                            style={{ background: `linear-gradient(145deg, ${profile.colors[0]}, ${profile.colors[1]})` }}
                          >
                            <img src={profile.photo} alt="" />
                          </div>
                          <div className="match-list-copy">
                            <h3>{profile.name}, {profile.age}</h3>
                            <p>{profile.area} · up to £{profile.budget.toLocaleString("en-GB")} / month</p>
                          </div>
                          <button className="message-match-button" onClick={() => openHousemateChat(profile)}>
                            Message
                          </button>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {housemateTab === "Housemates" && housematePanel === "chat" && (
                <section className="housemate-chat-view" aria-label={`Demo conversation with ${conversationProfile?.name ?? "match"}`}>
                  <div className="chat-demo-note">A friendly demo chat. No messages are sent to anyone.</div>
                  <div className="housemate-chat-messages" aria-live="polite">
                    {housemateMessages.map((message, index) => (
                      <div className={`housemate-chat-bubble ${message.from}`} key={`${index}-${message.text}`}>
                        {message.text}
                      </div>
                    ))}
                  </div>
                  <form className="housemate-chat-form" onSubmit={sendHousemateMessage}>
                    <input
                      value={housemateMessageInput}
                      onChange={(event) => setHousemateMessageInput(event.target.value)}
                      placeholder="Write a message…"
                      aria-label="Write a demo message"
                    />
                    <button type="submit" aria-label="Send demo message" disabled={!housemateMessageInput.trim()}>
                      Send
                    </button>
                  </form>
                </section>
              )}
            </div>

            <nav className="housemate-tab-bar" aria-label="Housemate app tabs">
              {(["Home", "Housemates", "Homie Chat", "Coming Soon"] as const).map((item) => (
                <button
                  key={item}
                  className={housemateTab === item ? "housemate-tab active" : "housemate-tab"}
                  aria-current={housemateTab === item ? "page" : undefined}
                  onClick={() => {
                    if (item === "Home") {
                      goHome();
                      return;
                    }
                    if (item === "Homie Chat") {
                      navigate("chat");
                      return;
                    }
                    setHousemateTab(item);
                    if (item === "Housemates") setHousematePanel("deck");
                    setMatchVisible(false);
                  }}
                >
                  <span aria-hidden="true">
                    {item === "Home" ? "⌂" : item === "Housemates" ? "♡" : item === "Homie Chat" ? "💬" : "✦"}
                  </span>
                  {item}
                </button>
              ))}
            </nav>

            {matchVisible && activeMatch && (
              <div className="match-overlay" role="dialog" aria-modal="true" aria-labelledby="match-title">
                <div className="match-confetti" aria-hidden="true">✦ ✧ ✦</div>
                <p className="match-kicker">A lovely London connection</p>
                <h2 id="match-title">It’s a Match! 🎉</h2>
                <p className="match-message">
                  {activeMatch.name} is looking for a place in {activeMatch.area} — see if your plans line up.
                </p>
                <div className="match-avatars">
                  <div className="match-avatar-you">You</div>
                  <div
                    className="match-avatar-them"
                    style={{ background: `linear-gradient(145deg, ${activeMatch.colors[0]}, ${activeMatch.colors[1]})` }}
                    aria-label={`${activeMatch.name}'s avatar`}
                  >
                    <img src={activeMatch.photo} alt="" />
                  </div>
                </div>
                <div className="match-actions">
                  <button className="primary" onClick={() => openHousemateChat(activeMatch)}>Send a message</button>
                  <button className="secondary" onClick={() => setMatchVisible(false)}>Keep swiping</button>
                </div>
              </div>
            )}
          </section>
        )}

        {screen === "home" && (
          <section className="home-page">
            <div className="home-hero">
              <div className="home-hero-copy">
                <div className="eyebrow">London living, made easier</div>
                <h1>Find your place in London.</h1>
                <p className="lede">
                  Whether you're looking for a housemate, renting a room, buying a home, or exploring housing advice,
                  Rising Star makes the process simple.
                </p>
                <div className="home-hero-actions">
                  <button className="primary" onClick={openHousemateFeature}>
                    Find a Housemate
                  </button>
                  <button className="secondary" onClick={() => browseListings("All areas", "All")}>
                    Explore Housing Options
                  </button>
                </div>
                <div className="home-trust-note">
                  <span aria-hidden="true">✓</span>
                  Sample listings and roommate matches, clearly labelled
                </div>
              </div>
              <div className="home-hero-visual">
                <img src="/images/leyton-home.jpg" alt="A welcoming London terrace on a leafy residential street" />
                <div className="hero-photo-note">
                  <span className="hero-note-icon" aria-hidden="true">⌂</span>
                  <span><strong>Find a place that fits</strong><small>Homes, housemates and helpful advice</small></span>
                </div>
                <span className="hero-accent-shape" aria-hidden="true" />
              </div>
            </div>

            <section className="home-journeys" aria-labelledby="journeys-heading">
              <div className="home-section-heading">
                <div>
                  <div className="eyebrow">Where would you like to start?</div>
                  <h2 id="journeys-heading">Your next move, made simpler.</h2>
                </div>
                <p>Choose a path. You can explore at your own pace.</p>
              </div>
              <div className="journey-grid">
                <article className="journey-card journey-featured">
                  <div className="journey-icon" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                      <circle cx="18" cy="16" r="7" />
                      <path d="M5 39c0-7 5.8-12 13-12s13 5 13 12M34 12a7 7 0 0 1 0 13m2 3c4.5 1.5 7 5.5 7 11" />
                    </svg>
                  </div>
                  <div className="journey-card-copy">
                    <span className="journey-priority">A great place to start</span>
                    <h3>Find a Housemate</h3>
                    <p>Find a room in a shared home or meet someone to share your place with.</p>
                    <button className="journey-link" onClick={openHousemateFeature}>
                      Explore housemate matching <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  <div className="journey-feature-art" aria-hidden="true">
                    <span className="journey-art-person person-one">✦</span>
                    <span className="journey-art-person person-two">✦</span>
                    <span className="journey-art-home">⌂</span>
                  </div>
                </article>
                <article className="journey-card">
                  <div className="journey-icon" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                      <path d="m5 22 19-16 19 16v20H5V22Z" />
                      <path d="M19 42V27h10v15M11 23h26" />
                    </svg>
                  </div>
                  <h3>Rent a Room or House</h3>
                  <p>Browse sample rentals across Leyton, Walthamstow and Stoke Newington.</p>
                  <button className="journey-link" onClick={() => browseListings("All areas", "Rent")}>
                    Explore rentals <span aria-hidden="true">→</span>
                  </button>
                </article>
                <article className="journey-card">
                  <div className="journey-icon" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                      <path d="m5 22 19-16 19 16v20H5V22Z" />
                      <path d="M19 42V27h10v15M11 23h26M16 17h.01M24 17h.01M32 17h.01" />
                    </svg>
                  </div>
                  <h3>Buy a House</h3>
                  <p>Explore illustrative homes for sale and compare your options.</p>
                  <button className="journey-link" onClick={() => browseListings("All areas", "Buy")}>
                    Explore homes to buy <span aria-hidden="true">→</span>
                  </button>
                </article>
                <article className="journey-card">
                  <div className="journey-icon" aria-hidden="true">
                    <svg viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="19" />
                      <path d="M19 19a5 5 0 1 1 8.4 3.7c-2.2 2-3.4 3-3.4 6.3m0 6h.01" />
                    </svg>
                  </div>
                  <h3>Homie Chat</h3>
                  <p>Get help exploring homes, areas and housemate options.</p>
                  <button className="journey-link" onClick={() => navigate("chat")}>
                    Chat with Homie <span aria-hidden="true">→</span>
                  </button>
                </article>
              </div>
            </section>

          </section>
        )}

        {screen === "chat" && (
          <section>
            <div className="eyebrow">Your London home-finding chat</div>
            <h1>Homie’s got your home hunt.</h1>
            <p className="lede">
              Property, people, commute, budget: we’ll sort the plot before the property plot twist.
            </p>
            <div className="search-progress" aria-label="Search progress">
              <span>{searchStage === "welcome" ? "Welcome" : `Step ${progressIndex + 1} of ${progressStages.length}`}</span>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Home search progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
              >
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <span>{searchStage === "review" ? "Ready for matches" : "Review → matches"}</span>
            </div>
            <div className="conversation-layout">
              <div className="chat-panel">
                <div className="messages" aria-live="polite">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`chat-turn ${message.from === "you" ? "user-turn" : "guide-turn"}`}
                    >
                      <div className={`bubble ${message.from}`}>
                        <small>{message.from === "you" ? "You" : "Homie"}</small>
                        {message.text}
                      </div>
                      {message.listingIds && (
                        <div className="chat-suggestions" aria-label="Suggested sample listings">
                          {message.listingIds.map((id) => {
                            const listing = listings.find((item) => item.id === id);
                            if (!listing) return null;
                            return (
                              <article className="chat-suggestion-card" key={listing.id}>
                                <img src={listing.image} alt={`Representative photo for ${listing.title}`} />
                                <div className="chat-suggestion-copy">
                                  <span className="tag">{listing.area} · {listing.listingType} · {listing.propertyType}</span>
                                  <TagList tags={listing.tags} label="Property features" />
                                  <h3>{listing.title}</h3>
                                  <p>{listing.description}</p>
                                  {listing.housemates && <p><strong>Housemate vibe:</strong> {listing.housemates}</p>}
                                  <strong>{listing.price}</strong>
                                  <div className="room-actions">
                                    <button className="text-link" onClick={() => setRoomModal(listing)}>
                                      Details
                                    </button>
                                    <button
                                      className={saved.includes(listing.id) ? "save active" : "save"}
                                      aria-pressed={saved.includes(listing.id)}
                                      onClick={() => toggleSaved(listing.id)}
                                    >
                                      {saved.includes(listing.id) ? "Saved ✓" : "Shortlist"}
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      )}
                      {message.profileNames && (
                        <div className="chat-profile-grid" aria-label="Suggested housemates">
                          {message.profileNames.map((name) => {
                            const profile = roommateProfiles.find((item) => item.name === name);
                            if (!profile) return null;
                            return (
                              <article className="chat-profile-card" key={profile.name}>
                                <span className="tag">{profile.area} · {profile.budget}</span>
                                <h3>{profile.name}</h3>
                                <p>{profile.bio}</p>
                                <strong>{profile.vibe}</strong>
                                <button
                                  className="text-link"
                                  aria-pressed={housemateShortlist.includes(profile.name)}
                                  onClick={() => requestHousemateConnection(profile.name)}
                                >
                                  {housemateShortlist.includes(profile.name)
                                    ? "Added ✓ · Remove"
                                    : "Add to sample shortlist →"}
                                </button>
                              </article>
                            );
                          })}
                        </div>
                      )}
                      {message.review && (
                        <div className="search-review">
                          <div className="review-heading">
                            <div>
                              <div className="card-kicker">Review answers</div>
                              <h2>Your search, your call.</h2>
                            </div>
                            <span>Change any choice before matching.</span>
                          </div>
                          <div className="review-fields">
                            {reviewFields
                              .filter((field) => field.key !== "roommates" || roommateSearch)
                              .map((field) => (
                                <label key={field.key}>
                                  <span>{field.label}</span>
                                  <select
                                    value={searchAnswers[field.key]}
                                    onChange={(event) => {
                                      const value = event.target.value;
                                      if (field.key === "goal") {
                                        const goal = value as SearchGoal;
                                        const budget = getBudgetChoices(goal)[0];
                                        setSearchAnswers((current) => ({
                                          ...current,
                                          goal,
                                          budget,
                                          housing: getHousingChoices(goal)[0],
                                          roommates: goal === "Rent a room" ? current.roommates : "",
                                        }));
                                        setListingMode(getListingModeFromGoal(goal));
                                      } else {
                                        setSearchAnswers((current) => ({ ...current, [field.key]: value }));
                                      }
                                      if (field.key === "budget") {
                                        setListingMode(getListingModeFromBudget(value));
                                      }
                                      if (field.key === "lifestyle") {
                                        setFilters([getLifestyleTag(value)]);
                                      }
                                    }}
                                  >
                                    {field.options.map((option) => (
                                      <option key={option}>{option}</option>
                                    ))}
                                  </select>
                                </label>
                              ))}
                          </div>
                        </div>
                      )}
                      {message.from === "guide" && index === messages.length - 1 && message.options && (
                        <div className="chat-reply-options" aria-label="Choose a reply">
                          <span>Tap a reply to keep the plot moving</span>
                          <div className="quick-replies">
                            {message.options.map((option) => (
                              <button className="chip" key={option} onClick={() => sendChat(option)}>
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {interestNotice && (
                  <p className="notice" role="status">
                    {interestNotice}
                  </p>
                )}
                <p className="microcopy chat-demo-note">
                  Sample listings and people only. Homie can shortlist, not slide into anyone’s DMs.
                </p>
                <form
                  className="chat-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendChat();
                  }}
                >
                  <label className="sr-only" htmlFor="chat-input">
                    Your answer
                  </label>
                  <input
                    id="chat-input"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask about renting, buying, or housemates…"
                  />
                  <button className="primary" type="submit">
                    Send
                  </button>
                </form>
                <button className="text-link chat-browse-link" onClick={() => browseListings("All areas", "All")}>
                  Prefer to browse every sample listing?
                </button>
              </div>
              <aside className="chat-guide-panel">
                <div className="card-kicker">How this works</div>
                <h2>From “help, London is huge” to a shortlist.</h2>
                <ol>
                  <li>Pick your home or roommate mission.</li>
                  <li>Set budget, area, commute and lifestyle.</li>
                  <li>Tell Homie your housing and people preferences.</li>
                  <li>Review the brief, then meet your sample matches.</li>
                </ol>
                <p>Homie helps you explore your options, refine your search and discover potential matches. Listings and profiles are examples, and Homie is not a lettings agent.</p>
                <section className="chat-upcoming-card" aria-labelledby="chat-upcoming-title">
                  <div className="chat-upcoming-heading">
                    <div>
                      <h3 id="chat-upcoming-title">HomeFinder AI Assistant</h3>
                    </div>
                  </div>
                  <p>An intelligent assistant to help you navigate renting, buying and finding suitable accommodation.</p>
                </section>
              </aside>
            </div>
          </section>
        )}

        {screen === "recommendations" && (
          <section>
            <div className="eyebrow">Based on what you told us</div>
            <h1>Your shortlist era starts now.</h1>
            <p className="lede">
              {filters.length === 0
                ? "Areas are ranked by commute and lifestyle fit, with homes filtered by your budget and selected home type."
                : "Prioritised by your commute, lifestyle and chosen home details."}
            </p>
            <div className="recommendation-actions">
              <span>
                {searchAnswers.goal ? `${searchAnswers.goal} · ${searchAnswers.budget} · ${searchAnswers.commute}` : "Sample recommendations"}
              </span>
              <button className="secondary" onClick={() => navigate("chat")}>
                Change answers / recalculate
              </button>
            </div>
            <div className="filter-bar">
              <strong>Prioritise a vibe:</strong>
              {["Easy commute", "Good value", "Green space", "Local cafés", "Community"].map((filter) => (
                <button
                  key={filter}
                  className={filters.includes(filter) ? "chip active" : "chip"}
                  onClick={() => toggleFilter(filter)}
                  aria-pressed={filters.includes(filter)}
                >
                  {filters.includes(filter) ? "✓ " : ""}
                  {filter}
                </button>
              ))}
            </div>
            <div className="area-grid">
              {recommendedAreas.map((area) => (
                <article className="area-card" key={area.name}>
                  <img src={area.image} alt={`${area.name} neighbourhood`} />
                  <div className="card-body">
                    <div className="card-kicker">A good match for your pace</div>
                    <h2>{area.name}</h2>
                    <p>{area.note}</p>
                    <div className="tags">
                      {area.tags.map((item) => (
                        <span className="tag" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="match-note">
                      <strong>Why it fits</strong>
                      <span>
                        {area.gettingAround} {searchAnswers.commute && `Ranked for your ${searchAnswers.commute} commute.`}
                        {searchAnswers.lifestyle && ` Lifestyle priority: ${searchAnswers.lifestyle.toLocaleLowerCase("en-GB")}.`}
                      </span>
                    </div>
                    <p className="price">
                      {getAreaPriceLabel(area.name, recommendationListingMode, searchAnswers)}
                    </p>
                    <button className="primary" onClick={() => openArea(area.name)}>
                      Explore {area.name} →
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {recommendedAreas.length === 0 && (
              <div className="empty-listings" role="status">
                <h2>No areas match those preferences yet.</h2>
                <p>Clear the filters to see all available neighbourhoods.</p>
                <button className="primary" onClick={() => setFilters([])}>
                  Clear filters
                </button>
              </div>
            )}
            <section className="recommendation-section">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">The places</div>
                  <h2>
                    {recommendationListingMode === "Buy"
                      ? "Homes to buy"
                      : recommendationListingMode === "Rent"
                        ? "Homes to rent"
                        : "Property suggestions"}
                  </h2>
                </div>
                <span>
                  {recommendationListings.length} sample {recommendationListings.length === 1 ? "match" : "matches"}
                </span>
              </div>
              {recommendationListings.length > 0 ? (
                <div className="property-grid">
                  {recommendationListings.slice(0, 3).map((listing) => (
                    <article className="property-card" key={listing.id}>
                      <img src={listing.image} alt={`Representative photo for ${listing.title}`} />
                      <div>
                        <span className="tag">{listing.area} · {listing.listingType} · {listing.propertyType}</span>
                        <TagList tags={listing.tags} label="Property features" />
                        <h3>{listing.title}</h3>
                        <p>{listing.description}</p>
                        {listing.housemates && <p><strong>Housemate vibe:</strong> {listing.housemates}</p>}
                        <strong>{listing.price}</strong>
                        <div className="room-actions">
                          <button className="text-link" onClick={() => setRoomModal(listing)}>
                            Details
                          </button>
                          <button
                            className={saved.includes(listing.id) ? "save active" : "save"}
                            aria-pressed={saved.includes(listing.id)}
                            onClick={() => toggleSaved(listing.id)}
                          >
                            {saved.includes(listing.id) ? "Shortlisted ✓" : "Shortlist"}
                          </button>
                          <button className="secondary" onClick={() => expressPropertyInterest(listing)}>
                            Express interest
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-listings" role="status">
                  <h3>No sample homes match this exact combination yet.</h3>
                  <p>Change your budget, lifestyle, room size or home type to see other options.</p>
                </div>
              )}
              {comparisonListings.length > 1 && (
                <div className="comparison-table-wrap">
                  <h3>Compare your shortlisted places</h3>
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th scope="col">Home</th>
                        <th scope="col">Area</th>
                        <th scope="col">Setup</th>
                        <th scope="col">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonListings.map((listing) => (
                        <tr key={listing.id}>
                          <th scope="row">{listing.title}</th>
                          <td>{listing.area}</td>
                          <td>{listing.listingType} · {listing.propertyType}</td>
                          <td>{listing.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            {roommateSearch && (
              <section className="recommendation-section">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">The people</div>
                    <h2>Roommate suggestions</h2>
                  </div>
                  <span>Sample profiles, not live matches</span>
                </div>
                <p className="microcopy">
                  Compare routines and household vibes. No compatibility score is implied, and no one is contacted.
                </p>
                <div className="chat-profile-grid">
                  {recommendationProfiles.map((profile) => (
                    <article className="chat-profile-card" key={profile.name}>
                      <span className="tag">{profile.area} · {profile.budget}</span>
                      <h3>{profile.name}</h3>
                      <p>{profile.bio}</p>
                      <strong>{profile.vibe}</strong>
                      <TagList tags={profile.tags} label="Household tags" />
                      <button
                        className={housemateShortlist.includes(profile.name) ? "save active" : "save"}
                        aria-pressed={housemateShortlist.includes(profile.name)}
                        onClick={() => requestHousemateConnection(profile.name)}
                      >
                        {housemateShortlist.includes(profile.name) ? "Interest saved ✓" : "Express interest"}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {interestNotice && (
              <p className="notice" role="status">
                {interestNotice}
              </p>
            )}
            <div className="under-actions">
              <button className="text-link" onClick={() => navigate("adjust")}>
                Not quite right? Adjust my search
              </button>
              <button className="text-link" onClick={() => navigate("questions")}>
                Ask a question
              </button>
            </div>
          </section>
        )}

        {screen === "area" && (
          <section>
            <div className="eyebrow">One of your neighbourhood matches</div>
            <h1>{selectedArea}: getting the vibe?</h1>
            <div className="detail-hero">
              <img
                src={currentArea.image}
                alt={`${selectedArea} high street`}
              />
              <div className="summary-card">
                <div className="card-kicker">Why this could feel right</div>
                <h2>A neighbourhood with its own rhythm.</h2>
                <p>{currentArea.overview}</p>
                <div className="tags">
                  {currentArea.tags.slice(0, 2).map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="primary" onClick={() => browseListings(selectedArea, listingMode)}>
                  {listingMode === "Buy"
                    ? "See sample homes to buy →"
                    : listingMode === "Rent"
                      ? "See sample homes to rent →"
                      : "See sample homes and rooms →"}
                </button>
              </div>
            </div>
            <div className="tabs" role="tablist" aria-label={`${selectedArea} information`}>
              {areaTabs.map((item, index) => (
                <button
                  role="tab"
                  id={`area-tab-${index}`}
                  aria-controls="area-tabpanel"
                  aria-selected={tab === item}
                  tabIndex={tab === item ? 0 : -1}
                  className={tab === item ? "active" : ""}
                  onClick={() => setTab(item)}
                  onKeyDown={(event) => {
                    const currentIndex = areaTabs.findIndex((areaTab) => areaTab === item);
                    let nextIndex = currentIndex;
                    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % areaTabs.length;
                    else if (event.key === "ArrowLeft") {
                      nextIndex = (currentIndex - 1 + areaTabs.length) % areaTabs.length;
                    } else if (event.key === "Home") nextIndex = 0;
                    else if (event.key === "End") nextIndex = areaTabs.length - 1;
                    else return;

                    event.preventDefault();
                    const nextTab = areaTabs[nextIndex];
                    setTab(nextTab);
                    event.currentTarget.parentElement
                      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]
                      ?.focus();
                  }}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <div
              className="tab-content fade-in"
              id="area-tabpanel"
              role="tabpanel"
              aria-labelledby={`area-tab-${areaTabs.findIndex((item) => item === tab)}`}
              tabIndex={0}
              key={tab}
            >
              <div>
                <span className="number">01</span>
                <h3>{tab === "Feel" ? "A place that feels lived in" : tab}</h3>
                <p>
                  {currentArea[
                    tab === "Everyday life"
                      ? "everyday"
                      : tab === "Getting around"
                        ? "gettingAround"
                        : tab === "Good to know"
                          ? "goodToKnow"
                          : "feel"
                  ]}
                </p>
              </div>
              <div>
                <span className="number">02</span>
                <h3>A starting point</h3>
                <p>{selectedAreaPrice}. Treat this as sample pricing, not a live listing.</p>
              </div>
            </div>
            {areaListings.length > 0 ? (
              <>
                <h2 className="section-title">
                  Sample {listingMode === "Buy" ? "homes to buy" : listingMode === "Rent" ? "homes to rent" : "homes and rooms"} in {selectedArea}
                </h2>
                <div className="property-grid">
                  {areaListings.map((listing) => (
                    <article className="property-card" key={listing.id}>
                      <img src={listing.image} alt={`Representative photo for ${listing.title}`} />
                      <div>
                        <span className="tag">{listing.listingType} · {listing.propertyType}</span>
                        <TagList tags={listing.tags} label="Property features" />
                        <h3>{listing.title}</h3>
                        <p>{listing.description}</p>
                        <div className="property-card-actions">
                          <strong>{listing.price}</strong>
                          <button
                            className="text-link"
                            onClick={() => browseListings(listing.area, listing.listingType)}
                          >
                            View listing options →
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-listings" role="status">
                <h2>No sample {listingMode === "Buy" ? "homes to buy" : "homes to rent"} in {selectedArea} yet.</h2>
                <p>Switch your rent/buy choice or explore another neighbourhood to see more sample listings.</p>
                <button className="primary" onClick={() => browseListings(selectedArea, "All")}>
                  See all sample listings in {selectedArea}
                </button>
              </div>
            )}
            <div className="under-actions">
              <button className="text-link" onClick={() => navigate("questions")}>
                Ask a question about {selectedArea}
              </button>
            </div>
          </section>
        )}

        {screen === "rooms" && (
          <section>
            <div className="eyebrow">
              {listingMode === "Rent"
                ? listingArea === "All areas" ? "Rentals across London" : `Rentals in ${listingArea}`
                : listingMode === "Buy"
                  ? listingArea === "All areas" ? "Homes for sale across London" : `Homes for sale in ${listingArea}`
                  : listingArea === "All areas" ? "Sample homes across all neighbourhoods" : `${listingArea} homes chosen for your search`}
            </div>
            <h1>{listingMode === "Rent" ? "Find a place to rent." : listingMode === "Buy" ? "Find a home to buy." : "Explore London homes."}</h1>
            <p className="lede">
              {listingMode === "Rent"
                ? "Browse sample rooms and homes for rent. Listings and prices are examples, not live offers; photos are representative, not of specific homes."
                : listingMode === "Buy"
                  ? "Browse sample homes for sale. Listings and prices are examples, not live offers; photos are representative, not of specific homes."
                  : "Browse sample rentals and homes for sale. Listings and prices are examples, not live offers; photos are representative, not of specific homes."}
            </p>
            <div className="listing-filters" aria-label="Filter sample listings">
              <label>
                Neighbourhood
                <select value={listingArea} onChange={(event) => setListingArea(event.target.value)}>
                  <option>All areas</option>
                  {areas.map((area) => (
                    <option key={area.name}>{area.name}</option>
                  ))}
                </select>
              </label>
              {listingMode === "All" && (
                <div className="filter-options" aria-label="Listing type">
                  {(["All", "Rent", "Buy"] as const).map((type) => (
                    <button
                      className={listingMode === type ? "chip active" : "chip"}
                      key={type}
                      aria-pressed={listingMode === type}
                      onClick={() => setListingMode(type)}
                    >
                      {type === "All" ? "Rent or buy" : type === "Rent" ? "To rent" : "To buy"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="room-layout">
              <div>
                <div className="listing-toolbar">
                  <strong>
                    {listingMode === "All" ? "Homes and rooms" : listingMode === "Rent" ? "Places to rent" : "Places to buy"}
                  </strong>
                  <span>{visibleListings.length} sample {visibleListings.length === 1 ? "listing" : "listings"}</span>
                </div>
                {visibleListings.map((listing) => (
                  <article className="room-card" key={listing.id}>
                    <img src={listing.image} alt={`Representative photo for ${listing.title}`} />
                    <div className="room-copy">
                      <span className="tag">{listing.listingType} · {listing.propertyType} · Sample</span>
                      <TagList tags={listing.tags} label="Property features" />
                      <h2>{listing.title}</h2>
                      <p>{listing.place}</p>
                      <p>{listing.description}</p>
                      {listing.housemates && <p><strong>Housemate vibe:</strong> {listing.housemates}</p>}
                      <strong>{listing.price}</strong>
                      <div className="room-actions">
                        <button
                          className="primary"
                          onClick={() => setRoomModal(listing)}
                        >
                          View details
                        </button>
                        <button
                          className={saved.includes(listing.id) ? "save active" : "save"}
                          aria-pressed={saved.includes(listing.id)}
                          onClick={() => toggleSaved(listing.id)}
                        >
                          {saved.includes(listing.id) ? "Saved ✓" : "Shortlist"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {visibleListings.length === 0 && (
                  <div className="empty-listings" role="status">
                    <h2>No sample listings match those filters.</h2>
                    <p>Try another neighbourhood or switch between renting and buying.</p>
                    <button className="primary" onClick={() => { setListingArea("All areas"); setListingMode("All"); }}>
                      Show all sample listings
                    </button>
                  </div>
                )}
              </div>
              <MemoryPanel memory={memory} onAsk={() => navigate("questions")} />
            </div>
            <div className="under-actions">
              <button className="text-link" onClick={() => navigate("adjust")}>
                No match? Adjust my search
              </button>
            </div>
          </section>
        )}

        {screen === "questions" && (
          <section>
            <div className="eyebrow">You don’t have to start again</div>
            <h1>Your questions. Still your context.</h1>
            <p className="lede">Ask about an area, a room or the process. We remember what matters to you.</p>
            <div className="conversation-layout">
              <div className="chat-panel">
                <div className="messages" aria-live="polite">
                  {questionMessages.map((message, index) => (
                    <div className={`bubble ${message.from}`} key={index}>
                      <small>{message.from === "you" ? "You" : "Homie"}</small>
                      {message.text}
                    </div>
                  ))}
                </div>
                <div className="quick-replies">
                  {["Are bills included?", "Can I bring a bike?", "Who would I live with?"].map((text) => (
                    <button
                      className="chip"
                      key={text}
                      onClick={() => sendQuestion(text)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <form
                  className="chat-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendQuestion();
                  }}
                >
                  <input
                    aria-label="Ask your question"
                    value={questionInput}
                    onChange={(event) => setQuestionInput(event.target.value)}
                    placeholder="Ask your question…"
                  />
                  <button className="primary">Send</button>
                </form>
              </div>
              <MemoryPanel memory={memory} />
            </div>
          </section>
        )}

        {screen === "adjust" && (
          <section>
            <div className="eyebrow">Your search can flex</div>
            <h1>Not a perfect match. Still a good next step.</h1>
            <p className="lede">Choose what you’d like to protect and what can move. We’ll take it from there.</p>
            <div className="adjust-grid">
              {[
                { title: "Keep your budget", filter: "Good value", copy: "Focus on neighbourhoods with lower room prices." },
                { title: "Find green space", filter: "Green space", copy: "Prioritise places with parks and room to slow down." },
                { title: "Stay close to cafés", filter: "Local cafés", copy: "Look for areas with independent cafés and local character." },
              ].map(({ title, filter, copy }, index) => (
                <article className="adjust-card" key={title}>
                  <span className="number">0{index + 1}</span>
                  <h2>{title}</h2>
                  <p>{copy}</p>
                  <button className="primary" onClick={() => adjustSearch(filter)}>
                    Try this option →
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {screen === "accessibility" && (
          <section>
            <div className="eyebrow">Your choices, clearly explained</div>
            <h1>Feel at home here, too.</h1>
            <p className="lede">Choose how this experience works for you. Your search stays yours.</p>
            <div className="settings-grid">
              <div className="settings-card">
                <h2>Your viewing preferences</h2>
                <Toggle
                  label="Reduce motion"
                  checked={preferences.reducedMotion}
                  onChange={(checked) => setPreferences({ ...preferences, reducedMotion: checked })}
                />
                <Toggle
                  label="Increase contrast"
                  checked={preferences.highContrast}
                  onChange={(checked) => setPreferences({ ...preferences, highContrast: checked })}
                />
                <fieldset>
                  <legend>Keep me updated by</legend>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={preferences.email}
                      onChange={(event) => setPreferences({ ...preferences, email: event.target.checked })}
                    />
                    Email
                  </label>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={preferences.messages}
                      onChange={(event) => setPreferences({ ...preferences, messages: event.target.checked })}
                    />
                    Message
                  </label>
                </fieldset>
              </div>
              <div className="settings-card">
                <h2>How we use your information</h2>
                <p>
                  This prototype does not send your personal information to a service. The preferences below are
                  saved only in this browser.
                </p>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="data"
                    checked={preferences.data === "essential"}
                    onChange={() => setPreferences({ ...preferences, data: "essential" })}
                  />
                  Essential information only
                </label>
                <label className="radio-row">
                  <input
                    type="radio"
                    name="data"
                    checked={preferences.data === "personalised"}
                    onChange={() => setPreferences({ ...preferences, data: "personalised" })}
                  />
                  Personalise my recommendations
                </label>
                <button
                  className="primary"
                  onClick={() => {
                    savePreferences();
                  }}
                >
                  Save my choices
                </button>
                {preferencesNotice && (
                  <p className="confirmation" role="status">
                    {preferencesNotice}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

      </main>

      <footer>
        <Logo goHome={goHome} />
        <span>Demo prototype: property photos, listings, prices and housemate matches are illustrative sample content.</span>
        <a
          className="photo-credit"
          href="https://commons.wikimedia.org/wiki/File:Dagmar_Terrace,_off_Cross_Street_-_geograph.org.uk_-_5381818.jpg"
          target="_blank"
          rel="noreferrer"
        >
          London home photo: Jim Osley / Geograph, CC BY-SA 2.0
        </a>
        <button className="text-link" onClick={() => navigate("accessibility")}>
          Privacy & accessibility
        </button>
      </footer>

      {roomModal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRoomModal(null);
          }}
        >
          <div
            className="modal fade-in"
            ref={roomModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-title"
          >
            <button
              ref={roomModalCloseRef}
              className="modal-close"
              aria-label="Close listing details"
              onClick={() => setRoomModal(null)}
            >
              Close
            </button>
            <img src={roomModal.image} alt={roomModal.title} />
            <span className="tag">{roomModal.listingType} · {roomModal.homeType} · Sample</span>
            <h2 id="room-title">{roomModal.title}</h2>
            <p>{roomModal.place}</p>
            <p>{roomModal.description}</p>
            {roomModal.housemates && <p><strong>Housemate vibe:</strong> {roomModal.housemates}</p>}
            <strong className="modal-price">{roomModal.price}</strong>
            <button className="primary" onClick={() => toggleSaved(roomModal.id)}>
              {saved.includes(roomModal.id) ? "Remove from shortlist" : "Save to shortlist"}
            </button>
            <button className="secondary" onClick={() => expressPropertyInterest(roomModal)}>
              Express interest (demo)
            </button>
            {interestNotice && <p className="notice" role="status">{interestNotice}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function TagList({ tags, label }: { tags: string[]; label: string }) {
  return (
    <div className="tags listing-tags" aria-label={label}>
      {tags.map((tag) => (
        <span className="tag" key={tag}>{tag}</span>
      ))}
    </div>
  );
}

function MemoryPanel({ memory, onAsk }: { memory: string[]; onAsk?: () => void }) {
  return (
    <aside className="memory-panel">
      <div className="card-kicker">Your search, in your words</div>
      <h2>What I’m remembering</h2>
      <ul>
        {memory.map((item, index) => (
          <li key={`${item}-${index}`}>
            <span>✓</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="microcopy">You can change any of this. Nothing is locked in.</p>
      {onAsk && (
        <button className="text-link" onClick={onAsk}>
          Ask a question →
        </button>
      )}
    </aside>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}

export default App;
