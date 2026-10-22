import { useEffect, useRef, useState } from "react";
import nicosiaRoadProperty from "./imports/nicosia-road-property.jpg";
import stokeNewingtonProperty from "./imports/1100xxs.webp";

type Screen =
  | "landing"
  | "chat"
  | "recommendations"
  | "area"
  | "rooms"
  | "questions"
  | "adjust"
  | "accessibility"
  | "messages"
  | "states";

type ChatMessage = { from: "you" | "guide"; text: string };
type Room = {
  id: string;
  area: string;
  title: string;
  place: string;
  price: string;
  image: string;
  description: string;
};

type ChatIntent = {
  filter: string;
  matches: string[];
  reply: string;
};

const areas = [
  {
    name: "Leyton",
    image: "/images/leyton.png",
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

const rooms = [
  {
    id: "leyton-house",
    area: "Leyton",
    title: "Bright double room",
    place: "Leyton · 4 bedroom house",
    price: "£895 pcm",
    image: "/images/room-leaf.png",
    description: "A calm, light-filled room in a friendly shared home near Francis Road.",
  },
  {
    id: "leyton-flat",
    area: "Leyton",
    title: "Quiet garden room",
    place: "Leyton · 3 bedroom flat",
    price: "£925 pcm",
    image: "/images/room-light.png",
    description: "A generous double room overlooking the garden, with bills included.",
  },
  {
    id: "walthamstow-house",
    area: "Walthamstow",
    title: "Victorian home near the market",
    place: "Walthamstow · 3 bedroom shared house",
    price: "£825 pcm",
    image: nicosiaRoadProperty,
    description: "A characterful shared home close to local shops, cafés and transport.",
  },
  {
    id: "stoke-newington-flat",
    area: "Stoke Newington",
    title: "Leafy street shared home",
    place: "Stoke Newington · 4 bedroom shared house",
    price: "£950 pcm",
    image: stokeNewingtonProperty,
    description: "A bright shared home on a residential street, a short walk from local cafés.",
  },
];

const chatIntents: { label: string; filter: string; keywords: string[] }[] = [
  {
    label: "Keep rent below £900",
    filter: "Good value",
    keywords: ["budget", "rent", "price", "cost", "under 900", "afford"],
  },
  {
    label: "Find green space",
    filter: "Green space",
    keywords: ["green", "park", "garden", "outside"],
  },
  {
    label: "Find independent cafés",
    filter: "Cafés",
    keywords: ["cafe", "cafés", "coffee", "food"],
  },
  {
    label: "Make my commute easier",
    filter: "Easy commute",
    keywords: ["commute", "travel", "train", "tube", "work"],
  },
];

function getChatIntent(message: string): ChatIntent | null {
  const normalize = (value: string) =>
    value
      .toLocaleLowerCase("en-GB")
      .replace(/[£,]/g, "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  const normalized = normalize(message);
  const intent = chatIntents.find(
    (candidate) =>
      normalized === normalize(candidate.label) ||
      candidate.keywords.some((keyword) => normalized.includes(normalize(keyword))),
  );

  if (!intent) return null;

  const matches = areas.filter((area) => area.tags.includes(intent.filter)).map((area) => area.name);
  return {
    filter: intent.filter,
    matches,
    reply: matches.length
      ? `For this demo, I’ve filtered the neighbourhoods to ${matches.join(" and ")}. Choose “Show me my recommendations” to see the sample homes.`
      : "There are no sample neighbourhoods for that preference yet. Try another option.",
  };
}

function getQuestionReply(question: string): string {
  const normalized = question.toLocaleLowerCase("en-GB");
  if (normalized.includes("bill") || normalized.includes("cost")) {
    return "In this sample set, the Quiet garden room in Leyton says bills are included. The other sample listings do not specify bills, so check with the provider.";
  }
  if (normalized.includes("bike") || normalized.includes("cycle")) {
    return "Bike storage is not specified in these sample listings. Please confirm it with the provider before making a decision.";
  }
  if (normalized.includes("who") || normalized.includes("housemate") || normalized.includes("live")) {
    return "The demo does not include housemate profiles. Ask the provider who currently lives in the home and how the household works.";
  }
  return "This is a scripted demo and only has sample property details. Try asking about bills, bike storage or housemates.";
}

const areaTabs = ["Feel", "Everyday life", "Getting around", "Good to know"] as const;

function Logo({ goHome }: { goHome: () => void }) {
  return (
    <button className="logo" onClick={goHome} aria-label="Rising Star Homes, back to home">
      <span className="logo-mark">✦</span>
      <span>Rising Star Homes</span>
    </button>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [history, setHistory] = useState<Screen[]>([]);
  const [mobileNav, setMobileNav] = useState(false);
  const [want, setWant] = useState("Good people, shared snacks");
  const [filters, setFilters] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState("Leyton");
  const [tab, setTab] = useState("Feel");
  const [saved, setSaved] = useState<string[]>([]);
  const [roomModal, setRoomModal] = useState<Room | null>(null);
  const roomModalRef = useRef<HTMLDivElement>(null);
  const roomModalCloseRef = useRef<HTMLButtonElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: "guide", text: "Hey! What’s your non-negotiable: easy commute, cute cafés, or peaceful main-character energy?" },
  ]);
  const [memory, setMemory] = useState<string[]>(["Move within 6–8 weeks"]);
  const [chatInput, setChatInput] = useState("");
  const [questionMessages, setQuestionMessages] = useState<ChatMessage[]>([
    { from: "guide", text: "Ask anything. I’ll answer with your search in mind." },
  ]);
  const [questionInput, setQuestionInput] = useState("");
  const [phoneMessages, setPhoneMessages] = useState<ChatMessage[]>([
    { from: "guide", text: "Hi Maya. Want to pick up your London search?" },
  ]);
  const [phoneInput, setPhoneInput] = useState("");
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    email: true,
    messages: true,
    data: "essential",
  });
  const [preferencesNotice, setPreferencesNotice] = useState("");
  const [demoState, setDemoState] = useState<"empty" | "loading" | "error">("empty");

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
    setScreen("landing");
    setMobileNav(false);
    scrollToTop();
  };

  const goBack = () => {
    const previous = history.at(-1) ?? "landing";
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
    const intent = getChatIntent(clean);
    if (intent) setFilters([intent.filter]);
    setMessages((old) => [
      ...old,
      { from: "you", text: clean },
      {
        from: "guide",
        text:
          intent?.reply ??
          "This is a scripted demo, not an AI chat. Try the budget, green space, café or commute prompts to filter sample homes.",
      },
    ]);
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

  const sendPhoneMessage = () => {
    const clean = phoneInput.trim();
    if (!clean) return;
    setPhoneMessages((old) => [
      ...old,
      { from: "you", text: clean },
      {
        from: "guide",
        text: "This is an example reply. The demo cannot contact providers or fetch live listings.",
      },
    ]);
    setPhoneInput("");
  };

  const recommendedAreas = areas.filter(
    (area) => filters.length === 0 || filters.some((filter) => area.tags.includes(filter)),
  );
  const currentArea = areas.find((area) => area.name === selectedArea) ?? areas[0];
  const areaRooms = rooms.filter((room) => room.area === selectedArea);

  const activeNav =
    screen === "landing"
      ? "Home"
      : ["chat", "recommendations", "area", "rooms", "questions", "adjust"].includes(screen)
        ? "Find a home"
        : screen === "accessibility"
          ? "Accessibility"
          : screen === "messages"
            ? "Messages"
            : "Demo states";

  const navItems: [string, Screen][] = [
    ["Home", "landing"],
    ["Find a home", "chat"],
    ["Messages", "messages"],
    ["Accessibility", "accessibility"],
    ["Demo states", "states"],
  ];

  const toggleFilter = (filter: string) =>
    setFilters((old) => (old.includes(filter) ? old.filter((item) => item !== filter) : [...old, filter]));

  const toggleSaved = (id: string) =>
    setSaved((old) => (old.includes(id) ? old.filter((item) => item !== id) : [...old, id]));

  const openArea = (name: string) => {
    setSelectedArea(name);
    setTab("Feel");
    navigate("area");
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
              onClick={() => (destination === "landing" ? goHome() : navigate(destination))}
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
        {screen !== "landing" && (
          <button className="back-link" onClick={goBack}>
            ← Back
          </button>
        )}

        {screen === "landing" && (
          <section className="landing">
            <div className="eyebrow">London living, less spreadsheet energy</div>
            <h1>Your London home era starts here.</h1>
            <p className="lede">
              Tell us your vibe. We’ll match you with neighbourhoods and sample homes that feel like you — no
              47-tab house hunt required.
            </p>
            <div className="landing-grid">
              <div>
                <h2>What’s the home vibe?</h2>
                <div className="choice-list">
                  {[
                    "Good people, shared snacks",
                    "My own space, my own pace",
                    "Cute local spots, easy commute",
                    "A calmer corner of the city",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => setWant(option)}
                      className={want === option ? "choice active" : "choice"}
                      aria-pressed={want === option}
                    >
                      <span>{option}</span>
                      <span className="choice-dot">{want === option ? "●" : "○"}</span>
                    </button>
                  ))}
                </div>
                <button className="primary wide" onClick={() => navigate("chat")}>
                  Let’s find your place <span>→</span>
                </button>
                <p className="microcopy">No essay-length forms. No pressure. Just the good bits.</p>
              </div>
              <aside className="image-story">
                <img src={nicosiaRoadProperty} alt="A bright London townhouse on a residential street" />
                <div>
                  <span className="tag">Your next chapter, but make it home</span>
                  <h3>Good streets. Better house-hunting energy.</h3>
                  <p>Meet the neighbourhoods and sample homes that could make your everyday feel a little more you.</p>
                </div>
              </aside>
            </div>
          </section>
        )}

        {screen === "chat" && (
          <section>
            <div className="eyebrow">Your search starts with you</div>
            <h1>Tell us what home should feel like.</h1>
            <p className="lede">Pick a prompt or type your vibe. This little demo keeps it simple and low-stakes.</p>
            <div className="conversation-layout">
              <div className="chat-panel">
                <div className="messages" aria-live="polite">
                  {messages.map((message, index) => (
                    <div key={index} className={`bubble ${message.from}`}>
                      <small>{message.from === "you" ? "You" : "Rising Star"}</small>
                      {message.text}
                    </div>
                  ))}
                </div>
                <p className="microcopy chat-demo-note">
                  Scripted demo only. Choose a prompt below to filter sample homes; no AI service is used.
                </p>
                <div className="quick-replies">
                  {chatIntents.map(({ label }) => (
                    <button className="chip" key={label} onClick={() => sendChat(label)}>
                      {label}
                    </button>
                  ))}
                </div>
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
                    placeholder="Type what matters to you…"
                  />
                  <button className="primary" type="submit">
                    Send
                  </button>
                </form>
                <button className="primary next-cta" onClick={() => navigate("recommendations")}>
                  Show me my recommendations →
                </button>
              </div>
              <MemoryPanel memory={[want, ...memory]} onAsk={() => navigate("questions")} />
            </div>
          </section>
        )}

        {screen === "recommendations" && (
          <section>
            <div className="eyebrow">Based on what you told us</div>
            <h1>Your shortlist era starts now.</h1>
            <p className="lede">
              {filters.length === 0
                ? "Not a ranking — just different versions of the life you described."
                : "The neighbourhoods below match at least one of your selected vibes."}
            </p>
            <div className="filter-bar">
              <strong>Fine-tune these:</strong>
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
                      <span>Easy links, local character and room to settle in.</span>
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
                  See available rooms →
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
            {areaRooms.length > 0 ? (
              <>
                <h2 className="section-title">Sample rooms in {selectedArea}</h2>
                <div className="property-grid">
                  {areaRooms.map((room) => (
                    <article className="property-card" key={room.id}>
                      <img src={room.image} alt={room.title} />
                      <div>
                        <span className="tag">Sample listing</span>
                        <h3>{room.title}</h3>
                        <p>{room.description}</p>
                        <button className="text-link" onClick={() => navigate("rooms")}>
                          View rooms →
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-listings" role="status">
                <h2>No sample rooms are listed for {selectedArea} yet.</h2>
                <p>The demo currently includes room listings for Leyton only.</p>
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
            <div className="eyebrow">{selectedArea} homes chosen for your search</div>
            <h1>Potential new fave place.</h1>
            <p className="lede">Sample homes with the useful details up front. Doom-scrolling not invited.</p>
            <div className="room-layout">
              <div>
                <div className="listing-toolbar">
                  <strong>Rooms that could fit you</strong>
                  <span>{areaRooms.length} sample listings</span>
                </div>
                {areaRooms.map((room) => (
                  <article className="room-card" key={room.id}>
                    <img src={room.image} alt={room.title} />
                    <div className="room-copy">
                      <span className="tag">Sample listing</span>
                      <h2>{room.title}</h2>
                      <p>{room.place}</p>
                      <p>{room.description}</p>
                      <strong>{room.price}</strong>
                      <div className="room-actions">
                        <button
                          className="primary"
                          onClick={() => setRoomModal(room)}
                        >
                          View room
                        </button>
                        <button
                          className={saved.includes(room.id) ? "save active" : "save"}
                          aria-pressed={saved.includes(room.id)}
                          onClick={() => toggleSaved(room.id)}
                        >
                          {saved.includes(room.id) ? "Saved ✓" : "Shortlist"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {areaRooms.length === 0 && (
                  <div className="empty-listings" role="status">
                    <h2>No sample rooms are listed for {selectedArea} yet.</h2>
                    <p>The demo currently includes room listings for Leyton only.</p>
                    <button className="primary" onClick={() => navigate("recommendations")}>
                      Explore other areas
                    </button>
                  </div>
                )}
              </div>
              <MemoryPanel memory={[want, ...memory]} onAsk={() => navigate("questions")} />
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
                      <small>{message.from === "you" ? "You" : "Rising Star"}</small>
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
              <MemoryPanel memory={[want, ...memory]} />
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

        {screen === "messages" && (
          <section>
            <div className="eyebrow">The same help, in a familiar place</div>
            <h1>Your London search, where you chat.</h1>
            <p className="lede">Pick up the conversation without losing the choices you’ve already made.</p>
            <div className="messaging-layout">
              <div className="message-copy">
                <h2>Same search. Only the context you choose.</h2>
                <p>Ask a quick question, check a room or change direction. Your guide remembers the useful bits.</p>
                <ul className="feature-list">
                  <li>Recommendations shaped around you</li>
                  <li>Simple example replies, shaped around your search</li>
                  <li>Easy to pause and pick up later</li>
                </ul>
              </div>
              <div className="phone">
                <div className="phone-header">
                  <span className="logo-mark">✦</span>
                  <div>
                    <strong>Rising Star Homes</strong>
                    <small>Example conversation</small>
                  </div>
                </div>
                <div className="phone-messages" aria-live="polite">
                  {phoneMessages.map((message, index) => (
                    <div className={`bubble ${message.from}`} key={index}>
                      {message.text}
                    </div>
                  ))}
                </div>
                <form
                  className="phone-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendPhoneMessage();
                  }}
                >
                  <input
                    aria-label="Message Rising Star Homes"
                    value={phoneInput}
                    onChange={(event) => setPhoneInput(event.target.value)}
                    placeholder="Write a message…"
                  />
                  <button className="send-round">→</button>
                </form>
              </div>
            </div>
          </section>
        )}

        {screen === "states" && (
          <section>
            <div className="eyebrow">Thoughtful, even when things change</div>
            <h1>A helpful next step, in every state.</h1>
            <p className="lede">A small demonstration of how the experience responds when there’s nothing to show yet.</p>
            <div className="state-switcher">
              {(["empty", "loading", "error"] as const).map((state) => (
                <button
                  className={demoState === state ? "chip active" : "chip"}
                  onClick={() => setDemoState(state)}
                  key={state}
                >
                  {state[0].toUpperCase() + state.slice(1)}
                </button>
              ))}
            </div>
            <div className={`state-card ${demoState}`}>
              {demoState === "empty" && (
                <>
                  {saved.length === 0 ? (
                    <>
                      <span className="state-icon">⌂</span>
                      <h2>Nothing shortlisted yet.</h2>
                      <p>Save a sample room and it will appear here for this visit.</p>
                      <button className="primary" onClick={() => navigate("recommendations")}>
                        Explore recommendations
                      </button>
                    </>
                  ) : (
                    <>
                      <h2>Your shortlist</h2>
                      <p>{saved.length} sample {saved.length === 1 ? "room" : "rooms"} saved for this visit.</p>
                      <div className="shortlist-list">
                        {rooms
                          .filter((room) => saved.includes(room.id))
                          .map((room) => (
                            <div className="shortlist-item" key={room.id}>
                              <strong>{room.title}</strong>
                              <span>{room.price}</span>
                              <div className="room-actions">
                                <button className="primary" onClick={() => setRoomModal(room)}>
                                  View details
                                </button>
                                <button className="save" onClick={() => toggleSaved(room.id)}>
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </>
              )}
              {demoState === "loading" && (
                <>
                  <span className="loader" />
                  <h2>Finding the useful bits.</h2>
                  <p>We’re matching your choices to places that could feel right.</p>
                </>
              )}
              {demoState === "error" && (
                <>
                  <span className="state-icon">!</span>
                  <h2>That didn’t quite work.</h2>
                  <p>Your choices are safe. Return to your recommendations when you’re ready to try again.</p>
                  <button className="primary" onClick={() => navigate("recommendations")}>
                    Return to recommendations
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </main>

      <footer>
        <Logo goHome={goHome} />
        <span>Demo prototype: chat and room listings use sample content.</span>
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
              aria-label="Close room details"
              onClick={() => setRoomModal(null)}
            >
              Close
            </button>
            <img src={roomModal.image} alt={roomModal.title} />
            <span className="tag">Sample listing</span>
            <h2 id="room-title">{roomModal.title}</h2>
            <p>{roomModal.place}</p>
            <p>{roomModal.description}</p>
            <strong className="modal-price">{roomModal.price}</strong>
            <button className="primary" onClick={() => toggleSaved(roomModal.id)}>
              {saved.includes(roomModal.id) ? "Remove from shortlist" : "Save to shortlist"}
            </button>
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
