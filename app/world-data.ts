export type Product = {
  name: string;
  type: string;
  note: string;
  brand?: string;
  price?: string;
  department?: string;
  signal?: string;
  palette?: string[];
};

export type World = {
  id: string;
  number: string;
  name: string;
  kicker: string;
  description: string;
  manifesto: string;
  image: string;
  imageMobile: string;
  alt: string;
  heroImage: string;
  heroImageMobile: string;
  heroAlt: string;
  heroFocalPoint: string;
  heroCaption: string;
  supportingImages?: Array<{ src: string; alt: string; label: string }>;
  catalog?: {
    eyebrow: string;
    heading: string;
    filters: NonNullable<Product["department"]>[];
  };
  accent: string;
  accentSoft: string;
  gallery: {
    x: number;
    background: string;
    blob1: string;
    blob2: string;
  };
  products: Product[];
};

export const worlds: World[] = [
  {
    id: "arcade",
    number: "01",
    name: "Arcade",
    kicker: "Controllers, retro forms, playful hardware",
    description: "Controllers, retro forms and playful hardware chosen for tactile, social play.",
    manifesto: "Arcade is about tactile play: unusual controllers, social accessories and hardware that turns a screen into an occasion. The edit moves between precise everyday tools and strange forms worth leaving out on a desk.",
    image: "/media/worlds/arcade-portal.webp",
    imageMobile: "/media/worlds/arcade-portal-mobile.webp",
    alt: "Electric paper collage of abstract controllers, cyan cable, a red optical viewer and yellow racing ring on green",
    heroImage: "/media/worlds/arcade-hero.webp",
    heroImageMobile: "/media/worlds/arcade-hero-mobile.webp",
    heroAlt: "Layered control-deck collage of abstract game hardware, acrylic reflections and torn grid paper on green",
    heroFocalPoint: "64% 56%",
    heroCaption: "Control deck / tactile play",
    accent: "#b8ff45",
    accentSoft: "#0b2f20",
    gallery: { x: -0.9, background: "#123d2a", blob1: "#3f9850", blob2: "#9ee84d" },
    catalog: {
      eyebrow: "The opening play edit",
      heading: "Eight tactile pieces,\nmade for shared play.",
      filters: ["Controllers", "Hardware", "Accessories"],
    },
    products: [
      { brand: "NINTENDO", name: "Nintendo Switch 2 Pro Controller", type: "Wireless controller", department: "Controllers", price: "US $99.99", note: "The precise, everyday controller in the edit, with rear GL/GR buttons and a cleaner desktop presence than a pair of detached Joy-Con.", signal: "Compatibility gate: Nintendo Switch 2 only; confirm firmware, warranty route and battery-forwarding eligibility.", palette: ["#191919", "#75f4e8", "#f1f0e9"] },
      { brand: "NINTENDO", name: "Joy-Con 2 — Blue / Light Yellow", type: "Two-player controller pair", department: "Controllers", price: "US $99.99", note: "A high-colour pair selected for shared play and for the magnetic attachment system that visually defines Nintendo's second-generation hardware.", signal: "Order only after confirming the recipient already owns a Nintendo Switch 2 system.", palette: ["#39a9ff", "#f5e44d", "#222222"] },
      { brand: "NINTENDO", name: "Nintendo GameCube Controller", type: "Wireless retro controller", department: "Controllers", note: "The most sculptural object in Arcade: an intentionally asymmetric GameCube form revived for Nintendo Classics play.", signal: "Nintendo Switch Online membership and supported software may be required; verify account region before sourcing.", palette: ["#684bb0", "#a8d44d", "#d7d2c9"] },
      { brand: "NINTENDO", name: "Nintendo 64 Controller", type: "Wireless retro controller", department: "Controllers", note: "A three-grip controller whose unusual geometry makes the retro premise immediately legible without relying on nostalgic copy.", signal: "Purchase eligibility can depend on a paid Nintendo Switch Online membership.", palette: ["#b5b1a7", "#1a1a1a", "#4b77cf"] },
      { brand: "NINTENDO", name: "Virtual Boy for Nintendo Switch", type: "Tabletop stereoscopic viewer", department: "Hardware", note: "A strange red viewing object that turns a revived Nintendo Classics library into a small, deliberate tabletop ritual.", signal: "This is an accessory, not a standalone console; confirm the supported system, software and subscription before choosing it.", palette: ["#ef2f3b", "#090909", "#8d1720"] },
      { brand: "NINTENDO / HORI", name: "Piranha Plant Camera", type: "Character USB camera", department: "Hardware", note: "The playful outlier: a functional video camera disguised as a Mario enemy, with enough character to live on a shelf between sessions.", signal: "Confirm Nintendo Switch 2 camera compatibility; treat video quality as functional rather than creator-grade.", palette: ["#dd3f3f", "#53a74a", "#f3e8d5"] },
      { brand: "NINTENDO", name: "Joy-Con 2 Wheel — Set of 2", type: "Racing controller accessory", department: "Accessories", price: "US $24.99", note: "A low-risk social add-on that gives motion steering a clearer physical gesture without pretending to be a simulation wheel.", signal: "Joy-Con 2 controllers are not included; bundle only with a compatible setup.", palette: ["#202020", "#ecebe5", "#75f4e8"] },
      { brand: "NINTENDO", name: "Switch 2 All-In-One Carrying Case", type: "System and dock travel case", department: "Accessories", note: "A practical close to the edit: one structured case for the console, dock, controllers and cables rather than several loose pouches.", signal: "Confirm final packed weight; it is designed for transport, not drop-proof shipping protection.", palette: ["#202020", "#777777", "#f0efe9"] },
    ],
  },
  {
    id: "scent",
    number: "02",
    name: "Scent",
    kicker: "Perfume, mist, oil, atmosphere",
    description: "Playful gourmand fragrance built around fruit, tea, vanilla and atmosphere.",
    manifesto: "Scent begins with one tightly defined house rather than a wall of vague fragrance names. The collection moves from bright fruit and airy tea to creamy, close-wearing gourmand notes with an easy sense of character.",
    image: "/media/worlds/scent-portal.webp",
    imageMobile: "/media/worlds/scent-portal-mobile.webp",
    alt: "Gourmand paper collage of abstract perfume glass, banana, coconut, tea and lacquer-red forms",
    heroImage: "/media/worlds/scent-hero.webp",
    heroImageMobile: "/media/worlds/scent-hero-mobile.webp",
    heroAlt: "Floating fragrance collage of clear glass geometry, fruit, tea leaves, foil and liquid light",
    heroFocalPoint: "58% 50%",
    heroCaption: "Glass cloud / eight notes",
    accent: "#ff9a71",
    accentSoft: "#48132d",
    gallery: { x: 0.8, background: "#260817", blob1: "#8f224c", blob2: "#f56f5e" },
    catalog: {
      eyebrow: "The opening fragrance edit",
      heading: "Eight bright scents,\nfrom fruit to tea.",
      filters: ["Perfume", "Body", "Sets"],
    },
    products: [
      { brand: "LE MONDE GOURMAND", name: "Banane Délice Eau de Parfum", type: "Banana gourmand · 30 ml", department: "Perfume", price: "US $28", note: "A deliberately cheerful banana fragrance chosen to make the world feel more like a candy-coloured discovery shelf than a formal perfume counter.", signal: "Sample or split first when possible; sweet fruit accords are especially skin- and climate-dependent.", palette: ["#f4dc3e", "#fff0a5", "#e36a64"] },
      { brand: "LE MONDE GOURMAND", name: "Lait de Coco Eau de Parfum", type: "Coconut gourmand · 30 ml", department: "Perfume", price: "US $28", note: "Creamy coconut gives the opening edit an easy, sun-warmed anchor without leaning on a conventional beach-cologne story.", signal: "Heat can alter fragrance in transit; quote only with temperature and carrier risk made explicit.", palette: ["#f2eadc", "#d5b791", "#87c8c1"] },
      { brand: "LE MONDE GOURMAND", name: "Crème Vanille Eau de Parfum", type: "Vanilla gourmand · 30 ml", department: "Perfume", price: "US $28", note: "The familiar note in the group, included as a useful baseline against which the fruit, tea and darker compositions can be understood.", signal: "Avoid blind bulk orders: vanilla preference ranges from airy to densely sugary.", palette: ["#efe2bd", "#c58b58", "#6f3c2a"] },
      { brand: "LE MONDE GOURMAND", name: "Mélodie de Thé Eau de Parfum", type: "Tea fragrance · 30 ml", department: "Perfume", price: "US $30", note: "A tea-led counterpoint that cools the gourmand palette and gives the catalog a less literal, more atmospheric direction.", signal: "Best positioned for customers asking for fresh tea rather than dense dessert notes.", palette: ["#b8c68d", "#e7dcb9", "#6b7350"] },
      { brand: "LE MONDE GOURMAND", name: "Rouge de Coeur Eau de Parfum", type: "Fruity floral · 30 ml", department: "Perfume", price: "US $30", note: "A lacquer-red, evening-facing option that adds saturated fruit and floral drama without changing the accessible price language of the edit.", signal: "Keep description note-led; do not imply longevity or projection without wearer testing.", palette: ["#c6203d", "#ff6d73", "#401325"] },
      { brand: "LE MONDE GOURMAND", name: "Potion Enchantée Eau de Parfum", type: "Limited fantasy gourmand · 30 ml", department: "Perfume", price: "US $30", note: "The theatrical bottle in the edit, selected for gift appeal and visual storytelling rather than an unsupported promise of rarity.", signal: "Recheck collection status before quote; licensed and limited packaging can disappear quickly.", palette: ["#6f49a8", "#ea8ac4", "#2c163d"] },
      { brand: "LE MONDE GOURMAND", name: "Fleur de Blonde Perfumed Body Oil", type: "Scented body oil · 118 ml", department: "Body", price: "US $30", note: "A softer-format fragrance product for layering and close wear, useful for customers who do not want another conventional spray bottle.", signal: "Confirm ingredients and patch-test guidance; scented body products are not fragrance-free skincare.", palette: ["#f6c4d0", "#e8c499", "#8e5971"] },
      { brand: "LE MONDE GOURMAND", name: "Le Petit Duo Set — Tea Party", type: "Two-piece discovery set", department: "Sets", price: "US $30", note: "A sensible first discovery set: two smaller scent experiences lower the blind-buy risk and make the category feel exploratory rather than acquisitive.", signal: "The easiest entry point for comparing two related scent directions.", palette: ["#b9c18d", "#d9917e", "#f4e5bf"] },
    ],
  },
  {
    id: "carry",
    number: "03",
    name: "Carry",
    kicker: "Luggage, bags, packing systems",
    description: "One-bag travel systems built around modular packing and lighter movement.",
    manifesto: "Carry is designed around one-bag movement rather than anonymous black luggage. Travel packs, day bags and colour-coded organisers form a practical system that can flex between a weekend and a longer route.",
    image: "/media/worlds/carry-portal.webp",
    imageMobile: "/media/worlds/carry-portal-mobile.webp",
    alt: "Bright travel collage of backpack panels, packing cubes, straps, route paper and zipper details",
    heroImage: "/media/worlds/carry-hero.webp",
    heroImageMobile: "/media/worlds/carry-hero-mobile.webp",
    heroAlt: "Exploded open-backpack collage with colour-coded packing cubes, straps and route fragments",
    heroFocalPoint: "62% 54%",
    heroCaption: "Open system / one-bag travel",
    accent: "#72d7f2",
    accentSoft: "#123151",
    gallery: { x: -0.7, background: "#0d4f87", blob1: "#238fca", blob2: "#72d7f2" },
    catalog: {
      eyebrow: "The opening travel edit",
      heading: "Eight pieces to pack,\npersonalise and keep moving.",
      filters: ["Travel Packs", "Day Bags", "Organisers"],
    },
    products: [
      { brand: "TORTUGA", name: "Travel Together Lite", type: "Two-person carry-on bundle", department: "Travel Packs", price: "US $425 sale", note: "A pair of lightweight carry-on backpacks for two travellers, selected as a more useful shared-trip proposition than a second wheeled case.", signal: "Fit and colour must be chosen for each traveller; a bundle is not a substitute for two individual fit checks.", palette: ["#222827", "#6f7d65", "#d7b26e"] },
      { brand: "TORTUGA", name: "Lite Backpack 40L", type: "Lightweight carry-on travel pack", department: "Travel Packs", price: "US $250", note: "A lighter, simpler 40-litre option for travellers who value low starting weight over the Pro's more elaborate harness and organisation.", signal: "Fit gate: collect torso length, height and packed-weight expectation before recommending Lite over Pro.", palette: ["#29312f", "#92a083", "#e7dcc5"] },
      { brand: "TORTUGA", name: "Expandable Backpack", type: "Weekend-to-week carry-on", department: "Travel Packs", price: "US $250", note: "A flexible pack that expands by 20%, useful for short departures and shopping-heavy returns without moving to checked luggage by default.", signal: "Expanded depth can change cabin compliance; verify the bag in both states before travel.", palette: ["#384541", "#d9795f", "#d8c486"] },
      { brand: "TORTUGA", name: "Daily Carry Pro", type: "Maximum personal-item backpack", department: "Day Bags", note: "An under-seat pack for flight essentials, a laptop and short trips—the strongest alternative for customers who do not need a 40-litre system.", signal: "Personal-item limits vary more than carry-on limits; check the exact airline allowance, not the marketing category.", palette: ["#242a2a", "#5e766d", "#d8a66b"] },
      { brand: "TORTUGA", name: "Daypack Pro", type: "Pack-flat 16-inch laptop bag", department: "Day Bags", price: "US $125", note: "A one-pound day bag that packs flat inside a larger travel backpack, then becomes the useful city layer on arrival.", signal: "Confirm actual laptop dimensions and loaded comfort; ultralight construction does not make every heavy carry sensible.", palette: ["#202728", "#778a78", "#e4d5b8"] },
      { brand: "TORTUGA", name: "Travel Sling", type: "Passport and essentials sling", department: "Day Bags", note: "A small hands-free layer for passport, phone, keys and wallet, selected because it works alongside a backpack without competing shoulder straps.", signal: "Position as quick-access organisation, not anti-theft equipment.", palette: ["#1f2627", "#d5755b", "#d8c26c"] },
      { brand: "TORTUGA", name: "Packing Cubes — Set of 3", type: "Modular clothing organisers", department: "Organisers", price: "US $85", note: "One large and two small structured cubes give the catalog its clearest modular packing system without adding mechanical complexity.", signal: "Designed around Tortuga pack dimensions; measure before recommending them for another bag.", palette: ["#53685f", "#d5ad6c", "#d8d2c3"] },
      { brand: "TORTUGA", name: "Compression Packing Cubes — Set of 2", type: "Compressible clothing organisers", department: "Organisers", price: "US $90", note: "Two zip-compression cubes for longer trips, included as an option rather than an automatic claim that tighter packing is always better.", signal: "Compression reduces volume, not weight; keep the airline mass limit visible in the recommendation.", palette: ["#33433e", "#cf765b", "#d9c089"] },
    ],
  },
  {
    id: "arena",
    number: "04",
    name: "Arena",
    kicker: "Rare kits, court shoes, match-day gear",
    description: "Independent performance footwear, licensed jerseys and expressive training gear.",
    manifesto: "Arena looks beyond the standard sports wall: women-specific court and football footwear, club and throwback jerseys, and useful training gear selected for a clear reason—not scarcity theatre.",
    image: "/media/worlds/arena-portal.webp",
    imageMobile: "/media/worlds/arena-portal-mobile.webp",
    alt: "Kinetic sports collage of jersey mesh, shoe tread, laces, ticket fragments and acid court lines",
    heroImage: "/media/worlds/arena-hero.webp",
    heroImageMobile: "/media/worlds/arena-hero-mobile.webp",
    heroAlt: "Diagonal match-day collage of mesh, court-shoe tread, laces, tape and supporter ephemera",
    heroFocalPoint: "56% 52%",
    heroCaption: "Match cut / independent sport",
    accent: "#dfff43",
    accentSoft: "#202a11",
    gallery: { x: 1.05, background: "#10150b", blob1: "#394d17", blob2: "#e05b3f" },
    catalog: {
      eyebrow: "The opening performance edit",
      heading: "Nine performance pieces,\nfrom court to terrace.",
      filters: ["Jerseys", "Footwear", "Gear"],
    },
    products: [
      { brand: "SAN DIEGO FC / EIGHTEEN THREADS", name: "2025 Inaugural Primary Authentic Jersey", type: "Limited authentic football jersey", department: "Jerseys", price: "US $170 sale", note: "A first-season club shirt with an embedded NFC ownership chip. The inaugural context and official-club provenance make it more compelling than an arbitrary colourway.", signal: "Collector note: confirm the NFC feature and size before sourcing; customised jerseys are handled in-store only.", palette: ["#39d0c5", "#f06a42", "#f2eee5"] },
      { brand: "MITCHELL & NESS / SPORTS FEVER", name: "Mitch Richmond 1992–93 Swingman Jersey", type: "Sacramento Kings throwback", department: "Jerseys", price: "US $139.99", note: "A licensed early-nineties Kings throwback chosen for its less obvious player story and black, purple and silver graphic language—not merely for a retro label.", signal: "Buy only from the recorded licensed retailer; dated, traded-player and clearance jerseys may be final sale.", palette: ["#2b1747", "#c7c9ce", "#101010"] },
      { brand: "MITCHELL & NESS / SPORTS FEVER", name: "Isaiah Rider 2005–06 Swingman Jersey", type: "Minnesota Timberwolves throwback", department: "Jerseys", price: "US $139.99", note: "A licensed white Hardwood Classics jersey with a deep-cut roster reference—more specific than the standard superstar throwback.", signal: "Treat it as a size-specific collector piece rather than a permanent core product.", palette: ["#f2f0e8", "#0d4d37", "#14356d"] },
      { brand: "MOOLAH KICKS", name: "Neovolt Pro V3 — Cobalt Reign", type: "Women-specific basketball shoe", department: "Footwear", price: "US $134.99", note: "A basketball shoe developed around women’s biomechanics and foot shape rather than a scaled-down men’s last. The cobalt colourway gives the world its clearest court-energy cue.", signal: "Fit gate: collect court position, usual size, width and brace use before sourcing. Performance footwear is never a blind-size purchase.", palette: ["#2855d9", "#71b9ff", "#f2eee7"] },
      { brand: "UNITUS", name: "Judah 1 Low — Spotless", type: "Independent basketball shoe", department: "Footwear", price: "US $99", note: "A low-profile performance basketball silhouette from an independent athlete-founded label, selected as a cleaner alternative to the familiar signature-shoe wall.", signal: "Performance claim discipline: position this as a sourcing candidate, not a promise of superior cushioning or injury prevention.", palette: ["#eee9dc", "#a9a79f", "#242424"] },
      { brand: "JOMA", name: "Top Flex 26 — Limited Edition Black", type: "Limited-edition futsal shoe", department: "Footwear", price: "US $86", note: "A genuinely court-specific indoor football shoe from Joma’s established Top Flex line. The black limited edition is quieter than a neon drop but still has a clear collector cue.", signal: "Use only for indoor or futsal surfaces; confirm width and usual court-shoe size.", palette: ["#101010", "#4e4e4e", "#dfff43"] },
      { brand: "PREACH ATHLETIC LAB", name: "Classic Mesh Basketball Shorts", type: "Seven-inch training short", department: "Gear", price: "US $40", note: "A breathable, uncomplicated practice short from a small athletic label. It earns a place here as usable training kit rather than logo-heavy fan merchandise.", signal: "The seven-inch inseam is the defining fit detail; verify waist and preferred court length before sourcing.", palette: ["#191919", "#dfff43", "#e6e1d8"] },
      { brand: "PREACH ATHLETIC LAB", name: "Performance Cotton Headbands", type: "Court and training accessory", department: "Gear", price: "US $7", note: "A low-risk, useful add-on for basketball sessions and warm-weather training—the smallest practical object in the Arena edit.", signal: "Best treated as an add-on to a larger kit rather than the main request.", palette: ["#f0eadf", "#d8654d", "#254b88"] },
      { brand: "PREACH ATHLETIC LAB", name: "The Flip Cap", type: "Reversible training cap", department: "Gear", price: "US $33", note: "A playful reversible cap that can move between training, travel and match day without pretending to be technical equipment.", signal: "The lifestyle counterpoint in the edit: keep it visually loud, functionally honest and separate from protective headgear.", palette: ["#e9543f", "#3355a5", "#f5d94e"] },
    ],
  },
  {
    id: "adorn",
    number: "05",
    name: "Adorn",
    kicker: "Colour, character, ornament",
    description: "Expressive makeup and statement accessories chosen for colour and character.",
    manifesto: "Adorn brings strong colour, distinctive formulas and sculptural accessories into one dressing-table edit. Each piece has a clear point of view without asking the rest of the look to compete.",
    image: "/media/worlds/adorn-collage.webp",
    imageMobile: "/media/worlds/adorn-portal-mobile.webp",
    alt: "Bright paper collage of plum eye makeup, gold and floral earrings, cream blush, colour swatches, and torn paper on a plum-to-cobalt field",
    heroImage: "/media/worlds/adorn-hero.webp",
    heroImageMobile: "/media/worlds/adorn-hero-mobile.webp",
    heroAlt: "Dressing-table collage of plum pigment, sculptural gold earrings, flowers and cobalt paper",
    heroFocalPoint: "55% 48%",
    heroCaption: "Dressing-table burst / colour",
    supportingImages: [
      { src: "/media/worlds/adorn-makeup-collage.webp", alt: "Scrapbook collage of plum eye makeup, coral cream blush, and pigment swatches", label: "Makeup edit" },
      { src: "/media/worlds/adorn-accessories-collage.webp", alt: "Scrapbook collage of sculptural gold and floral resin earrings", label: "Accessories edit" },
    ],
    catalog: {
      eyebrow: "The opening adornment edit",
      heading: "Eight considered pieces,\ncolour first.",
      filters: ["Makeup", "Accessories"],
    },
    accent: "#e38cad",
    accentSoft: "#3b1729",
    gallery: { x: -0.7, background: "#1d0e18", blob1: "#7a274f", blob2: "#e49bb5" },
    products: [
      { brand: "KULFI BEAUTY", name: "Underlined Kajal Eyeliner", type: "Cream kajal · eye", department: "Makeup", price: "US $20", note: "A South Asian-rooted kajal with modern colour payoff and a softer, more playful approach to the familiar eye pencil.", signal: "Choose Cheeky Chiku for warm brown or Purply Pataka for an editorial plum.", palette: ["#3a211b", "#63354f", "#dca06c"] },
      { brand: "KULFI BEAUTY", name: "Main Match Concealer", type: "Hydrating concealer · complexion", department: "Makeup", price: "US $26", note: "A self-setting complexion formula built around undertones often flattened by conventional shade systems.", signal: "The practical anchor: shade-match carefully and do not treat one swatch as universal.", palette: ["#8d5335", "#bd7a54", "#e2b28d"] },
      { brand: "PHYTOSURGENCE", name: "Skin Spark Blush Balm", type: "Cream blush · cheek", department: "Makeup", price: "CA $22", note: "Complex, skin-aware blush shades that move beyond safe pinks and reward a light, stippled application.", signal: "Community praise centres on unusual olive-friendly shades; start with one carefully chosen colour.", palette: ["#a84943", "#89515c", "#b56e52"] },
      { brand: "PHYTOSURGENCE", name: "Flash Florescence Shadow", type: "Cream shadow · eye", department: "Makeup", price: "CA $22", note: "Nuanced metallics and smoky neutrals for a one-pot eye that feels considered rather than conventionally polished.", signal: "Works best in a restrained palette of plum, bronze and smoky green.", palette: ["#6f5d69", "#96815d", "#3d4b50"] },
      { brand: "COCOACENTRIC", name: "Orbital Hoop", type: "Sculptural hoop · ear", department: "Accessories", price: "US $128", note: "A clean orbit with enough scale to become the architecture of a simple look.", signal: "Use as the restrained counterpoint to high-colour makeup.", palette: ["#c69a45", "#6d5126", "#f2d88a"] },
      { brand: "COCOACENTRIC", name: "Kasha Coin Fringe", type: "Fringe earring · ear", department: "Accessories", price: "US $128", note: "Movement, sound and light in one piece; the strongest evening proposition in the opening edit.", signal: "Best worn as the focal point with simple makeup and an open neckline.", palette: ["#d1a34a", "#29201b", "#f0c86a"] },
      { brand: "COCOACENTRIC", name: "Lotus Orchid Earrings", type: "Resin floral stud · ear", department: "Accessories", price: "US $55 sale", note: "Hand-painted resin orchids turn the current floral revival into a graphic, wearable object.", signal: "The playful day-to-night piece: pair with bare skin and a precise kajal line.", palette: ["#e66d91", "#5969b2", "#ddb955"] },
      { brand: "COCOACENTRIC", name: "Solara Hoop", type: "Statement hoop · ear", department: "Accessories", price: "US $118", note: "A warm, solar form selected for impact without the visual noise of stones or logos.", signal: "The everyday statement: strongest with plum, terracotta and smoked-gold makeup.", palette: ["#b77b2d", "#e5bb67", "#58361e"] },
    ],
  },
  {
    id: "little",
    number: "06",
    name: "Little",
    kicker: "Wooden worlds for small people",
    description: "Colourful open-ended toys for building, arranging and inventing stories.",
    manifesto: "Little favours toys that make room for a child's own story: wooden railways, dollhouses and outdoor role play with visible materials, clear age guidance and enough visual character to grow into a room.",
    image: "/media/worlds/little-portal.webp",
    imageMobile: "/media/worlds/little-portal-mobile.webp",
    alt: "Playful paper collage of wooden train track, crane, dollhouse, figures, wheel and confetti",
    heroImage: "/media/worlds/little-hero.webp",
    heroImageMobile: "/media/worlds/little-hero-mobile.webp",
    heroAlt: "Handmade miniature-city collage built from wooden train, dollhouse and outdoor-play forms",
    heroFocalPoint: "46% 56%",
    heroCaption: "Build-anything city / ages three plus",
    accent: "#ffd73e",
    accentSoft: "#3d245f",
    gallery: { x: 0.55, background: "#5c3a70", blob1: "#7a3355", blob2: "#78529a" },
    catalog: {
      eyebrow: "The opening playroom edit",
      heading: "Eight wooden worlds,\nfor ages three and up.",
      filters: ["Railways", "Dollhouses", "Pretend Play"],
    },
    products: [
      { brand: "GIANT BEAN", name: "117-Piece Busy Port City Train Set", type: "Wooden railway · ages 3+", department: "Railways", price: "US $59.99", note: "A harbour-led train world with lift bridge, container ship and tower crane—specific enough to drive stories beyond a generic loop of track.", signal: "Review every included small part and follow the manufacturer's age guidance.", palette: ["#2e84b8", "#efba38", "#d75c4c"] },
      { brand: "GIANT BEAN", name: "94-Piece Modern City Train Set", type: "Wooden railway · ages 3–8", department: "Railways", price: "US $49.99", note: "A denser city layout for children who prefer roads, buildings and everyday movement to a fantasy theme.", signal: "Confirm current contents and battery-free status before quote; product bundles can change without a new title.", palette: ["#4a89bd", "#f1cd54", "#8cc278"] },
      { brand: "GIANT BEAN", name: "72-Piece Fire Rescue Train Set", type: "Wooden railway · ages 3+", department: "Railways", price: "US $42.99", note: "A compact emergency-services set with a multi-level fire station, chosen for collaborative rescue stories rather than a stereotyped gender label.", signal: "Adult assembly and supervision guidance must travel with the product; retain the original packaging and instructions.", palette: ["#e3433e", "#f1c33d", "#366fa8"] },
      { brand: "GIANT BEAN", name: "42-Piece Farm Train Set", type: "Wooden railway · ages 3–8", department: "Railways", price: "US $35.99", note: "The smaller entry set pairs track building with animals and farm routines, offering a less spatially demanding starting point.", signal: "This set includes a battery engine; confirm the battery type and adult setup guidance.", palette: ["#75a84d", "#e7b33c", "#b56843"] },
      { brand: "GIANT BEAN", name: "Modern Candy Dollhouse", type: "Wooden dollhouse · ages 3+", department: "Dollhouses", price: "US $109.99 sale", note: "A bright architectural playhouse with rounded candy colours, selected as the graphic centre of Little rather than a miniature beige interior.", signal: "Large-package gate: verify assembled dimensions, freight class and replacement-part support before purchase.", palette: ["#f68d9c", "#f3cc4c", "#73c8c2"] },
      { brand: "GIANT BEAN", name: "Sagewood Dollhouse", type: "44-piece wooden dollhouse · ages 3+", department: "Dollhouses", price: "US $169.99", note: "A calmer, natural-material counterpoint with enough furniture and figures to begin play without a separate first accessory order.", signal: "Check the current component list so the furniture and figures match the intended play setup.", palette: ["#91a77c", "#dbcaa3", "#b66d57"] },
      { brand: "GIANT BEAN", name: "Wooden Dollhouse Family — Set of 7", type: "Poseable play figures · ages 3+", department: "Dollhouses", price: "US $29.99", note: "A useful narrative add-on that makes an empty house playable while keeping the family roles open to the child's own arrangement.", signal: "Small-parts warning applies; never position this set for children below the manufacturer's stated age.", palette: ["#d98c72", "#6ea7a1", "#e1bd54"] },
      { brand: "GIANT BEAN", name: "Outdoor Mud Kitchen", type: "Water-and-sand play station · ages 3+", department: "Pretend Play", price: "US $109.99 sale", note: "An outdoor counter with water tap and barbecue details that supports messy, process-led play rather than another screen-bound activity.", signal: "Adult assembly, weather exposure and dimensional freight make this a request-only item, not a default recommendation.", palette: ["#6ea75a", "#da7b48", "#efd05f"] },
    ],
  },
];

export function getWorld(id: string) {
  const aliases: Record<string, string> = {
    gather: "arcade",
    restore: "scent",
    ritual: "carry",
    roam: "arena",
    wear: "adorn",
    wonder: "little",
  };
  return worlds.find((world) => world.id === (aliases[id] ?? id));
}
