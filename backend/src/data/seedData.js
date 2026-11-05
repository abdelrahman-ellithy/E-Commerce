const image = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;

export const seedProducts = [
  {
    name: 'Aura Wireless Headphones',
    description:
      'Immersive over-ear headphones with adaptive noise cancellation, 40-hour battery life, and memory-foam cushions designed for all-day listening. Includes a hard-shell travel case and USB-C fast charging.',
    brand: 'Auralis',
    category: 'Audio',
    price: 149,
    compareAtPrice: 199,
    stock: 24,
    image: image('1505740420928-5e560c06d30e'),
    images: [
      image('1505740420928-5e560c06d30e'),
      image('1583394838336-acd977736f90'),
    ],
    featured: true,
  },
  {
    name: 'Pulse Mini Speaker',
    description:
      'A pocket-sized Bluetooth speaker with surprisingly deep bass, IP67 water resistance, and 18 hours of playback. Pair two speakers together for a wider stereo soundstage.',
    brand: 'Auralis',
    category: 'Audio',
    price: 79,
    compareAtPrice: 99,
    stock: 35,
    image: image('1608043152269-423dbba4e7e1'),
    images: [image('1608043152269-423dbba4e7e1')],
    featured: false,
  },
  {
    name: 'Drift ANC Earbuds',
    description:
      'Featherweight true wireless earbuds with hybrid active noise cancellation, transparency mode, and a compact charging case that delivers up to 30 hours of total listening time.',
    brand: 'Auralis',
    category: 'Audio',
    price: 119,
    stock: 4,
    image: image('1590658268037-6bf12165a8df'),
    images: [image('1590658268037-6bf12165a8df')],
    featured: true,
  },
  {
    name: 'Orbit Smartwatch',
    description:
      'A refined everyday smartwatch with a sapphire crystal display, built-in GPS, heart-rate and sleep tracking, and a seven-day battery. Works with iOS and Android.',
    brand: 'Northline',
    category: 'Wearables',
    price: 229,
    compareAtPrice: 279,
    stock: 16,
    image: image('1546868871-7041f2a55e12'),
    images: [
      image('1546868871-7041f2a55e12'),
      image('1523275335684-37898b6baf30'),
    ],
    featured: true,
  },
  {
    name: 'Heritage Leather Watch',
    description:
      'A classic three-hand watch with a brushed stainless-steel case, sapphire-coated glass, and a vegetable-tanned leather strap that develops a unique patina over time.',
    brand: 'Northline',
    category: 'Wearables',
    price: 189,
    stock: 9,
    image: image('1523275335684-37898b6baf30'),
    images: [image('1523275335684-37898b6baf30')],
    featured: false,
  },
  {
    name: 'Cloudstep Runner',
    description:
      'A responsive daily trainer built on a lightweight foam midsole with a breathable knit upper. Designed for road runs, gym sessions, and everything in between.',
    brand: 'Stride',
    category: 'Footwear',
    price: 129,
    compareAtPrice: 159,
    stock: 30,
    image: image('1542291026-7eec264c27ff'),
    images: [image('1542291026-7eec264c27ff')],
    featured: true,
  },
  {
    name: 'Canvas Low-Top Sneaker',
    description:
      'A timeless low-top silhouette made from heavyweight organic canvas with a cushioned insole and vulcanized rubber outsole. An easy match for almost any outfit.',
    brand: 'Stride',
    category: 'Footwear',
    price: 74,
    stock: 0,
    image: image('1560769629-975ec94e6a86'),
    images: [image('1560769629-975ec94e6a86')],
    featured: false,
  },
  {
    name: 'Aperture X100 Camera',
    description:
      'A compact mirrorless camera with a 26MP APS-C sensor, a bright fixed 23mm lens, and film-inspired color profiles. Manual dials make every shot feel intentional.',
    brand: 'Lumen',
    category: 'Cameras',
    price: 899,
    stock: 5,
    image: image('1516035069371-29a1b244cc32'),
    images: [image('1516035069371-29a1b244cc32')],
    featured: false,
  },
  {
    name: 'Everyday Commuter Backpack',
    description:
      'A weather-resistant 22L backpack with a padded 16-inch laptop sleeve, quick-access front pocket, and a luggage pass-through. Built for the daily commute and weekend trips.',
    brand: 'Roam',
    category: 'Bags',
    price: 89,
    compareAtPrice: 110,
    stock: 22,
    image: image('1553062407-98eeb64c6a62'),
    images: [image('1553062407-98eeb64c6a62')],
    featured: true,
  },
  {
    name: 'Weekender Duffel',
    description:
      'A carry-on friendly duffel crafted from durable recycled canvas with leather trim. Features a separate shoe compartment and a removable padded shoulder strap.',
    brand: 'Roam',
    category: 'Bags',
    price: 139,
    stock: 11,
    image: image('1590874103328-eac38a683ce7'),
    images: [image('1590874103328-eac38a683ce7')],
    featured: false,
  },
  {
    name: 'Horizon Polarized Sunglasses',
    description:
      'Lightweight acetate frames with polarized lenses that cut glare without distorting color. Includes a protective microfiber pouch and a hard case.',
    brand: 'Solace',
    category: 'Accessories',
    price: 69,
    stock: 40,
    image: image('1572635196237-14b3f281503f'),
    images: [image('1572635196237-14b3f281503f')],
    featured: false,
  },
  {
    name: 'Minimal Leather Wallet',
    description:
      'A slim bifold wallet made from full-grain leather, with RFID shielding and room for six cards plus folded bills. Designed to disappear into your pocket.',
    brand: 'Solace',
    category: 'Accessories',
    price: 49,
    compareAtPrice: 65,
    stock: 18,
    image: image('1627123424574-724758594e93'),
    images: [image('1627123424574-724758594e93')],
    featured: false,
  },
  {
    name: 'Lounge Accent Chair',
    description:
      'A sculptural accent chair with a solid oak frame, woven upholstery, and a gently reclined seat. The perfect reading corner companion for modern living spaces.',
    brand: 'Forma',
    category: 'Home',
    price: 349,
    compareAtPrice: 429,
    stock: 7,
    image: image('1592078615290-033ee584e267'),
    images: [image('1592078615290-033ee584e267')],
    featured: true,
  },
  {
    name: 'Halo Table Lamp',
    description:
      'A dimmable table lamp with a warm, diffused glow and a powder-coated steel base. Three brightness levels make it equally suited to late-night reading and ambient light.',
    brand: 'Forma',
    category: 'Home',
    price: 89,
    stock: 3,
    image: image('1507473885765-e6ed057f782c'),
    images: [image('1507473885765-e6ed057f782c')],
    featured: false,
  },
  {
    name: 'Tactile Mechanical Keyboard',
    description:
      'A compact 75% mechanical keyboard with hot-swappable switches, PBT keycaps, and both Bluetooth and USB-C connectivity. Quiet enough for the office, satisfying enough for home.',
    brand: 'Keystroke',
    category: 'Workspace',
    price: 159,
    compareAtPrice: 189,
    stock: 13,
    image: image('1587829741301-dc798b83add3'),
    images: [image('1587829741301-dc798b83add3')],
    featured: false,
  },
  {
    name: 'Walnut Desk Organizer',
    description:
      'A solid walnut organizer that keeps pens, cards, cables, and a phone neatly in place. Finished by hand with a natural oil that highlights the grain.',
    brand: 'Keystroke',
    category: 'Workspace',
    price: 59,
    stock: 26,
    image: image('1497215728101-856f4ea42174'),
    images: [image('1497215728101-856f4ea42174')],
    featured: false,
  },
];

export const seedReviews = [
  {
    productName: 'Aura Wireless Headphones',
    rating: 5,
    comment:
      'The noise cancellation is genuinely impressive and the battery lasts me almost a full work week. Very comfortable too.',
  },
  {
    productName: 'Cloudstep Runner',
    rating: 4,
    comment:
      'Light, responsive, and true to size. I would have liked a slightly wider toe box, but they are great for daily runs.',
  },
  {
    productName: 'Everyday Commuter Backpack',
    rating: 5,
    comment:
      'Fits my laptop, lunch, and gym clothes without feeling bulky. The quick-access pocket is a small detail I now use every day.',
  },
  {
    productName: 'Lounge Accent Chair',
    rating: 5,
    comment:
      'Beautiful craftsmanship and even more comfortable than it looks. It arrived well packaged and was easy to assemble.',
  },
];

export const sampleOrderBlueprints = [
  {
    items: [
      { productName: 'Aura Wireless Headphones', quantity: 1 },
      { productName: 'Halo Table Lamp', quantity: 1 },
    ],
    status: 'delivered',
    isPaid: true,
    daysAgo: 9,
  },
  {
    items: [{ productName: 'Cloudstep Runner', quantity: 1 }],
    status: 'shipped',
    isPaid: true,
    daysAgo: 4,
  },
  {
    items: [
      { productName: 'Everyday Commuter Backpack', quantity: 2 },
      { productName: 'Minimal Leather Wallet', quantity: 1 },
    ],
    status: 'processing',
    isPaid: false,
    daysAgo: 1,
  },
];
