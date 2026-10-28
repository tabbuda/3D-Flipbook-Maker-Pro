import { PageBlock, PageBlockType } from '../types/flipbook';

export interface BlockMeta {
  type: PageBlockType;
  label: string;
  category: 'headings' | 'text' | 'cards' | 'media' | 'interactive' | 'ornament';
  description: string;
  icon: string;
  badge?: string;
}

export const BLOCK_CATEGORIES = [
  { id: 'all', label: 'All Components' },
  { id: 'headings', label: 'Headings & Tags' },
  { id: 'text', label: 'Text & Editorial' },
  { id: 'cards', label: 'Grid Cards & Lists' },
  { id: 'media', label: 'Media & Author' },
  { id: 'interactive', label: 'Interactive & Info' },
  { id: 'ornament', label: 'Dividers & Imprints' },
] as const;

export const COMPONENT_CATALOG: BlockMeta[] = [
  // HEADINGS
  {
    type: 'chapter-header',
    label: 'Chapter Name / Tag',
    category: 'headings',
    description: 'Chapter prefix (e.g. Chapter 01) with top eyebrow tag',
    icon: 'Bookmark',
    badge: 'Structure',
  },
  {
    type: 'heading-1',
    label: 'Heading 1 (Hero Title)',
    category: 'headings',
    description: 'Large elegant editorial title for page hero sections',
    icon: 'Heading1',
    badge: 'Large',
  },
  {
    type: 'heading-2',
    label: 'Heading 2 (Section Title)',
    category: 'headings',
    description: 'Medium section title with refined letter spacing',
    icon: 'Heading2',
    badge: 'Medium',
  },
  {
    type: 'heading-3',
    label: 'Heading 3 (Sub-heading)',
    category: 'headings',
    description: 'Crisp, compact heading for sub-divisions',
    icon: 'Heading3',
    badge: 'Small',
  },
  {
    type: 'subtitle',
    label: 'Subtitle / Lead Text',
    category: 'headings',
    description: 'Muted descriptive introductory subtitle under titles',
    icon: 'Type',
  },

  // TEXT & EDITORIAL
  {
    type: 'paragraph',
    label: 'Standard Paragraph',
    category: 'text',
    description: 'Body text with optimal line-length and typography',
    icon: 'AlignLeft',
    badge: 'Prose',
  },
  {
    type: 'dropcap-paragraph',
    label: 'Drop-Cap Editorial Paragraph',
    category: 'text',
    description: 'Classical book style with an oversized first letter',
    icon: 'Pilcrow',
    badge: 'Classic',
  },
  {
    type: 'two-column-text',
    label: 'Two-Column Newspaper Text',
    category: 'text',
    description: 'Journalistic dual-column flow for dense reading',
    icon: 'Columns2',
  },
  {
    type: 'quote-block',
    label: 'Pull Quote / Citation',
    category: 'text',
    description: 'Expansive inspirational quotation with author & role',
    icon: 'Quote',
    badge: 'Serif',
  },

  // GRID CARDS & LISTS
  {
    type: 'grid-cards',
    label: '2x2 Key Points Metric Grid',
    category: 'cards',
    description: 'Structured 2x2 grid of cards with tags, descriptions & badges',
    icon: 'LayoutGrid',
    badge: 'Popular',
  },
  {
    type: 'feature-cards',
    label: 'Feature Highlight Cards',
    category: 'cards',
    description: 'Card items with icons, bold titles, and status indicators',
    icon: 'Layers',
  },
  {
    type: 'checklist-block',
    label: 'Checkmark List',
    category: 'cards',
    description: 'Clean list of points with green/gold checkmark icons',
    icon: 'CheckSquare',
  },
  {
    type: 'numbered-steps',
    label: 'Numbered Steps / Process',
    category: 'cards',
    description: 'Step 01, Step 02 sequential ordered list for workflows',
    icon: 'ListOrdered',
  },
  {
    type: 'table-specs',
    label: 'Specifications / Colophon Table',
    category: 'cards',
    description: 'Two-column key-value matrix for data, attributes or specs',
    icon: 'Table',
  },

  // MEDIA & AUTHOR
  {
    type: 'image-block',
    label: 'Full Image Showcase',
    category: 'media',
    description: 'Featured artwork/photo with styled caption frame',
    icon: 'Image',
  },
  {
    type: 'image-full-fit',
    label: 'Image Without Crop (Full Fit)',
    category: 'media',
    description: 'Displays the complete image without cropping, automatically fitting width or height with 98% scale and 2% margin',
    icon: 'Maximize2',
    badge: 'No Crop',
  },
  {
    type: 'image-text-split',
    label: 'Side-by-Side Image & Text',
    category: 'media',
    description: 'Half visual illustration and half editorial description',
    icon: 'Sparkles',
  },
  {
    type: 'author-card',
    label: 'Author Bio & Profile',
    category: 'media',
    description: 'Avatar portrait, biography, signature, and social handles',
    icon: 'User',
  },

  // INTERACTIVE & INFO
  {
    type: 'callout-box',
    label: 'Callout / Highlight Box',
    category: 'interactive',
    description: 'Framed highlight card for tips, notes, or key messages',
    icon: 'Info',
    badge: 'Box',
  },
  {
    type: 'button-cta',
    label: 'Action Button / Link Pill',
    category: 'interactive',
    description: 'Interactive button pill (e.g. Tap to Open, Explore Link)',
    icon: 'MousePointerClick',
  },

  // ORNAMENT & IMPRINT
  {
    type: 'divider-ornament',
    label: 'Decorative Divider & Flourish',
    category: 'ornament',
    description: 'Gold accent line, star emblem, or floral flourish separator',
    icon: 'Minus',
  },
  {
    type: 'barcode-imprint',
    label: 'Barcode & ISBN Imprint',
    category: 'ornament',
    description: 'Archival book barcode, ISBN registry, and publisher imprint',
    icon: 'QrCode',
  },

  // 🌟 CREATIVE SPECIALIZED COMPONENTS
  {
    type: 'menu-course-item',
    label: 'Michelin Menu Item & Price',
    category: 'cards',
    description: 'Course dish with dotted price leader, sommelier wine pairing & dietary tags',
    icon: 'Wine',
    badge: 'Gourmet',
  },
  {
    type: 'code-terminal',
    label: 'Cyber Code Terminal',
    category: 'interactive',
    description: 'Mac-style terminal window with command prompt, syntax colors & live logs',
    icon: 'Terminal',
    badge: 'Tech',
  },
  {
    type: 'stat-gauge-matrix',
    label: 'Performance Gauge Matrix',
    category: 'cards',
    description: 'Visual progress bars, percentage gauges and metric badges',
    icon: 'Gauge',
    badge: 'Matrix',
  },
  {
    type: 'polaroid-gallery',
    label: 'Polaroids with Tape Pins',
    category: 'media',
    description: 'Tilted Polaroid photos with washi tape and handwritten script captions',
    icon: 'Camera',
    badge: 'Romantic',
  },
  {
    type: 'comic-panel-grid',
    label: 'Manga / Comic Action Panel',
    category: 'media',
    description: 'Action comic box with speech bubble and sound effect explosion badge',
    icon: 'Zap',
    badge: 'Manga',
  },
  {
    type: 'blueprint-spec',
    label: 'Architectural Blueprint Spec',
    category: 'cards',
    description: 'Blueprint drawing card with GPS coordinates, materials and scale ratio',
    icon: 'Compass',
    badge: 'Arch',
  },
  {
    type: 'poetry-calligraphy',
    label: 'Poetry & Calligraphy Leaf',
    category: 'text',
    description: 'Centered ornate verse with quill flourish and romantic formatting',
    icon: 'Feather',
    badge: 'Poetic',
  },
  {
    type: 'specs-badge-grid',
    label: '3-Column Performance Specs',
    category: 'cards',
    description: 'High-contrast 3-column horsepower, acceleration & speed metrics',
    icon: 'Flame',
    badge: 'Speed',
  },
];

export function createDefaultBlock(type: PageBlockType): PageBlock {
  const id = `b-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  switch (type) {
    case 'chapter-header':
      return {
        id,
        type,
        chapterNumber: 'CHAPTER 01',
        tag: 'ESSENTIAL FOUNDATIONS',
        title: 'The Architecture of Light',
      };

    case 'heading-1':
      return {
        id,
        type,
        title: 'Harmonic Proportions',
        align: 'left',
      };

    case 'heading-2':
      return {
        id,
        type,
        title: 'Core Design Tenets',
        align: 'left',
      };

    case 'heading-3':
      return {
        id,
        type,
        title: 'Fundamental Guidelines',
        align: 'left',
      };

    case 'subtitle':
      return {
        id,
        type,
        subtitle: 'A definitive chronicle on spatial interface aesthetics & balance',
        align: 'left',
      };

    case 'paragraph':
      return {
        id,
        type,
        paragraph1:
          'When translated to digital screen canvases, mathematical proportion scales create natural ocular rhythm and effortless readability across any device resolution.',
        align: 'left',
      };

    case 'dropcap-paragraph':
      return {
        id,
        type,
        dropCap: true,
        paragraph1:
          'The Golden Ratio has guided master architects and typographers across centuries. In digital applications, rigorous geometry brings harmony.',
      };

    case 'two-column-text':
      return {
        id,
        type,
        paragraph1:
          'By avoiding arbitrary padding and adhering strictly to deliberate spatial increments, layouts breathe with quiet confidence.',
        paragraph2:
          'When text measure is constrained to 65–75 characters per measure, reader fatigue drops significantly, enabling deep immersion.',
      };

    case 'quote-block':
      return {
        id,
        type,
        quoteText:
          'Simplicity is not the lack of clutter, that’s a consequence of simplicity. Simplicity somehow essentially describes the purpose and place of an object.',
        quoteAuthor: 'Jony Ive',
        quoteRole: 'Chief Design Officer',
      };

    case 'grid-cards':
      return {
        id,
        type,
        title: 'Framework Benchmarks',
        gridColumns: 2,
        items: [
          {
            id: 'g1',
            tag: '01 / SPEED',
            title: '60 FPS Motion',
            description: 'Hardware-accelerated CSS 3D transforms ensure silky smooth page turns.',
            highlight: '< 16ms',
          },
          {
            id: 'g2',
            tag: '02 / PAYLOAD',
            title: 'Ultra-Compact',
            description: 'Procedural vectors & Web Audio eliminate bulky external media.',
            highlight: '50 KB',
          },
          {
            id: 'g3',
            tag: '03 / TOUCH',
            title: 'Gesture Engine',
            description: 'Natural touch swipes and keyboard arrow navigation.',
            highlight: '100%',
          },
          {
            id: 'g4',
            tag: '04 / HOSTING',
            title: 'Standalone',
            description: 'Runs on static hosting, Netlify, WordPress, or offline USB.',
            highlight: 'Zero Config',
          },
        ],
      };

    case 'feature-cards':
      return {
        id,
        type,
        title: 'Key Capabilities',
        items: [
          {
            id: 'f1',
            title: '3D Matrix Space',
            description: 'Realistic leaf rotation with dynamic shading overlay.',
            icon: 'Layers',
          },
          {
            id: 'f2',
            title: 'Generative Audio',
            description: 'Authentic page friction synthesized natively via Web Audio.',
            icon: 'Sparkles',
          },
          {
            id: 'f3',
            title: 'Universal Export',
            description: 'One-click standalone single-file HTML compilation.',
            icon: 'Download',
          },
        ],
      };

    case 'checklist-block':
      return {
        id,
        type,
        items: [
          { id: 'c1', title: 'Precision Spacing', description: 'Multiples of 8px grid alignment' },
          { id: 'c2', title: 'Tactile Lighting', description: 'Radial specular and ambient book creases' },
          { id: 'c3', title: 'Cross-Device Fluidity', description: 'Dual-spread desktop and single-leaf mobile' },
        ],
      };

    case 'numbered-steps':
      return {
        id,
        type,
        items: [
          { id: 's1', tag: '01', title: 'Structure Setup', description: 'Define page hierarchy and leaf layout.' },
          { id: 's2', tag: '02', title: 'Add Components', description: 'Assemble titles, quotes, cards, and media.' },
          { id: 's3', tag: '03', title: 'Publish & Export', description: 'Download standalone HTML with embedded 3D engine.' },
        ],
      };

    case 'table-specs':
      return {
        id,
        type,
        title: 'Technical Specifications',
        items: [
          { id: 't1', title: 'Aspect Ratio', description: 'A4 Standard (1 : 1.4142)' },
          { id: 't2', title: 'Color Palette', description: 'Emerald & Archival Gold' },
          { id: 't3', title: 'Typography', description: 'Plus Jakarta Sans & Playfair' },
          { id: 't4', title: 'Audio Synthesizer', description: 'Procedural Pink Noise Bandpass' },
        ],
      };

    case 'image-block':
      return {
        id,
        type,
        imageUrl:
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80',
        imageCaption: 'High-resolution archival parchment texture under ambient lighting.',
      };

    case 'image-full-fit':
      return {
        id,
        type,
        imageUrl:
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'Complete Artwork (Full Uncropped Frame)',
      };

    case 'image-text-split':
      return {
        id,
        type,
        title: 'Mastering the Spread',
        imageUrl:
          'https://images.unsplash.com/photo-1507842229451-9f01079ca4b5?auto=format&fit=crop&w=800&q=80',
        imageCaption: 'Archival library study, Oxford.',
        paragraph1:
          'Juxtaposing visual imagery against serif typography creates a rhythmic cadence that encourages sustained reading immersion.',
      };

    case 'author-card':
      return {
        id,
        type,
        authorName: 'Alexander Sterling',
        authorBio:
          'Architect and digital craftsperson specializing in spatial interface design and interactive virtual publications.',
        authorAvatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        authorSocials: 'sterling.design • @alexsterling',
        authorSignature: 'A. Sterling',
      };

    case 'callout-box':
      return {
        id,
        type,
        calloutType: 'gold',
        title: 'PRO TIP ON CRAFTSMANSHIP',
        paragraph1:
          'A 2% warm cream undertone in paper background color transforms a harsh screen display into comforting reading parchment.',
      };

    case 'button-cta':
      return {
        id,
        type,
        buttonLabel: 'Explore Interactive Spread',
        buttonLink: '#',
      };

    case 'divider-ornament':
      return {
        id,
        type,
        dividerStyle: 'gold-line',
      };

    case 'barcode-imprint':
      return {
        id,
        type,
        isbn: 'ISBN 978-0-201-89683-1',
        barcodeNumber: '9 780201 896831',
        publisherName: 'Lumina Press International',
      };

    // 🌟 CREATIVE SPECIALIZED BLOCKS
    case 'menu-course-item':
      return {
        id,
        type,
        courseCategory: 'LES PLATS PRINCIPAUX',
        title: 'Filet de Bœuf Wagyu A5 Rôti',
        paragraph1: 'Accompagné de mousseline de céleri-rave fumé, jus de truffe noire du Périgord et morilles sautées.',
        price: '$78',
        sommelierNote: 'Pairing: Château Margaux Grand Cru 2018',
        dietaryTags: ['GF', 'CHEF PICK'],
      };

    case 'code-terminal':
      return {
        id,
        type,
        codeLanguage: 'neural_cluster.py',
        title: 'python3 -m neural_engine --sync-state --verify',
        codeSnippet: `> Initializing 10,000 distributed spatial agents...\n> Quantized tensor arbitration active [3.4ms latency]\n> Zero drift verified across all edge GPU clusters.`,
        terminalOutput: '✓ PASS: 10,000/10,000 nodes synchronized (0.00% packet loss)',
      };

    case 'stat-gauge-matrix':
      return {
        id,
        type,
        title: 'Telemetry & Latency Matrix',
        tag: 'LIVE BENCHMARKS',
        items: [
          { id: 'm1', title: 'Roundtrip Latency', highlight: '3.4 ms', badge: 'FAST', progress: 95 },
          { id: 'm2', title: 'Cluster Throughput', highlight: '142k/s', badge: 'OPTIMAL', progress: 88 },
          { id: 'm3', title: 'Fault Tolerance', highlight: '99.99%', badge: 'UPTIME', progress: 99 },
          { id: 'm4', title: 'Power Efficiency', highlight: '-68%', badge: 'ECO', progress: 68 },
        ],
      };

    case 'polaroid-gallery':
      return {
        id,
        type,
        title: 'Sunset at Villa del Balbianello',
        subtitle: 'Our First Dance under the Stars',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
        imageUrl2: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
      };

    case 'comic-panel-grid':
      return {
        id,
        type,
        soundFxBadge: '⚡ KABOOM!',
        title: 'Clash in Neo-Tokyo Sector 7',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        speechBubbleText: 'You cannot comprehend the velocity of our neural drive!',
      };

    case 'blueprint-spec':
      return {
        id,
        type,
        title: 'Yakisugi Cantilever Pavilion',
        specCoordinates: 'GRID: 35.6762° N, 139.6503° E // TOKYO',
        scaleRatio: 'SCALE 1:50 METRIC',
        paragraph1: 'The 18-meter cantilevered concrete slab floats over raw thermal basalt without visible support columns.',
        materialDetails: 'Charred Japanese Cedar (Shou Sugi Ban), Ultra-High-Performance Concrete, Anodized Bronze',
      };

    case 'poetry-calligraphy':
      return {
        id,
        type,
        title: 'The Whisper of the Ancient Forest',
        paragraph1: 'Deep within the moss-green twilight glade,\nWhere silver moonbeams filter through the firs,\nThe sleeping dragon dreams of golden age,\nAnd every woodland leaf softly stirs.',
        authorName: 'Lady Genevieve of Eldoria',
      };

    case 'specs-badge-grid':
      return {
        id,
        type,
        title: 'Engine & Performance Metrics',
        items: [
          { id: 's1', highlight: '1,020 HP', tag: 'V8 QUAD-TURBO', description: 'Peak Output' },
          { id: 's2', highlight: '2.1 SEC', tag: '0-100 KM/H', description: 'Launch Control' },
          { id: 's3', highlight: '385 KM/H', tag: 'TOP VELOCITY', description: 'Aero Active' },
        ],
      };

    default:
      return {
        id,
        type: 'paragraph',
        paragraph1: 'New component paragraph text.',
      };
  }
}
