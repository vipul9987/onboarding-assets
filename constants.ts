import { SectionDefinition, FieldType, ServiceType } from './types';

// Helpers for clean conditional logic
const isWebsite = (d: any) => ['WEBSITE', 'BOTH'].includes(d['service_scope']?.value);
const isSEO = (d: any) => ['SEO', 'BOTH'].includes(d['service_scope']?.value);

export const FORM_SECTIONS: SectionDefinition[] = [
  // SECTION 0: PROJECT GATEWAY
  {
    id: 's0_scope',
    title: 'Start: Service Track',
    description: 'First, let’s confirm what we are working on together. This determines the rest of the questions.',
    fields: [
      {
        id: 'service_scope',
        label: 'What services are we providing?',
        type: FieldType.SELECT,
        options: ['WEBSITE', 'SEO', 'BOTH'],
        required: true,
        contextLock: true,
        description: 'Locked by your Agency Account Manager.'
      }
    ]
  },

  // SECTION 1: BUSINESS IDENTITY & GOALS
  {
    id: 's1_identity',
    title: 'Phase 1: Your Business & Goals',
    description: 'Before we look at the tech, we need to understand your business objectives and who you are trying to reach.',
    fields: [
      { 
        id: 'website_type', 
        label: 'What type of website are we building?', 
        type: FieldType.SELECT, 
        options: ['Professional Business Site', 'Online Store (E-commerce)', 'Personal Portfolio', 'Single Landing Page'],
        required: true,
        condition: isWebsite,
        description: 'Helps us determine the structure and features needed.'
      },
      { 
        id: 'primary_goal', 
        label: 'What is the #1 thing this project must achieve?', 
        type: FieldType.SELECT, 
        options: ['Generate New Leads', 'Sell Products Online', 'Improve Brand Image', 'Provide Information/Resources'],
        required: true 
      },
      { 
        id: 'target_audience', 
        label: 'Who is your ideal customer?', 
        type: FieldType.TEXTAREA, 
        required: true,
        description: 'Describe them briefly: Age, location, interests, or industry.'
      },
      { 
        id: 'top_competitors', 
        label: 'Who are your main competitors?', 
        type: FieldType.TEXTAREA, 
        required: true,
        description: 'List 2-3 companies or websites you admire or compete with.'
      },
      { 
        id: 'seo_target_geo', 
        label: 'Where is your target market located?', 
        type: FieldType.TEXT, 
        required: true,
        condition: isSEO,
        description: 'Local (Specific City), National, or International?'
      }
    ]
  },

  // SECTION 2: DOMAIN & HOSTING
  {
    id: 's2_infrastructure',
    title: 'Phase 2: Domain & Hosting',
    description: 'Every website needs a name (Domain) and a home (Hosting). Let’s sort out where yours will live.',
    condition: isWebsite,
    fields: [
      { 
        id: 'has_domain', 
        label: 'Do you already have a website address (Domain)?', 
        type: FieldType.BOOLEAN, 
        required: true,
        description: 'e.g., www.yourcompany.com'
      }, 
      { 
        id: 'domain_name', 
        label: 'What is your current or desired domain?', 
        type: FieldType.TEXT, 
        required: true,
        condition: (d) => d['has_domain']?.value !== undefined 
      },
      { 
        id: 'has_existing_site', 
        label: 'Do you have an existing website live right now?', 
        type: FieldType.BOOLEAN, 
        required: true 
      },
      { 
        id: 'agency_hosting', 
        label: 'Would you like us to handle the hosting/servers for you?', 
        type: FieldType.BOOLEAN, 
        required: true,
        description: 'We recommend this for better security and performance.'
      },
      { 
        id: 'dns_manager', 
        label: 'Who currently manages your domain settings?', 
        type: FieldType.SELECT, 
        options: ['I have my own IT person', 'I will give the Agency access', 'I’m not sure'], 
        required: true,
        condition: (d) => d['has_domain']?.value === true 
      }
    ]
  },

  // SECTION 3: BLUEPRINT
  {
    id: 's3_blueprint',
    title: 'Phase 3: The Website Build',
    description: 'Now we get into the details of the site structure and design.',
    condition: isWebsite,
    fields: [
      { 
        id: 'total_pages', 
        label: 'How many pages do you expect the site to have?', 
        type: FieldType.SELECT, 
        options: ['Small (1-5 pages)', 'Medium (6-15 pages)', 'Large (15+ pages)', 'Massive / Custom'],
        required: true 
      },
      { 
        id: 'sitemap_list', 
        label: 'Which specific pages do you need?', 
        type: FieldType.TEXTAREA, 
        required: false,
        description: 'e.g. Home, About Us, Services, Contact, Blog...'
      },
      { 
        id: 'logo_status', 
        label: 'Do you have a high-quality logo ready?', 
        type: FieldType.SELECT, 
        options: ['Yes, I will upload it', 'No, I need the Agency to design one', 'I have a temporary one'], 
        required: true 
      },
      { 
        id: 'logo_upload', 
        label: 'Upload your Logo / Brand Assets', 
        type: FieldType.FILE_UPLOAD, 
        required: false,
        condition: (d) => d['logo_status']?.value === 'Yes, I will upload it'
      },
      { 
        id: 'content_source', 
        label: 'Who is writing the text for the website?', 
        type: FieldType.SELECT, 
        options: ['I will provide all the text', 'I want the Agency to write it', 'A mix of both'],
        required: true 
      }
    ]
  },

  // SECTION 4: E-COMMERCE
  {
    id: 's4_ecommerce',
    title: 'Phase 4: Your Online Store',
    description: 'Specific details for selling products online.',
    condition: (data) => isWebsite(data) && data['website_type']?.value === 'Online Store (E-commerce)',
    fields: [
      {
        id: 'product_count',
        label: 'How many different products will you sell?',
        type: FieldType.SELECT,
        options: ['1-10 Products', '11-100 Products', '100+ Products'],
        required: true
      },
      {
        id: 'payment_methods',
        label: 'How would you like customers to pay?',
        type: FieldType.SELECT,
        options: ['Credit Cards (Stripe)', 'PayPal', 'Both Stripe & PayPal', 'Other'],
        required: true
      }
    ]
  },

  // SECTION 5: SEO STRATEGY
  {
    id: 's5_seo',
    title: 'Phase 5: Search Optimization (SEO)',
    description: 'How we ensure people find you on Google.',
    condition: isSEO,
    fields: [
      { id: 'target_url', label: 'What website are we optimizing?', type: FieldType.TEXT, required: true },
      { 
        id: 'seo_access_status', 
        label: 'Can you provide access to your Google Search Console?', 
        type: FieldType.SELECT, 
        options: ['Yes, I will provide login', 'No, please set it up for me', 'I don’t know what this is'], 
        required: true,
        description: 'This allows us to see how Google views your site.'
      },
      { 
        id: 'keyword_priorities', 
        label: 'What phrases do you want to show up for?', 
        type: FieldType.TEXTAREA, 
        required: true,
        description: 'List 3-5 search terms someone would type to find you.'
      }
    ]
  },

  // SECTION 6: THE CHECKLIST
  {
    id: 's6_checklist',
    title: 'Final Step: Access Checklist',
    description: 'To start the work, we need to make sure we have the keys to the castle.',
    fields: [
      { 
        id: 'access_domain_ready', 
        label: 'I can provide Domain / Hosting logins today', 
        type: FieldType.BOOLEAN, 
        required: true,
        condition: isWebsite
      },
      { 
        id: 'access_analytics_ready', 
        label: 'I can provide Google Search/Analytics access today', 
        type: FieldType.BOOLEAN, 
        required: true,
        condition: isSEO
      },
      { 
        id: 'billing_agreement',
        label: 'I acknowledge that changes after submission are billable revisions',
        type: FieldType.BOOLEAN,
        required: true
      }
    ]
  }
];