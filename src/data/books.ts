export type BulletIconType =
  | 'dashboard'
  | 'link'
  | 'eye'
  | 'book'
  | 'edit'
  | 'play'
  | 'lock'
  | 'mail'
  | 'settings'
  | 'compass'
  | 'feather'
  | 'clock'
  | 'lantern'
  | 'train'
  | 'key';

export interface FeatureHighlight {
  icon: BulletIconType;
  segments: { text: string; bold?: boolean }[];
}

export interface BookPageData {
  id: string;
  pageNumber: number;
  layout:
    | 'showcase-card'      // Matches "Your Flipbooks", "Customize", "Protection" card style from screenshots
    | 'novel-chapter'      // Literary novel chapter with white inner card, drop cap, and emerald chapter metadata
    | 'novel-illustration' // Right-hand page with architectural/botanical plate, dialog card, or interactive widget
    | 'showcase-widget'    // Matches the right-hand "Password protect / Zoom button" interactive mockup page
    | 'table-of-contents'; // Interactive clickable table of contents
  chapterKicker?: string;
  title: string;
  subtitle?: string;
  circlePosition?: 'top-right' | 'top-left' | 'bottom-center' | 'top-center';
  highlights?: FeatureHighlight[];
  paragraphs?: string[];
  pullQuote?: {
    quote: string;
    attribution: string;
  };
  illustrationType?: 'observatory' | 'library' | 'harbor' | 'train' | 'pocketwatch' | 'telegram';
  illustrationCaption?: string;
  tocEntries?: {
    chapter: string;
    title: string;
    pageIndex: number;
    summary: string;
  }[];
  sceneNote?: {
    label: string;
    location: string;
    weather: string;
  };
}

export interface NovelBook {
  id: string;
  title: string;
  author: string;
  languageLabel: string;
  genre: string;
  year: string;
  description: string;
  pages: BookPageData[];
}

export const INITIAL_BOOKS: NovelBook[] = [
  {
    id: 'monsoon-express',
    title: 'Safarnama: The Monsoon Express',
    author: 'Aarav Mehta',
    languageLabel: 'Hinglish / Literary Novel',
    genre: 'Mystery & Nostalgia Novel',
    year: '2026 Edition',
    description: 'Ek purani ghadi, ek adhoora khat, aur 1974 ki Shimla Mail ka woh raaz jo barish ki raat mein khula.',
    pages: [
      {
        id: 'me-1',
        pageNumber: 1,
        layout: 'showcase-card',
        chapterKicker: 'NOVEL EDITION · PROLOGUE',
        title: 'The Monsoon\nExpress',
        subtitle: 'A Novel by Aarav Mehta',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'train',
            segments: [
              { text: 'Bombay Victoria Terminus', bold: true },
              { text: ' se Shimla tak ka ek bhoola-bisra safar' },
            ],
          },
          {
            icon: 'clock',
            segments: [
              { text: '14 July 1974:', bold: true },
              { text: ' Jab Coach No. 4 mein ek anjaan musafir ne', bold: false },
              { text: ' laal diary', bold: true },
              { text: ' chhod di' },
            ],
          },
          {
            icon: 'lantern',
            segments: [
              { text: 'Har panne ko', bold: false },
              { text: ' corner se drag', bold: true },
              { text: ' karein ya neeche diye arrows se paltein' },
            ],
          },
        ],
      },
      {
        id: 'me-2',
        pageNumber: 2,
        layout: 'table-of-contents',
        chapterKicker: 'FEHRIST · TABLE OF CONTENTS',
        title: 'Dastaan Ke\nAdhyay',
        circlePosition: 'top-left',
        tocEntries: [
          {
            chapter: 'Adhyay 01',
            title: 'Platform No. 3 Ki Barish',
            pageIndex: 2,
            summary: 'Kabir ko purani kitaabon ke sandook mein pital ki chaabi milti hai.',
          },
          {
            chapter: 'Adhyay 02',
            title: 'Khidki Ke Paas Wali Seat',
            pageIndex: 4,
            summary: 'Raat ke 11 baje jab train Igatpuri ke ghaton se guzri.',
          },
          {
            chapter: 'Adhyay 03',
            title: 'Ruka Hua Waqt (1974)',
            pageIndex: 6,
            summary: 'Noorjahan Begum ka khat aur ghadi ke andar chhupa naksha.',
          },
          {
            chapter: 'Adhyay 04',
            title: 'Shimla Ki Aakhri Seeti',
            pageIndex: 8,
            summary: 'Kalka-Shimla toy train ki surang number 33 ka sach.',
          },
        ],
      },
      {
        id: 'me-3',
        pageNumber: 3,
        layout: 'novel-chapter',
        chapterKicker: 'ADHYAY 01 · PLATFORM NO. 3',
        title: 'Barish Aur\nPurana Khat',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'feather',
            segments: [
              { text: 'Kabir Sen', bold: true },
              { text: ' — Flora Fountain ka mashhoor jildsaaz (bookbinder)' },
            ],
          },
          {
            icon: 'key',
            segments: [
              { text: 'Pital ka lifafa', bold: true },
              { text: ' jiske upar sirf ek lafz likha tha: ' },
              { text: '“Amanat”', bold: true },
            ],
          },
        ],
        paragraphs: [
          'July ki us shaam Bombay ki barish kuch alag hi zidd par thi. Victoria Terminus ke oonche patthar ke gumbad se paani ki dhaar aisi gir rahi thi jaise waqt khud pighal raha ho. Kabir ne apni chhatri band ki aur apni chhoti si bookbinding dukan ka shutter aadha gira diya.',
          'Mez par rakhi laltain ki peeli roshni mein woh purana chamde ka bag abhi bhi bheeg raha tha. Uske andar koi qeemti zevar nahi tha—bas ek haath se sila hua makhmal(velvet) ka register aur ek pital ki pocket watch jo theek sawa aath baje ruki hui thi.',
        ],
      },
      {
        id: 'me-4',
        pageNumber: 4,
        layout: 'novel-illustration',
        chapterKicker: ' ARCHIVAL PLATE I · VICTORIA TERMINUS',
        title: 'The Brass Pocket Watch',
        circlePosition: 'bottom-center',
        illustrationType: 'pocketwatch',
        illustrationCaption: 'Fig 1.1 — 1898 Rotherham & Sons brass chronometer discovered inside the velvet ledger on Platform 3.',
        pullQuote: {
          quote: '“Kuch kitaabein padhne ke liye nahi likhi jaatin, Kabir babu—woh kisi ko sahi waqt par sahi station pahunchane ke liye likhi jaati hain.”',
          attribution: '— Postcard tucked inside Page 14, dated 14 July 1974',
        },
        sceneNote: {
          label: 'Station Log',
          location: 'Bombay VT → Kalka Junction',
          weather: 'Heavy Monsoon · 24°C',
        },
      },
      {
        id: 'me-5',
        pageNumber: 5,
        layout: 'novel-chapter',
        chapterKicker: 'ADHYAY 02 · COACH NO. 4',
        title: 'Khidki Ke\nUs Paar',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'compass',
            segments: [
              { text: 'Igatpuri Ghat:', bold: true },
              { text: ' Kohre mein lipti pahadiyan aur bhaap ke engine ki aawaz' },
            ],
          },
          {
            icon: 'book',
            segments: [
              { text: 'Safed kagaz par', bold: false },
              { text: ' hare rang ki syahi', bold: true },
              { text: ' (emerald ink) se likhe huye nishaan' },
            ],
          },
        ],
        paragraphs: [
          'Jab Frontier Mail ne kasbe ki aakhri batti ko peeche chhoda, toh compartment mein sirf do log jaag rahe the. Samne wali berth par baithe buzurg ticket-collector ne Kabir ke haath mein woh makhmal wali kitaab dekhi aur unki aankhein thahar gayin.',
          '“Yeh jild toh Ustad Rehmatullah ke haath ki bani hai,” unhone dheemi aawaz mein kaha. “Pachpan saal pehle main isee train mein duty par tha jab ek musafir ne kaha tha ki agar yeh kitaab kabhi wapas is dibbe mein aaye, toh use Shimla ke Town Hall पुस्तकालय (Library) tak zaroor pahunchaya jaaye.”',
        ],
      },
      {
        id: 'me-6',
        pageNumber: 6,
        layout: 'novel-illustration',
        chapterKicker: 'ARCHIVAL PLATE II · WESTERN GHATS',
        title: 'Midnight on the Viaduct',
        circlePosition: 'top-left',
        illustrationType: 'train',
        illustrationCaption: 'Fig 2.4 — The 1974 Frontier Mail crossing the stone viaduct through monsoon mist.',
        pullQuote: {
          quote: '“Har surang ke baad ujala aata hai, magar kuch kahaniyan surang ke andhere mein hi apna asli rang dikhati hain.”',
          attribution: '— Kabir’s Margin Note, Midnight',
        },
        sceneNote: {
          label: 'Route Marker',
          location: 'Viaduct Bridge No. 19',
          weather: 'Mountain Fog · 18°C',
        },
      },
      {
        id: 'me-7',
        pageNumber: 7,
        layout: 'novel-chapter',
        chapterKicker: 'ADHYAY 03 · THE CIPHER',
        title: 'Ruka Hua\nWaqt',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'lock',
            segments: [
              { text: 'Teen aksharon ka raaz', bold: true },
              { text: ' jo har adhyay ke pehle harf (letter) mein chhupa tha' },
            ],
          },
          {
            icon: 'eye',
            segments: [
              { text: 'Laltain ki garmi', bold: true },
              { text: ' milte hi kagaz par chhupi hui lakeerein ubhar aayin' },
            ],
          },
        ],
        paragraphs: [
          'Subah ki pehli kiran jab khidki ke sheeshe se chhan kar diary ke panno par padi, toh Kabir ne dekha ki har panne ke upari hisse mein ek barik gol ghera (geometric circle) bana hua tha. Jab do panno ko aadha mod kar (diagonal fold karke) milaya jaata, toh dono ghere milkar ek naksha banate the!',
          'Woh sirf ek novel nahi thi—woh do panno ke beech chhupa hua ek zinda meemar (architectural) naksha tha, jise sirf wahi dekh sakta tha jo panne ko poora palatne ke bajaye beech mein rok kar dekhe.',
        ],
      },
      {
        id: 'me-8',
        pageNumber: 8,
        layout: 'novel-illustration',
        chapterKicker: 'ARCHIVAL PLATE III · SUMMER HILL ARCHIVE',
        title: 'The Spiral Reading Room',
        circlePosition: 'bottom-center',
        illustrationType: 'library',
        illustrationCaption: 'Fig 3.2 — The cedarwood conservatory library above Shimla Ridge where the final manuscript rested.',
        pullQuote: {
          quote: '“Jab do panne aapas mein milte hain, tabhi kahani poori hoti hai—ek panna sawal hai, doosra uska jawab.”',
          attribution: '— Inscription above the Cedar Archway',
        },
        sceneNote: {
          label: 'Archive Coordinate',
          location: 'Shimla Ridge · 2,205m',
          weather: 'Crisp Cedar Air · 12°C',
        },
      },
      {
        id: 'me-9',
        pageNumber: 9,
        layout: 'novel-chapter',
        chapterKicker: 'ADHYAY 04 · EPILOGUE',
        title: 'Shimla Ki\nAakhri Seeti',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'book',
            segments: [
              { text: 'Dastaan मुकम्मल (Complete):', bold: true },
              { text: ' Purani amanat aakhirkar apni manzil tak pahunch gayi' },
            ],
          },
          {
            icon: 'edit',
            segments: [
              { text: 'Aap bhi upar', bold: false },
              { text: ' “Add / Edit Page”', bold: true },
              { text: ' button se is novel mein apna agla adhyay jod sakte hain' },
            ],
          },
        ],
        paragraphs: [
          'Kalka se chali chhoti si pahadi train jab Barog aur Tara Devi ke devdar ke jungalon ko paar karti hui Shimla pahunchi, toh aasman bilkul saaf ho chuka tha. Library ke purane lakdi ke darwaze ko kholte hi Kabir ko wahi mehek aayi jo har sadiyon purani kitaab mein hoti hai.',
          'Usne mez par woh makhmal ki diary rakhi, ghadi ki chaabi ghumayi, aur pital ki suiyan phir se chalne lagin—tik, tik, tik. Kahani khatam nahi hui thi; woh bas ek naye padhne wale ka intezar kar rahi thi.',
        ],
      },
      {
        id: 'me-10',
        pageNumber: 10,
        layout: 'showcase-widget',
        chapterKicker: 'COLOPHON & READER SETTINGS',
        title: 'Edition Notes',
        circlePosition: 'bottom-center',
      },
    ],
  },
  {
    id: 'glass-observatory',
    title: 'The Glass Observatory',
    author: 'Julian Vance',
    languageLabel: 'English Literary Novel',
    genre: 'Historical Mystery Novel',
    year: 'First Folio Edition',
    description: 'An archivist arrives at a windswept tidal island to catalog a 19th-century astronomer’s final glass-plate notebooks.',
    pages: [
      {
        id: 'go-1',
        pageNumber: 1,
        layout: 'showcase-card',
        chapterKicker: 'FOLIO NOVEL · BOOK ONE',
        title: 'The Glass\nObservatory',
        subtitle: 'A Novel by Julian Vance',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'compass',
            segments: [
              { text: 'Set on Cape Morrow', bold: true },
              { text: ' where a brass telescope watches both the tide and the stars' },
            ],
          },
          {
            icon: 'book',
            segments: [
              { text: 'Tactile page curl', bold: true },
              { text: ' physics engineered for long-form literary reading' },
            ],
          },
          {
            icon: 'eye',
            segments: [
              { text: 'Drag any corner', bold: true },
              { text: ' or use the curved bottom arrows to turn each leaf' },
            ],
          },
        ],
      },
      {
        id: 'go-2',
        pageNumber: 2,
        layout: 'table-of-contents',
        chapterKicker: 'INDEX · CHAPTER DIRECTORY',
        title: 'Contents of\nthe Folio',
        circlePosition: 'top-left',
        tocEntries: [
          {
            chapter: 'Chapter I',
            title: 'The Causeway at Low Water',
            pageIndex: 2,
            summary: 'Clara arrives at Saint Jude’s Rock before the equinox tide seals the road.',
          },
          {
            chapter: 'Chapter II',
            title: 'Letters in Emerald Ink',
            pageIndex: 4,
            summary: 'Inside the meridian room, twelve glass plates reveal an unmapped comet.',
          },
          {
            chapter: 'Chapter III',
            title: 'The Folded Meridian',
            pageIndex: 6,
            summary: 'Why the astronomer drew circles that only align when a page is turned.',
          },
        ],
      },
      {
        id: 'go-3',
        pageNumber: 3,
        layout: 'novel-chapter',
        chapterKicker: 'CHAPTER I · SAINT JUDE’S ROCK',
        title: 'The Causeway\nat Low Water',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'lantern',
            segments: [
              { text: 'October 19, 1894:', bold: true },
              { text: ' Only forty minutes of dry stone remain between the mainland and the tower' },
            ],
          },
          {
            icon: 'key',
            segments: [
              { text: 'Three iron keys', bold: true },
              { text: ' delivered in a salt-stained canvas satchel' },
            ],
          },
        ],
        paragraphs: [
          'For six hours out of every twelve, the granite causeway to Saint Jude’s Rock belonged to the North Sea. Only when the bell buoy off the western shoal slackened its iron tongue could a cart cross the glistening kelp bed toward the octagonal tower.',
          'Clara held her ledger beneath her wool cloak as the ferryman pointed with his oar. High above the chalk cliff, the glass dome of Edmund Haldane’s observatory caught the last pale amber of the autumn sun, glowing like a lantern suspended between water and cloud.',
        ],
      },
      {
        id: 'go-4',
        pageNumber: 4,
        layout: 'novel-illustration',
        chapterKicker: 'PLATE I · CAPE MORROW',
        title: 'The Cliffside Dome',
        circlePosition: 'bottom-center',
        illustrationType: 'observatory',
        illustrationCaption: 'Fig 1.1 — Architectural elevation of the Haldane Meridian Dome overlooking the North Sea causeway.',
        pullQuote: {
          quote: '“We measure the heavens with brass and glass, yet it is paper that remembers where the light fell.”',
          attribution: '— Edmund Haldane, Journal IV (1889)',
        },
        sceneNote: {
          label: 'Tidal Almanac',
          location: '55° 38′ N, 1° 37′ W',
          weather: 'Equinox Gale · Barometer Falling',
        },
      },
      {
        id: 'go-5',
        pageNumber: 5,
        layout: 'novel-chapter',
        chapterKicker: 'CHAPTER II · THE MERIDIAN ROOM',
        title: 'Letters in\nEmerald Ink',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'feather',
            segments: [
              { text: 'Copper-green notes', bold: true },
              { text: ' written along the outer margin of every recto leaf' },
            ],
          },
          {
            icon: 'clock',
            segments: [
              { text: 'Sidereal clock', bold: true },
              { text: ' still ticking four seconds ahead of Greenwich time' },
            ],
          },
        ],
        paragraphs: [
          'The spiral stair smelled of linseed oil, cedar shavings, and old rain. On the mahogany charting table lay a folio bound in cream buckram. Unlike standard astronomical tables filled with dry logarithms, every left-hand page contained a clean white card inset against warm stone paper.',
          'When Clara lifted the lower-right corner of the sheet to turn it toward the lamp, she gasped. The fine silver circle printed at the crown of the page curved across the diagonal fold, aligning with the reverse side to trace the exact orbit of an uncharted companion star.',
        ],
      },
      {
        id: 'go-6',
        pageNumber: 6,
        layout: 'novel-illustration',
        chapterKicker: 'PLATE II · HARBOR OF REFUGE',
        title: 'Lanterns on the Quay',
        circlePosition: 'top-left',
        illustrationType: 'harbor',
        illustrationCaption: 'Fig 2.3 — Supply sloops anchored below the eastern seawall during the November neap tide.',
        pullQuote: {
          quote: '“Turn the leaf slowly; the back of the page carries the answer that the front was afraid to speak.”',
          attribution: '— Margin note in Clara’s Catalog',
        },
        sceneNote: {
          label: 'Logbook Entry',
          location: 'Eastern Seawall Landing',
          weather: 'Clear Zenith · Visibility 14 Leagues',
        },
      },
      {
        id: 'go-7',
        pageNumber: 7,
        layout: 'novel-chapter',
        chapterKicker: 'CHAPTER III · THE FOLDED MERIDIAN',
        title: 'The Geometry\nof Turning',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'book',
            segments: [
              { text: 'Every page turn', bold: true },
              { text: ' folds space across a single diagonal hinge' },
            ],
          },
          {
            icon: 'lock',
            segments: [
              { text: 'Archive preserved', bold: true },
              { text: ' in complete folio order for future readers' },
            ],
          },
        ],
        paragraphs: [
          'By dawn the gale had spent its fury against the seawall, leaving pools of calm rainwater in the hollow stones of the courtyard. Clara set the final glass plate back into its felt-lined slot and closed the brass clasp of the box.',
          'She understood now why Haldane had refused to send his discoveries by telegraph. Some truths belonged to the physical architecture of a book—requiring a quiet room, a steady hand at the corner of the page, and the patience to watch one chapter fold gently into the next.',
        ],
      },
      {
        id: 'go-8',
        pageNumber: 8,
        layout: 'showcase-widget',
        chapterKicker: 'EDITION ARCHIVE & PROTECTION',
        title: 'Reader Controls',
        circlePosition: 'bottom-center',
      },
    ],
  },
  {
    id: 'video-replica-showcase',
    title: 'Original Video Flipbook Replica',
    author: 'Exact Layout & Curl Reference',
    languageLabel: 'Exact Video Match',
    genre: 'Interactive Product Book',
    year: 'Reference Edition',
    description: 'Exact visual recreation of the pages shown in your uploaded Mobile & Desktop screenshots (“Your Flipbooks”, “Customize”, “Protection”).',
    pages: [
      {
        id: 'vr-1',
        pageNumber: 1,
        layout: 'showcase-card',
        title: 'Your\nFlipbooks',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'dashboard',
            segments: [
              { text: 'Manage', bold: true },
              { text: ' all your converted flipbooks with the dashboard' },
            ],
          },
          {
            icon: 'link',
            segments: [
              { text: 'Edit, publish', bold: true },
              { text: ' and get a reader link', bold: true },
              { text: ' to share or ' },
              { text: 'embed', bold: true },
            ],
          },
          {
            icon: 'eye',
            segments: [
              { text: 'Find out how and when your audience ' },
              { text: 'visit', bold: true },
              { text: ' your publications' },
            ],
          },
        ],
      },
      {
        id: 'vr-2',
        pageNumber: 2,
        layout: 'novel-illustration',
        chapterKicker: 'INTERACTIVE EDITION PREVIEW',
        title: 'Seamless Reading Across Devices',
        circlePosition: 'bottom-center',
        illustrationType: 'library',
        illustrationCaption: 'Switch between Mobile Single-Page Portrait and Desktop Dual-Page Spread at any time.',
        pullQuote: {
          quote: '“Drag any corner of the page—or click the curved arrows below—to experience real diagonal paper curl with backside typography.”',
          attribution: '— Interactive Flipbook Engine',
        },
        sceneNote: {
          label: 'Format Mode',
          location: 'Desktop Spread & Mobile Portrait',
          weather: '60fps Hardware Curl',
        },
      },
      {
        id: 'vr-3',
        pageNumber: 3,
        layout: 'showcase-card',
        title: 'Customize',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'book',
            segments: [
              { text: 'Choose and customize between different page turn ' },
              { text: 'effects', bold: true },
            ],
          },
          {
            icon: 'edit',
            segments: [
              { text: 'Change the ' },
              { text: 'viewer controls', bold: true },
              { text: ' to allow or block the download, full-screen, zoom and more' },
            ],
          },
          {
            icon: 'play',
            segments: [
              { text: 'Make your content interactive adding image, audio, video, or web widgets' },
            ],
          },
        ],
      },
      {
        id: 'vr-4',
        pageNumber: 4,
        layout: 'showcase-card',
        title: 'Protection',
        circlePosition: 'top-left',
        highlights: [
          {
            icon: 'lock',
            segments: [
              { text: 'Set a ' },
              { text: 'password', bold: true },
              { text: ' to protect your flipbooks' },
            ],
          },
          {
            icon: 'mail',
            segments: [
              { text: 'Choose the ' },
              { text: 'authorized emails', bold: true },
              { text: ' that can access the content' },
            ],
          },
          {
            icon: 'settings',
            segments: [
              { text: 'Restrict access', bold: true },
              { text: ' to your books to specific domains' },
            ],
          },
        ],
      },
      {
        id: 'vr-5',
        pageNumber: 5,
        layout: 'showcase-widget',
        title: 'Password protect',
        circlePosition: 'bottom-center',
      },
      {
        id: 'vr-6',
        pageNumber: 6,
        layout: 'novel-chapter',
        chapterKicker: 'BONUS SAMPLE CHAPTER · NOVEL MODE',
        title: 'The Archivist’s\nNotebook',
        circlePosition: 'top-right',
        highlights: [
          {
            icon: 'feather',
            segments: [
              { text: 'Typography & Layout', bold: true },
              { text: ' crafted for both modern catalogs and literary fiction' },
            ],
          },
        ],
        paragraphs: [
          'Every page in this flipbook combines the exact visual geometry of your reference videos—the warm stone-cream paper margin, the crisp white inner sheet, the delicate geometric circle arc, and the emerald line icons—with full novel storytelling.',
          'Use the “Diagonal Curl Pose” button in the studio bar above to freeze the page at the exact mid-curl angle from your desktop screenshot, or drag any page corner freely with your mouse or finger.',
        ],
      },
    ],
  },
];
