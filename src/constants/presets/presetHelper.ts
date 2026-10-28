import { BookProject, PageContent, CoverThemeId } from '../../types/flipbook';

export interface PresetConfig {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  edition: string;
  year: string;
  publisher: string;
  themeId: CoverThemeId;
  headerTag: string;
  footerNote: string;
  categoryLabel: string;
  isbn: string;
  priceTag: string;
  heroImage: string;
  galleryImages: string[];
  tableOfContents?: {
    title?: string;
    subtitle?: string;
    items: { id: string; title: string; description: string }[];
  };
  chapters: {
    number: string;
    tag: string;
    title: string;
    subtitle: string;
    quote: string;
    quoteAuthor: string;
    quoteRole: string;
    paragraph1: string;
    paragraph2: string;
    twoCol1: string;
    twoCol2: string;
  }[];
  specialBlocks: {
    type: string;
    title: string;
    subtitle: string;
    items: { id: string; title: string; description: string; tag?: string; highlight?: string; icon?: string; price?: string }[];
  }[];
  essay?: {
    headerTag?: string;
    title: string;
    subtitle: string;
    paragraph1: string;
    paragraph2: string;
    calloutTitle?: string;
    calloutText?: string;
  };
  specifications?: {
    headerTag?: string;
    title: string;
    subtitle: string;
    sectionTitle?: string;
    imageUrl?: string;
    imageCaption?: string;
    paragraph1?: string;
    items: { id: string; title: string; description: string }[];
  };
  philosophy?: {
    headerTag?: string;
    title: string;
    quoteText: string;
    quoteAuthor: string;
    quoteRole: string;
    description: string;
  };
  technicalMatrix?: {
    headerTag?: string;
    title: string;
    subtitle: string;
    items: { id: string; icon: string; title: string; description: string }[];
  };
  caseStudies?: {
    headerTag?: string;
    title: string;
    subtitle: string;
    items: { id: string; tag: string; title: string; description: string; highlight: string }[];
  };
  retrospective?: {
    headerTag?: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    noteTitle?: string;
    noteText?: string;
  };
  authorBio: {
    name: string;
    bio: string;
    avatar: string;
    socials: string;
    signature: string;
    colophonItems?: { id: string; title: string; description: string }[];
  };
  archivalColophon?: {
    headerTag?: string;
    title: string;
    subtitle: string;
    items: { id: string; icon: string; title: string; description: string }[];
  };
  backCover?: {
    quote: string;
    quoteAuthor: string;
  };
}

export function build20PageBookProject(config: PresetConfig): BookProject {
  const pages: PageContent[] = [];

  // Page 0: Cover Front
  pages.push({
    id: `${config.id}-p0-cover`,
    template: 'cover-front',
    title: config.title,
    subtitle: config.subtitle,
    headerTag: config.headerTag,
    footerNote: config.footerNote,
    coverImageUrl: config.heroImage,
  });

  // Page 1: Table of Contents / Index
  pages.push({
    id: `${config.id}-p1-toc`,
    template: 'table-of-contents',
    title: config.tableOfContents?.title || 'COMPREHENSIVE INDEX',
    subtitle: config.tableOfContents?.subtitle || '10-Leaf Curated Edition & Interactive Navigation',
    bulletItems: config.tableOfContents?.items || [
      { id: 't1', title: `01. ${config.chapters[0]?.title || 'Foreword & Vision'}`, description: 'Leaf 1' },
      { id: 't2', title: `02. ${config.chapters[0]?.subtitle || 'Theoretical Foundations'}`, description: 'Leaf 2' },
      { id: 't3', title: `03. Visual Spread & Archival Photography`, description: 'Leaf 3' },
      { id: 't4', title: `04. ${config.chapters[1]?.title || 'Core Methodology'}`, description: 'Leaf 4' },
      { id: 't5', title: `05. Feature Architecture & Key Pillars`, description: 'Leaf 5' },
      { id: 't6', title: `06. Specialized Case Study & Performance Matrix`, description: 'Leaf 6' },
      { id: 't7', title: `07. ${config.chapters[2]?.title || 'Advanced Execution'}`, description: 'Leaf 7' },
      { id: 't8', title: `08. Deep Dive Technical Analysis`, description: 'Leaf 8' },
      { id: 't9', title: `09. About the Creator & Publication Colophon`, description: 'Leaf 9' },
      { id: 't10', title: '10. Back Cover & Critical Acclaim', description: 'Leaf 10' },
    ],
    footerNote: `${config.edition} • Archival Quality Stock`,
  });

  // Page 2: Chapter 1 Intro
  const ch1 = config.chapters[0];
  pages.push({
    id: `${config.id}-p2-ch1`,
    template: 'chapter-intro',
    chapterNumber: ch1?.number || '01',
    title: ch1?.title || 'Foundations & Vision',
    subtitle: ch1?.subtitle || 'Setting the paradigm for modern craft',
    quoteText: ch1?.quote || 'Excellence is not an act, but a habit.',
    quoteAuthor: ch1?.quoteAuthor || config.author,
    paragraph1: ch1?.paragraph1 || 'In this opening chapter, we explore the core principles that define craftsmanship.',
    paragraph2: ch1?.paragraph2 || 'Every element is shaped with deliberate precision and harmonic balance.',
    blocks: [
      {
        id: 'b-ch1-head',
        type: 'chapter-header',
        chapterNumber: `CHAPTER ${ch1?.number || '01'}`,
        tag: ch1?.tag || 'CORE PRINCIPLES',
        title: ch1?.title || 'Foundations & Vision',
      },
      {
        id: 'b-ch1-quote',
        type: 'quote-block',
        quoteText: ch1?.quote || 'Simplicity is about subtracting the obvious and adding the meaningful.',
        quoteAuthor: ch1?.quoteAuthor || config.author,
        quoteRole: ch1?.quoteRole || 'Principal Architect',
      },
      {
        id: 'b-ch1-p1',
        type: 'dropcap-paragraph',
        paragraph1: ch1?.paragraph1 || 'Beginning our journey through deliberate execution and timeless aesthetics.',
      },
    ],
  });

  // Page 3: Chapter 1 Deep Dive / Two-Column Article
  pages.push({
    id: `${config.id}-p3-art1`,
    template: 'story-article',
    headerTag: `${ch1?.tag || 'ANALYSIS'} • SECTION I`,
    title: ch1?.subtitle || 'Harmonic Foundations',
    blocks: [
      {
        id: 'b-art1-head',
        type: 'heading-1',
        title: ch1?.subtitle || 'Harmonic Foundations',
        align: 'left',
      },
      {
        id: 'b-art1-sub',
        type: 'subtitle',
        subtitle: ch1?.title || 'Exploring structural balance, optical weight, and narrative rhythm',
        align: 'left',
      },
      {
        id: 'b-art1-p',
        type: 'dropcap-paragraph',
        paragraph1: ch1?.paragraph2 || 'Carefully chosen proportions provide visual breathing room and effortless clarity.',
      },
      {
        id: 'b-art1-twocol',
        type: 'two-column-text',
        paragraph1: ch1?.twoCol1 || 'The synthesis of physical tactility and virtual elegance creates a lasting emotional connection.',
        paragraph2: ch1?.twoCol2 || 'Through iterative refinement, complex ideas distill into pure, intuitive interactions.',
      },
    ],
  });

  // Page 4: Visual Showcase Gallery
  pages.push({
    id: `${config.id}-p4-img1`,
    template: 'image-showcase',
    headerTag: 'GALLERY EXHIBIT • I',
    title: `${config.title} • Visual Study`,
    subtitle: 'Atmospheric lighting and textural captures',
    blocks: [
      {
        id: 'b-img1-head',
        type: 'heading-2',
        title: `${config.title} • Visual Study`,
        align: 'left',
      },
      {
        id: 'b-img1-pic',
        type: 'image-block',
        imageUrl: config.galleryImages[0] || config.heroImage,
        imageCaption: `Exhibit A: Photographic plate illustrating ${config.title.toLowerCase()} aesthetics.`,
      },
      {
        id: 'b-img1-desc',
        type: 'paragraph',
        paragraph1: `Every surface reflection, shadow depth, and material gradient in ${config.title} is calibrated to evoke tangible presence and authenticity.`,
      },
    ],
  });

  // Page 5: Split Image & Prose
  pages.push({
    id: `${config.id}-p5-split1`,
    template: 'image-text-split',
    headerTag: 'CURATORIAL STUDY • II',
    title: 'Materiality & Form',
    subtitle: 'Juxtaposition of tactile texture and refined typography',
    blocks: [
      {
        id: 'b-split-head',
        type: 'heading-2',
        title: 'Materiality & Form',
        align: 'left',
      },
      {
        id: 'b-split-body',
        type: 'image-text-split',
        title: 'Tactile Precision',
        imageUrl: config.galleryImages[1] || config.heroImage,
        imageCaption: 'Macro perspective capturing authentic grain and subtle tonal nuances.',
        paragraph1: `When visual weight is paired thoughtfully with generous negative space, readers engage with sustained focus and deep appreciation for ${config.title.toLowerCase()}.`,
      },
      {
        id: 'b-split-callout',
        type: 'callout-box',
        title: 'CURATORIAL NOTE',
        paragraph1: `True distinction lies in discipline and restraint. By highlighting essential elements, ${config.title} achieves enduring relevance.`,
      },
    ],
  });

  // Page 6: Chapter 2 Intro
  const ch2 = config.chapters[1] || config.chapters[0];
  pages.push({
    id: `${config.id}-p6-ch2`,
    template: 'chapter-intro',
    chapterNumber: ch2?.number || '02',
    title: ch2?.title || 'Core Methodology',
    subtitle: ch2?.subtitle || 'Systematic frameworks for highest impact',
    quoteText: ch2?.quote || 'Form follows function, but feeling elevates form.',
    quoteAuthor: ch2?.quoteAuthor || config.author,
    paragraph1: ch2?.paragraph1 || 'Advancing into strategic execution and proven structural paradigms.',
    blocks: [
      {
        id: 'b-ch2-head',
        type: 'chapter-header',
        chapterNumber: `CHAPTER ${ch2?.number || '02'}`,
        tag: ch2?.tag || 'METHODOLOGY',
        title: ch2?.title || 'Core Methodology',
      },
      {
        id: 'b-ch2-quote',
        type: 'quote-block',
        quoteText: ch2?.quote || 'Consistency builds recognition; nuance builds devotion.',
        quoteAuthor: ch2?.quoteAuthor || config.author,
        quoteRole: ch2?.quoteRole || 'Lead Strategist',
      },
      {
        id: 'b-ch2-p1',
        type: 'dropcap-paragraph',
        paragraph1: ch2?.paragraph1 || 'Establishing a robust foundation requires understanding both macro structure and micro interactions.',
      },
    ],
  });

  // Page 7: Key Tenets / Feature Cards
  const spec1 = config.specialBlocks[0];
  pages.push({
    id: `${config.id}-p7-feat`,
    template: 'feature-list',
    headerTag: 'STRATEGIC PILLARS',
    title: spec1?.title || 'Core Architectural Tenets',
    subtitle: spec1?.subtitle || 'Fundamental pillars of execution',
    blocks: [
      {
        id: 'b-feat-head',
        type: 'heading-2',
        title: spec1?.title || 'Core Architectural Tenets',
        align: 'left',
      },
      {
        id: 'b-feat-cards',
        type: 'feature-cards',
        title: 'Execution Matrix',
        items: spec1?.items || [
          { id: 'f1', title: 'Precision Layout', description: 'Mathematical grid spacing ensuring visual harmony across all viewports.', icon: 'Layers' },
          { id: 'f2', title: 'Tactile Dynamics', description: 'Kinetic curves simulating physical weight and authentic resistance.', icon: 'Sparkles' },
          { id: 'f3', title: 'Archival Typography', description: 'High-contrast display pairings with optical kerning and leading.', icon: 'Award' },
          { id: 'f4', title: 'Standalone Independence', description: 'Zero external dependencies; exports seamlessly to self-contained HTML.', icon: 'Download' },
        ],
      },
    ],
  });

  // Page 8: Key Points Grid / Performance Metrics
  const spec2 = config.specialBlocks[1] || config.specialBlocks[0];
  pages.push({
    id: `${config.id}-p8-grid`,
    template: 'key-points-grid',
    headerTag: 'DATA & BENCHMARKS',
    title: spec2?.title || 'Performance Indicators',
    subtitle: spec2?.subtitle || 'Quantitative & qualitative assessment benchmarks',
    blocks: [
      {
        id: 'b-grid-head',
        type: 'heading-2',
        title: spec2?.title || 'Performance Indicators',
        align: 'left',
      },
      {
        id: 'b-grid-items',
        type: 'grid-cards',
        title: 'Benchmark Overview',
        items: spec2?.items || [
          { id: 'g1', tag: '01 / SPEED', title: 'Sub-16ms Frame Time', description: 'Silky smooth 60 FPS hardware accelerated leaf rotation.', highlight: '< 16ms' },
          { id: 'g2', tag: '02 / EFFICIENCY', title: 'Ultra-Compact Size', description: 'Pure procedural rendering eliminating heavy runtime assets.', highlight: '98% Lean' },
          { id: 'g3', tag: '03 / ACCESSIBILITY', title: 'Omnichannel Controls', description: 'Seamless keyboard, touch swipe, mouse drag, and voice support.', highlight: '100% WCAG' },
          { id: 'g4', tag: '04 / FIDELITY', title: 'Retina Crispness', description: 'Vector typography and razor-sharp SVG embellishments on 4K displays.', highlight: '4K Native' },
        ],
      },
    ],
  });

  // Page 9: Chapter 3 Intro
  const ch3 = config.chapters[2] || config.chapters[0];
  pages.push({
    id: `${config.id}-p9-ch3`,
    template: 'chapter-intro',
    chapterNumber: ch3?.number || '03',
    title: ch3?.title || 'Advanced Synthesis',
    subtitle: ch3?.subtitle || 'Synthesizing theory, craft, and execution',
    quoteText: ch3?.quote || 'Details are not the details. They make the design.',
    quoteAuthor: ch3?.quoteAuthor || 'Charles Eames',
    paragraph1: ch3?.paragraph1 || 'In this final chapter, we synthesize all elements into an enduring, coherent body of work.',
    blocks: [
      {
        id: 'b-ch3-head',
        type: 'chapter-header',
        chapterNumber: `CHAPTER ${ch3?.number || '03'}`,
        tag: ch3?.tag || 'ADVANCED SYNTHESIS',
        title: ch3?.title || 'Advanced Synthesis',
      },
      {
        id: 'b-ch3-quote',
        type: 'quote-block',
        quoteText: ch3?.quote || 'Perfection is achieved when there is nothing left to take away.',
        quoteAuthor: ch3?.quoteAuthor || 'Antoine de Saint-Exupéry',
        quoteRole: 'Philosopher & Author',
      },
      {
        id: 'b-ch3-p1',
        type: 'dropcap-paragraph',
        paragraph1: ch3?.paragraph1 || 'Bringing together structural discipline, aesthetic warmth, and intuitive storytelling.',
      },
    ],
  });

  // Page 10: Deep Editorial Two-Column Essay (Theme-tailored)
  const essay = config.essay;
  pages.push({
    id: `${config.id}-p10-essay`,
    template: 'story-article',
    headerTag: essay?.headerTag || 'IN-DEPTH ESSAY',
    title: essay?.title || `${config.title}: The Enduring Standard`,
    blocks: [
      {
        id: 'b-essay-head',
        type: 'heading-1',
        title: essay?.title || `${config.title}: The Enduring Standard`,
        align: 'left',
      },
      {
        id: 'b-essay-sub',
        type: 'subtitle',
        subtitle: essay?.subtitle || `An analytical reflection on the methods, materiality, and enduring legacy of ${config.title.toLowerCase()}.`,
        align: 'left',
      },
      {
        id: 'b-essay-twocol',
        type: 'two-column-text',
        paragraph1: essay?.paragraph1 || ch3?.twoCol1 || 'When readers interact with a dedicated physical or virtual publication, retention increases exponentially compared to endless-scroll feeds.',
        paragraph2: essay?.paragraph2 || ch3?.twoCol2 || 'By honoring classical composition while embracing modern web craft, we build experiences that bridge heritage and forward-looking innovation.',
      },
      {
        id: 'b-essay-callout',
        type: 'callout-box',
        title: essay?.calloutTitle || 'ARCHIVAL SUMMARY',
        paragraph1: essay?.calloutText || `Every turn of the page resonates with tactile purpose, giving ${config.title.toLowerCase()} the prestige and permanence it deserves.`,
      },
    ],
  });

  // Page 11: Full Bleed Visual Interlude III
  pages.push({
    id: `${config.id}-p11-fullbleed`,
    template: 'image-showcase',
    headerTag: 'CURATOR ARCHIVE • III',
    title: 'Plate III: Photographic Composition',
    subtitle: 'Medium-format documentation of detail and ambiance',
    blocks: [
      {
        id: 'b-full-head',
        type: 'heading-2',
        title: 'Plate III: Photographic Composition',
        align: 'left',
      },
      {
        id: 'b-full-img',
        type: 'image-block',
        imageUrl: config.galleryImages[2] || config.galleryImages[0] || config.heroImage,
        imageCaption: `Plate III: Spatial setting and lighting framing ${config.title.toLowerCase()}.`,
      },
      {
        id: 'b-full-note',
        type: 'paragraph',
        paragraph1: `The interplay between ambient illumination and deep shadow fields creates an evocative atmosphere that invites prolonged contemplation.`,
      },
    ],
  });

  // Page 12: Split Article with Technical Specs (Theme-tailored)
  const specs = config.specifications;
  pages.push({
    id: `${config.id}-p12-split2`,
    template: 'image-text-split',
    headerTag: specs?.headerTag || 'SPECIFICATION BRIEF',
    title: specs?.title || 'Precision Specifications & Ratios',
    subtitle: specs?.subtitle || 'Exact formulas, ratios, and fabrication standards',
    blocks: [
      {
        id: 'b-spec-head',
        type: 'heading-2',
        title: specs?.title || 'Precision Specifications & Ratios',
        align: 'left',
      },
      {
        id: 'b-spec-body',
        type: 'image-text-split',
        title: specs?.sectionTitle || 'Technical Standards',
        imageUrl: specs?.imageUrl || config.galleryImages[3] || config.galleryImages[1] || config.heroImage,
        imageCaption: specs?.imageCaption || 'Archival blueprint and structural layout verification.',
        paragraph1: specs?.paragraph1 || `Adhering to strict dimensional parameters and golden ratios ensures that ${config.title.toLowerCase()} maintains optimal aesthetic clarity across all formats.`,
      },
      {
        id: 'b-spec-table',
        type: 'table-specs',
        title: specs?.sectionTitle || 'Structural Dimensions',
        items: specs?.items || [
          { id: 's1', title: 'Standard Ratio', description: '1:1.414 (Golden Proportion)' },
          { id: 's2', title: 'Typographic Contrast', description: '1.333 Perfect Fourth Scale' },
          { id: 's3', title: 'Color Gamut', description: 'Calibrated P3 Wide Dynamic Range' },
          { id: 's4', title: 'Archival Class', description: 'Grade-A Acid-Free Certification' },
        ],
      },
    ],
  });

  // Page 13: Quote Highlight & Philosophy (Theme-tailored)
  const phil = config.philosophy;
  pages.push({
    id: `${config.id}-p13-quote`,
    template: 'quote-highlight',
    headerTag: phil?.headerTag || 'CENTRAL MANIFESTO',
    title: phil?.title || 'Guiding Philosophy',
    quoteText: phil?.quoteText || `“The goal is not merely to transmit information, but to evoke wonder, intimacy, and tactile presence in every single detail.”`,
    quoteAuthor: phil?.quoteAuthor || config.author,
    quoteRole: phil?.quoteRole || 'Creator & Visionary',
    blocks: [
      {
        id: 'b-qhi-head',
        type: 'heading-1',
        title: phil?.title || 'Guiding Philosophy',
        align: 'center',
      },
      {
        id: 'b-qhi-quote',
        type: 'quote-block',
        quoteText: phil?.quoteText || `The goal is not merely to transmit information, but to evoke wonder, intimacy, and tactile presence in every single detail.`,
        quoteAuthor: phil?.quoteAuthor || config.author,
        quoteRole: phil?.quoteRole || 'Creator & Visionary',
      },
      {
        id: 'b-qhi-desc',
        type: 'paragraph',
        paragraph1: phil?.description || `Every texture, curve, and typographical measure in ${config.title} has been refined to deliver an inspiring, distraction-free environment.`,
        align: 'center',
      },
    ],
  });

  // Page 14: Technical Matrix / Domain Capabilities (Theme-tailored)
  const techMat = config.technicalMatrix;
  pages.push({
    id: `${config.id}-p14-techspec`,
    template: 'feature-list',
    headerTag: techMat?.headerTag || 'TECHNICAL CAPABILITIES',
    title: techMat?.title || 'Operational & Structural Architecture',
    subtitle: techMat?.subtitle || 'Core specifications and performance parameters',
    bulletItems: techMat?.items || [
      { id: 'e1', icon: 'Layers', title: 'Structural Integrity', description: 'Rigorous engineering standards with dynamic responsive adaptations.' },
      { id: 'e2', icon: 'Sparkles', title: 'Kinetic Synthesis', description: 'True-to-life physics curves simulating physical resistance and weight.' },
      { id: 'e3', icon: 'Smartphone', title: 'Adaptive Geometry', description: 'Flawless presentation across mobile portrait and dual-spread desktop displays.' },
      { id: 'e4', icon: 'Download', title: 'Zero Dependency Export', description: 'Complete offline portability as a self-contained standalone publication.' },
    ],
    footerNote: `${config.publisher} • Engineered for 2026 Standards`,
  });

  // Page 15: Case Studies & Production Notes (Theme-tailored)
  const caseSt = config.caseStudies;
  pages.push({
    id: `${config.id}-p15-cases`,
    template: 'key-points-grid',
    headerTag: caseSt?.headerTag || 'PORTFOLIO HIGHLIGHTS',
    title: caseSt?.title || 'Featured Deployments & Field Studies',
    subtitle: caseSt?.subtitle || 'Documented real-world applications and impact',
    blocks: [
      {
        id: 'b-case-head',
        type: 'heading-2',
        title: caseSt?.title || 'Featured Deployments & Field Studies',
        align: 'left',
      },
      {
        id: 'b-case-cards',
        type: 'grid-cards',
        title: 'Real-World Performance',
        items: caseSt?.items || [
          { id: 'c1', tag: '01 / IMPACT', title: '3.8x Reader Dwell', description: 'Substantially higher engagement compared to flat scroll feeds.', highlight: '+280%' },
          { id: 'c2', tag: '02 / RETENTION', title: '94% Completion', description: 'Readers turn through all pages from cover to back colophon.', highlight: '94%' },
          { id: 'c3', tag: '03 / ADVANTAGE', title: 'High Satisfaction', description: 'Universally praised for visual polish and acoustic realism.', highlight: '4.9/5' },
          { id: 'c4', tag: '04 / ACCLAIM', title: 'Gold Standard', description: 'Recognized as an exemplary benchmark in modern publishing.', highlight: 'Award Winner' },
        ],
      },
    ],
  });

  // Page 16: Curatorial Retrospective (Theme-tailored)
  const retro = config.retrospective;
  pages.push({
    id: `${config.id}-p16-retro`,
    template: 'story-article',
    headerTag: retro?.headerTag || 'EDITORIAL RETROSPECTIVE',
    title: retro?.title || 'Reflections & Future Horizons',
    blocks: [
      {
        id: 'b-retro-head',
        type: 'heading-1',
        title: retro?.title || 'Reflections & Future Horizons',
        align: 'left',
      },
      {
        id: 'b-retro-twocol',
        type: 'two-column-text',
        paragraph1: retro?.paragraph1 || `As we conclude this curated edition of ${config.title}, we celebrate the artisans, theorists, and creators whose uncompromising vision made it possible.`,
        paragraph2: retro?.paragraph2 || `Whether experienced in print or on modern high-resolution screens, this volume stands as an enduring tribute to deliberate execution.`,
      },
      {
        id: 'b-retro-callout',
        type: 'callout-box',
        title: retro?.noteTitle || 'CREATOR’S DEDICATION',
        paragraph1: retro?.noteText || `Thank you for taking the time to explore this bespoke edition. May the ideas contained within inspire your own pursuits.`,
      },
    ],
  });

  // Page 17: Author / Atelier Bio
  pages.push({
    id: `${config.id}-p17-author`,
    template: 'author-bio',
    headerTag: 'ABOUT THE CREATOR',
    blocks: [
      {
        id: 'b-auth-head',
        type: 'heading-2',
        title: 'About the Creator',
        align: 'left',
      },
      {
        id: 'b-auth-card',
        type: 'author-card',
        authorName: config.authorBio.name || config.author,
        authorBio: config.authorBio.bio || `Principal architect and creative visionary behind ${config.title}, pioneering next-generation publishing and visual craft.`,
        authorAvatarUrl: config.authorBio.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        authorSocials: config.authorBio.socials || `${config.author.toLowerCase().replace(/[^a-z]/g, '')}.com • @${config.author.toLowerCase().replace(/[^a-z]/g, '')}`,
        authorSignature: config.authorBio.signature || config.author,
      },
      {
        id: 'b-auth-colophon',
        type: 'table-specs',
        title: 'Publication Colophon',
        items: config.authorBio.colophonItems || [
          { id: 'cl1', title: 'Edition', description: config.edition },
          { id: 'cl2', title: 'Typography', description: 'Plus Jakarta Sans & Playfair Display' },
          { id: 'cl3', title: 'Color Gamut', description: 'Calibrated P3 Wide Dynamic Range' },
          { id: 'cl4', title: 'Audio System', description: 'Native Web Audio Procedural Synthesis' },
        ],
      },
    ],
  });

  // Page 18: Reader Colophon & Archival Notes
  const archCol = config.archivalColophon;
  pages.push({
    id: `${config.id}-p18-colophon`,
    template: 'feature-list',
    headerTag: archCol?.headerTag || 'ARCHIVAL COLOPHON',
    title: archCol?.title || 'Colophon & Rights',
    subtitle: archCol?.subtitle || 'Archival preservation data and publication copyright',
    bulletItems: archCol?.items || [
      { id: 'cp1', icon: 'Award', title: 'First Edition Printing', description: `Published by ${config.publisher} in ${config.year}. All rights reserved.` },
      { id: 'cp2', icon: 'Shield', title: 'Zero Data Collection', description: 'Completely offline and private. No tracking pixels or telemetry.' },
      { id: 'cp3', icon: 'Globe', title: 'Universal Interoperability', description: 'Standard W3C CSS 3D & HTML5 compliant across all modern browsers.' },
      { id: 'cp4', icon: 'BookOpen', title: 'Archival Standard', description: 'Formatted for perpetual preservation and high-resolution print exports.' },
    ],
    footerNote: `Printed & Bound • ${config.publisher} • MMXXVI`,
  });

  // Page 19: Back Cover
  pages.push({
    id: `${config.id}-p19-back`,
    template: 'cover-back',
    title: config.title,
    subtitle: config.subtitle,
    paragraph1: config.backCover?.quote || `“A masterclass in presentation, visual rhythm, and 3D kinetic interaction. An indispensable benchmark for modern publishing.”`,
    authorName: config.backCover?.quoteAuthor || `— ${config.publisher} Editorial Review`,
    publisherName: config.publisher,
    isbn: config.isbn,
    barcodeNumber: config.isbn.replace(/[^0-9]/g, '').slice(0, 13) || '9780201896831',
    priceTag: config.priceTag,
    footerNote: `${config.edition} • Archival Quality • All Rights Reserved`,
  });

  return {
    id: config.id,
    title: config.title,
    subtitle: config.subtitle,
    author: config.author,
    edition: config.edition,
    year: config.year,
    publisher: config.publisher,
    themeId: config.themeId,
    soundEnabled: true,
    pageTurnSpeed: 'normal',
    pages,
  };
}
