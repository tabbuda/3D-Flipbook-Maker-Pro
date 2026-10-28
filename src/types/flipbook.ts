export type CoverThemeId =
  | 'emerald-gold'
  | 'vintage-leather'
  | 'midnight-sapphire'
  | 'minimal-slate'
  | 'crimson-burgundy'
  | 'editorial-ivory'
  | 'royal-gold'
  | 'obsidian-neon'
  | 'sakura-blush'
  | 'cyber-matrix'
  | 'gourmet-bistro'
  | 'manga-popart'
  | 'supercar-carbon'
  | 'nordic-sage'
  | 'newspaper-broadsheet'
  | 'catalog-minimal'
  | 'brochure-corporate'
  | 'recipe-artisan'
  | 'cookbook-rustic'
  | 'guidebook-travel'
  | 'travel-mediterranean'
  | 'handbook-slate'
  | 'presentation-pitch'
  | 'deck-pitch'
  | 'invitation-luxury'
  | 'booklet-theatre';

export interface CoverTheme {
  id: CoverThemeId;
  name: string;
  category: string;
  bgGradient: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  spineColor: string;
  pageBg: string;
  pageTextColor: string;
  texture: string;
  previewBg: string;
  coverStyle?:
    | 'luxury-gold'
    | 'cyber-hud'
    | 'editorial-chic'
    | 'gourmet-crest'
    | 'vintage-scroll'
    | 'sakura-floral'
    | 'manga-burst'
    | 'supercar-speed'
    | 'minimal-modern'
    | 'newspaper-vintage'
    | 'catalog-minimal'
    | 'presentation-deck'
    | 'invitation-regal'
    | 'guidebook-travel'
    | 'handbook-doc'
    | 'brochure-sleek';
}

export type PageTemplateType =
  | 'cover-front'
  | 'pdf-page'
  | 'table-of-contents'
  | 'chapter-intro'
  | 'story-article'
  | 'feature-list'
  | 'image-showcase'
  | 'image-text-split'
  | 'two-column-article'
  | 'quote-highlight'
  | 'form-mockup'
  | 'key-points-grid'
  | 'author-bio'
  | 'cover-back'
  | 'blank';

export interface BulletItem {
  id: string;
  icon?: string;
  title: string;
  description: string;
}

export interface GridCardItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  highlight?: string;
}

export type PageBlockType =
  | 'chapter-header'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'subtitle'
  | 'paragraph'
  | 'dropcap-paragraph'
  | 'two-column-text'
  | 'grid-cards'
  | 'feature-cards'
  | 'callout-box'
  | 'quote-block'
  | 'image-block'
  | 'image-full-fit'
  | 'image-text-split'
  | 'checklist-block'
  | 'numbered-steps'
  | 'author-card'
  | 'table-specs'
  | 'divider-ornament'
  | 'barcode-imprint'
  | 'button-cta'
  // NEW CREATIVE SPECIALIZED BLOCKS:
  | 'menu-course-item'
  | 'code-terminal'
  | 'stat-gauge-matrix'
  | 'polaroid-gallery'
  | 'comic-panel-grid'
  | 'blueprint-spec'
  | 'poetry-calligraphy'
  | 'specs-badge-grid'
  | 'recipe-step-card'
  | 'product-catalog-grid'
  | 'travel-itinerary-step'
  | 'newspaper-headline-columns'
  | 'presentation-pitch-slide'
  | 'invitation-rsvp-card'
  | 'handbook-policy-card';

export interface PageBlockItem {
  id: string;
  title?: string;
  description?: string;
  tag?: string;
  highlight?: string;
  icon?: string;
  badge?: string;
  price?: string;
  progress?: number;
  imageUrl?: string;
  soundFx?: string;
  sku?: string;
  dimensions?: string;
  status?: string;
}

export interface PageBlock {
  id: string;
  type: PageBlockType;
  // Text fields
  title?: string;
  subtitle?: string;
  tag?: string;
  chapterNumber?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  dropCap?: boolean;
  align?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';

  // Media & Alignment Controls
  imageUrl?: string;
  imageUrl2?: string;
  imageCaption?: string;
  imageAlt?: string;
  imageAlign?: 'left' | 'center' | 'right';
  imageVerticalAlign?: 'top' | 'middle' | 'bottom';
  imageSize?: 'small' | 'medium' | 'large' | 'full' | 'custom';
  imageWidth?: string; // e.g. '25%', '33%', '50%', '75%', '100%'
  imageHeight?: string | number; // e.g. '120px', '200px', '320px', 'auto'
  imageFit?: 'cover' | 'contain' | 'fill';
  imageFloat?: 'none' | 'left' | 'right'; // allows surrounding text/content to flow around smoothly

  // Quotations & Dialogues
  quoteText?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  speechBubbleText?: string;
  soundFxBadge?: string;

  // Cards / Lists / Gauges / Menus
  items?: PageBlockItem[];
  gridColumns?: 2 | 3 | 4;
  courseCategory?: string;
  sommelierNote?: string;
  dietaryTags?: string[];
  price?: string;

  // Recipe specifics
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  difficulty?: string;
  ingredients?: string[];
  chefTip?: string;

  // Travel Guide specifics
  itineraryTime?: string;
  itineraryLocation?: string;
  travelDuration?: string;
  travelTips?: string;

  // Event & Invitation specifics
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  dressCode?: string;
  rsvpDeadline?: string;

  // Newspaper specifics
  byline?: string;
  dateline?: string;
  newspaperSection?: string;
  issueDate?: string;

  // Pitch Deck specifics
  problemStatement?: string;
  solutionStatement?: string;
  marketSizeTAM?: string;
  marketSizeSAM?: string;

  // Handbook & Policy specifics
  policyCode?: string;
  complianceStatus?: string;

  // Code Terminal
  codeSnippet?: string;
  codeLanguage?: string;
  terminalOutput?: string;

  // Blueprint & Specs
  specCoordinates?: string;
  materialDetails?: string;
  scaleRatio?: string;

  // Callout Box
  calloutType?: 'info' | 'gold' | 'quote' | 'alert' | 'minimal' | 'cyber' | 'manga' | 'fairytale';

  // Author details
  authorName?: string;
  authorBio?: string;
  authorAvatarUrl?: string;
  authorSocials?: string;
  authorSignature?: string;

  // Barcode / Specs / Buttons
  isbn?: string;
  barcodeNumber?: string;
  publisherName?: string;
  buttonLabel?: string;
  buttonLink?: string;
  dividerStyle?: 'gold-line' | 'stars' | 'dots' | 'flourish' | 'cyber-line' | 'floral-vine' | 'speed-dash';
}

export interface PageContent {
  id: string;
  template: PageTemplateType;
  pageNumber?: number;
  chapterNumber?: string;
  title?: string;
  subtitle?: string;
  headerTag?: string;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  dropCap?: boolean;
  imageUrl?: string;
  imageCaption?: string;
  imageAlt?: string;
  imageAlign?: 'left' | 'center' | 'right';
  imageVerticalAlign?: 'top' | 'middle' | 'bottom';
  imageSize?: 'small' | 'medium' | 'large' | 'full';
  imagePosition?: 'top' | 'center' | 'bottom' | 'background';
  quoteText?: string;
  quoteAuthor?: string;
  quoteRole?: string;
  bulletItems?: BulletItem[];
  gridCards?: GridCardItem[];
  authorName?: string;
  authorBio?: string;
  authorAvatarUrl?: string;
  authorSignature?: string;
  authorSocials?: string;
  isbn?: string;
  barcodeNumber?: string;
  publisherName?: string;
  priceTag?: string;
  footerNote?: string;
  blocks?: PageBlock[];
  isPdfPage?: boolean;
  coverImageUrl?: string;
  aspectRatio?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
}

export interface BookProject {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  edition: string;
  year: string;
  publisher: string;
  themeId: CoverThemeId;
  soundEnabled: boolean;
  pageTurnSpeed: 'fast' | 'normal' | 'smooth' | 'slow';
  pages: PageContent[];
  coverImageUrl?: string;
  aspectRatio?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
  pageWidth?: number;
  pageHeight?: number;
  customBrandLogo?: string;
  customBrandName?: string;
  customBrandUrl?: string;
}

export type TemplateCategory =
  | 'all'
  | 'magazine'
  | 'catalog'
  | 'brochure'
  | 'lookbook'
  | 'recipe'
  | 'guidebook'
  | 'photo-album'
  | 'newsletter'
  | 'menu'
  | 'restaurant'
  | 'company-profile'
  | 'handbook'
  | 'portfolio'
  | 'booklet'
  | 'invitation'
  | 'flipbook'
  | 'presentation'
  | 'newspaper'
  | 'business'
  | 'corporate'
  | 'annual-report'
  | 'creative'
  | 'storybook'
  | 'event'
  | 'travel'
  | 'pitch-deck'
  | 'theatre'
  | 'comic'
  | 'automotive'
  | 'architecture'
  | 'poetry';

export interface TemplatePreset {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: TemplateCategory;
  categoryLabel: string;
  coverImageUrl?: string;
  badge?: 'PRO' | 'POPULAR' | 'NEW' | 'FEATURED';
  coverBadge?: string;
  pageCount: number;
  aspectRatio?: string;
  themeId: CoverThemeId;
  tags: string[];
  project: BookProject;
  iconName?: string;
  primaryColor?: string;
}

export type StageBackdrop = 'studio' | 'dark' | 'wood' | 'marble' | 'linen';
export type AppNavView = 'home' | 'templates' | 'studio' | 'bookshelf' | 'reader' | 'share';

export interface SavedBookRecord {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  themeId: CoverThemeId;
  pageCount: number;
  lastModified: number;
  createdAt?: number;
  coverImage?: string;
  project: BookProject;
}


