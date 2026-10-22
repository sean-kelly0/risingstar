import { useEffect, useRef, useState } from "react";
import nicosiaRoadProperty from "./imports/nicosia-road-property.jpg";
import stokeNewingtonProperty from "./imports/1100xxs.webp";

type Screen =
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
  housemates?: string;
};

type SearchStage = "welcome" | "goal" | "budget" | "area" | "commute" | "lifestyle" | "housing" | "roommates" | "review";
type SearchGoal = "Property + roommate" | "Property only" | "Room in shared property" | "Roommate for existing property";
type SearchAnswers = {
  goal: SearchGoal | "";
  budget: string;
  area: string;
  commute: string;
  lifestyle: string;
  housing: string;
  roommates: string;
};

const areas = [
  {
    name: "Leyton",
    image: "/images/leyton-home.jpg",
    note: "Creative, connected and still down to earth.",
    price: "Sample rooms from £895 pcm",
    tags: ["Village feel", "Easy commute", "Independent", "Good value"],
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
    tags: ["Green space", "Good value", "Community", "Easy commute"],
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
    tags: ["Calm", "Cafés", "Character"],
    overview: "Leafy streets, independent cafés and a slower rhythm in a characterful part of north London.",
    feel: "Leafy residential streets offer a calmer pace, with independent places close by.",
    everyday: "Local cafés, shops and green spaces give the area an easy neighbourhood pace.",
    gettingAround: "Overground and bus routes connect the neighbourhood to the wider city.",
    goodToKnow: "The quieter residential streets sit close to a lively local high street.",
  },
];

const listings: Listing[] = [
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
    title: "Quiet garden room",
    place: "Leyton · 3 bedroom flat",
    price: "£925 pcm",
    image: "/images/properties/leyton-garden-room.jpg",
    description: "A generous double room overlooking the garden, with bills included.",
    listingType: "Rent",
    homeType: "Room",
    housemates: "Two considerate housemates, shared garden and relaxed weeknight energy.",
  },
  {
    id: "walthamstow-house",
    area: "Walthamstow",
    title: "Victorian home near the market",
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
];

const roommateProfiles = [
  {
    name: "Alex",
    area: "Leyton",
    budget: "Up to £950 pcm",
    bio: "Creative, friendly and big on shared dinners — equally happy with a quiet night in.",
    vibe: "Social, tidy, relaxed",
  },
  {
    name: "Sam",
    area: "Walthamstow",
    budget: "Up to £900 pcm",
    bio: "Works hybrid, loves a weekend market wander and appreciates clear, kind communication.",
    vibe: "Easy-going, considerate",
  },
  {
    name: "Jamie",
    area: "Stoke Newington",
    budget: "Up to £1,000 pcm",
    bio: "Into cooking, local cafés and keeping home peaceful after a busy day.",
    vibe: "Calm, sociable, clean",
  },
];

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
  return "Homie’s running on lovingly scripted demo info, not mind-reading powers. Try asking about bills, bike storage or housemates.";
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

const areaTabs = ["Feel", "Everyday life", "Getting around", "Good to know"] as const;

const searchChoices = {
  goal: [
    "Property + roommate",
    "Property only",
    "Room in shared property",
    "Roommate for existing property",
  ],
  area: ["Leyton", "Walthamstow", "Stoke Newington"],
  commute: ["Central London", "City / Canary Wharf", "Mostly remote / flexible"],
  lifestyle: ["Green space & calm", "Cafés & local food", "Easy commute & energy"],
  housing: ["Room in a shared home", "Entire home", "Shared house with common space"],
  roommates: ["Sociable, shared dinners", "Friendly but independent", "Quiet, tidy household"],
} as const;

function getBudgetChoices(goal: SearchGoal | "") {
  if (goal === "Property only") {
    return ["Rent under £900 pcm", "Rent £900–£1,500 pcm", "Buy up to £600k"];
  }
  if (goal === "Room in shared property" || goal === "Roommate for existing property") {
    return ["Under £900 pcm", "£900–£1,500 pcm", "Flexible budget"];
  }
  return ["Rent under £900 pcm", "Rent £900–£1,500 pcm", "Flexible budget"];
}

function getHousingChoices(goal: SearchGoal | "") {
  if (goal === "Roommate for existing property") {
    return ["Room available now", "Room available soon", "I have a whole place to share"];
  }
  if (goal === "Room in shared property") {
    return ["Single room", "Double room", "Flexible on room type"];
  }
  return [...searchChoices.housing];
}

function getSearchPrompt(
  stage: SearchStage,
  answers?: SearchAnswers,
): Pick<ChatMessage, "text" | "options"> | null {
  const prompts: Partial<Record<SearchStage, Pick<ChatMessage, "text" | "options">>> = {
    welcome: {
      text: "Hey, I’m Homie 🏠 Your London home hunt just got a sidekick. I’ll ask a few quick questions, then bring back sample areas, homes and potential housemates. No AI, no awkward DMs, no 47-tab spiral.",
      options: ["Start my search", "How does it work?", "Browse sample listings"],
    },
    goal: {
      text: "First plot point: what are you looking for? Choose the closest fit; we’ll fine-tune the details as we go.",
      options: [...searchChoices.goal],
    },
    budget: {
      text:
        answers?.goal === "Roommate for existing property"
          ? "What monthly budget should your potential housemate fit? Pick the closest one; we’ll keep the numbers visible."
          : "What budget should I keep in mind? Choose the closest fit for now — we’re not doing rent-price jump scares.",
      options: getBudgetChoices(answers?.goal ?? ""),
    },
    area: {
      text: "Where should Homie drop the map pin? Pick the area you’re curious about; you can still change it later.",
      options: [...searchChoices.area],
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
        answers?.goal === "Roommate for existing property"
          ? "Tell me about the place you’ve already got so I can look for the right person, not the wrong floor plan."
          : answers?.goal === "Room in shared property"
            ? "What kind of room are you hoping to find?"
            : "What kind of housing setup feels right?",
      options: getHousingChoices(answers?.goal ?? ""),
    },
    roommates: {
      text: "Last people-fit question: what housemate energy would make home feel good?",
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
    area: `${selected}, locked in. Let’s make sure the commute doesn’t become your new full-time hobby.`,
    commute: "Commute noted. Now for the everyday-life stuff that makes a place feel like yours.",
    lifestyle: "Vibe check: passed. Let’s match that to the right kind of home setup.",
    housing: "Home setup noted.",
    roommates: "Housemate vibe noted. No awkward flatmate auditions required — just a useful starting point.",
  };
  const nextStageCopy: Partial<Record<SearchStage, string>> = {
    budget: "Next, let’s set the budget.",
    area: "Now, pick an area to explore.",
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
  const [screen, setScreen] = useState<Screen>("chat");
  const [history, setHistory] = useState<Screen[]>([]);
  const [mobileNav, setMobileNav] = useState(false);
  const [searchStage, setSearchStage] = useState<SearchStage>("welcome");
  const [searchAnswers, setSearchAnswers] = useState<SearchAnswers>({
    goal: "",
    budget: "",
    area: "",
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
    setScreen("chat");
    setMobileNav(false);
    scrollToTop();
  };

  const goBack = () => {
    const previous = history.at(-1) ?? "chat";
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
          text: "Homie will help set your goal, budget, area and day-to-day preferences, then show sample homes and potential roommate matches. You can review or change everything before seeing recommendations — no commitment, no plot twist.",
          options: ["Start my search", "How does it work?", "Browse sample listings"],
        });
        setChatInput("");
        return;
      }
      if (!normalized.includes("start")) {
        appendGuide({ from: "guide", ...getSearchPrompt("welcome")! });
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
        setListingArea(searchAnswers.area || "All areas");
        setSelectedArea(searchAnswers.area || "Leyton");
        setChatInput("");
        navigate("recommendations");
        return;
      }
      if (normalized.includes("start over")) {
        setSearchAnswers({ goal: "", budget: "", area: "", commute: "", lifestyle: "", housing: "", roommates: "" });
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
      appendGuide({ from: "guide", ...getSearchPrompt("review")! });
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
        text:
          faqReply ??
          "Homie’s keeping this demo to clear choices, not a choose-your-own-adventure with 900 endings. Tap the closest fit; you can tweak it in your review.",
        options: [...stageChoices],
      });
      setChatInput("");
      return;
    }

    const answerKey: Record<Exclude<SearchStage, "welcome" | "review">, keyof SearchAnswers> = {
      goal: "goal",
      budget: "budget",
      area: "area",
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
        nextStage = "budget";
        break;
      case "budget":
        setListingMode(selected.startsWith("Buy") ? "Buy" : "Rent");
        nextStage = "area";
        break;
      case "area":
        setSelectedArea(selected);
        nextStage = "commute";
        break;
      case "commute":
        nextStage = "lifestyle";
        break;
      case "lifestyle":
        setFilters([selected.includes("Green") ? "Green space" : selected.includes("Cafés") ? "Cafés" : "Easy commute"]);
        nextStage = "housing";
        break;
      case "housing": {
        const needsRoommate =
          updatedAnswers.goal !== "Property only" || selected.includes("shared");
        nextStage = needsRoommate ? "roommates" : "review";
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

  const recommendedAreas = [...areas].sort((first, second) => {
    const firstScore =
      Number(first.name === searchAnswers.area) * 2 +
      Number(filters.some((filter) => first.tags.includes(filter)));
    const secondScore =
      Number(second.name === searchAnswers.area) * 2 +
      Number(filters.some((filter) => second.tags.includes(filter)));
    return secondScore - firstScore;
  });
  const currentArea = areas.find((area) => area.name === selectedArea) ?? areas[0];
  const areaListings = listings.filter((listing) => listing.area === selectedArea);
  const roommateSearch =
    searchAnswers.goal !== "Property only" ||
    searchAnswers.housing.toLocaleLowerCase("en-GB").includes("shared");
  const recommendationListingMode: "All" | "Rent" | "Buy" = searchAnswers.budget
    ? searchAnswers.budget.startsWith("Buy")
      ? "Buy"
      : "Rent"
    : listingMode;
  const recommendationListings = listings.filter(
    (listing) => {
      if (searchAnswers.goal === "Roommate for existing property") return false;
      if (searchAnswers.area && listing.area !== searchAnswers.area) return false;
      if (recommendationListingMode !== "All" && listing.listingType !== recommendationListingMode) return false;
      const price = Number(listing.price.replace(/[£,]/g, "").match(/\d+/)?.[0]);
      if (
        listing.listingType === "Rent" &&
        searchAnswers.budget.toLocaleLowerCase("en-GB").includes("under £900") &&
        price > 900
      ) {
        return false;
      }
      if (
        listing.listingType === "Rent" &&
        searchAnswers.budget.includes("£900–£1,500") &&
        (price < 900 || price > 1500)
      ) {
        return false;
      }
      if (listing.listingType === "Buy" && searchAnswers.budget.startsWith("Buy") && price > 600000) {
        return false;
      }
      if (
        (searchAnswers.goal === "Room in shared property" ||
          searchAnswers.housing.includes("shared")) &&
        listing.homeType !== "Room"
      ) {
        return false;
      }
      if (searchAnswers.housing === "Entire home" && listing.homeType !== "Entire home") return false;
      return true;
    },
  );
  const comparisonListings = listings.filter((listing) => saved.includes(listing.id));
  const roommateStyleTerms = searchAnswers.roommates.startsWith("Sociable")
    ? ["social", "sociable"]
    : searchAnswers.roommates.startsWith("Friendly")
      ? ["easy-going", "considerate"]
      : ["calm", "clean"];
  const roommateMatchScore = (profile: (typeof roommateProfiles)[number]) =>
    Number(profile.area === searchAnswers.area) * 2 +
    Number(roommateStyleTerms.some((term) => profile.vibe.toLocaleLowerCase("en-GB").includes(term)));
  const recommendationProfiles = [...roommateProfiles].sort(
    (first, second) => roommateMatchScore(second) - roommateMatchScore(first),
  );
  const progressStages: SearchStage[] = [
    "goal",
    "budget",
    "area",
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
    { key: "area", label: "Area", options: searchChoices.area },
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

  const activeNav =
    ["chat", "recommendations", "area", "questions", "adjust"].includes(screen)
      ? "Chat"
      : screen === "rooms"
        ? "Browse homes"
        : "Accessibility";

  const navItems: [string, Screen][] = [
    ["Chat", "chat"],
    ["Browse homes", "rooms"],
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

  return (
    <div className="app">
      <header className="site-header">
        <Logo goHome={goHome} />
        <nav className={mobileNav ? "nav open" : "nav"} aria-label="Main navigation">
          {navItems.map(([label, destination]) => (
            <button
              key={label}
              className={activeNav === label ? "nav-link active" : "nav-link"}
              onClick={() => navigate(destination)}
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

      <main key={screen} className="screen fade-in">
        {screen !== "chat" && (
          <button className="back-link" onClick={goBack}>
            ← Back
          </button>
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
                                  <span className="tag">{listing.area} · {listing.listingType} · {listing.homeType}</span>
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
                                        setSearchAnswers((current) => ({ ...current, goal, budget }));
                                        setListingMode(budget.startsWith("Buy") ? "Buy" : "Rent");
                                      } else {
                                        setSearchAnswers((current) => ({ ...current, [field.key]: value }));
                                      }
                                      if (field.key === "area") {
                                        setSelectedArea(value);
                                        setListingArea(value);
                                      }
                                      if (field.key === "budget") {
                                        setListingMode(value.startsWith("Buy") ? "Buy" : "Rent");
                                      }
                                      if (field.key === "lifestyle") {
                                        setFilters([
                                          value.includes("Green")
                                            ? "Green space"
                                            : value.includes("Cafés")
                                              ? "Cafés"
                                              : "Easy commute",
                                        ]);
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
                <p>No AI, live listings or messages sent. Homie is a demo sidekick, not a lettings agent.</p>
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
                ? "Area matches are prioritised by your location and lifestyle choices, with sample homes and people-fit below."
                : "Prioritised by your selected vibes and search answers."}
            </p>
            <div className="recommendation-actions">
              <span>
                {searchAnswers.goal ? `${searchAnswers.goal} · ${searchAnswers.budget} · ${searchAnswers.area}` : "Sample recommendations"}
              </span>
              <button className="secondary" onClick={() => navigate("chat")}>
                Change answers / recalculate
              </button>
            </div>
            <div className="filter-bar">
              <strong>Prioritise a vibe:</strong>
              {["Easy commute", "Good value", "Green space", "Cafés", "Community"].map((filter) => (
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
                        {area.gettingAround} {searchAnswers.commute && `Your commute focus: ${searchAnswers.commute}.`}
                      </span>
                    </div>
                    <p className="price">{area.price}</p>
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
                  <h2>Property suggestions</h2>
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
                        <span className="tag">{listing.area} · {listing.listingType} · {listing.homeType}</span>
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
                  <p>Change your answers to widen the area, budget or housing setup.</p>
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
                          <td>{listing.listingType} · {listing.homeType}</td>
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
                <button className="primary" onClick={() => navigate("rooms")}>
                  See sample homes and rooms →
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
                <p>{currentArea.price}. Treat this as sample pricing, not a live listing.</p>
              </div>
            </div>
            {areaListings.length > 0 ? (
              <>
                <h2 className="section-title">Sample homes and rooms in {selectedArea}</h2>
                <div className="property-grid">
                  {areaListings.map((listing) => (
                    <article className="property-card" key={listing.id}>
                      <img src={listing.image} alt={`Representative photo for ${listing.title}`} />
                      <div>
                        <span className="tag">{listing.listingType} · {listing.homeType}</span>
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
                <h2>No sample listings for {selectedArea} yet.</h2>
                <p>Explore another neighbourhood to see the demo homes and rooms.</p>
                <button className="primary" onClick={() => navigate("recommendations")}>
                  Explore other areas
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
              {listingArea === "All areas" ? "Sample homes across all neighbourhoods" : `${listingArea} homes chosen for your search`}
            </div>
            <h1>Rent, buy, or find your people.</h1>
            <p className="lede">
              Browse sample rooms, shared homes and places to buy. Listings and prices are demo content, not live offers; photos are representative, not of specific homes.
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
                      <span className="tag">{listing.listingType} · {listing.homeType} · Sample</span>
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
                { title: "Stay close to cafés", filter: "Cafés", copy: "Look for areas with independent cafés and local character." },
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
