import { SectionDefinition, FieldType } from './types';

// The "Brutal Truth" Agency Structure
export const FORM_SECTIONS: SectionDefinition[] = [
  // SECTION 1: GOAL & PURPOSE
  {
    id: 's2_goals',
    title: '1. Goals & Purpose',
    description: 'We need absolute clarity on what this website must achieve.',
    fields: [
      // MASTER SWITCH FOR WEBSITE TYPE
      { 
        id: 'website_type', 
        label: 'Website Type', 
        type: FieldType.SELECT, 
        options: ['Business/Service', 'E-commerce', 'Portfolio', 'Landing Page'],
        required: true,
        description: 'This selection determines the rest of the questions in this form.'
      },
      // NEW: EXPLICIT PLATFORM SELECTION
      { 
        id: 'project_platform', 
        label: 'Tech Stack / Platform', 
        type: FieldType.SELECT, 
        options: ['WordPress', 'Shopify', 'Webflow', 'React/Next.js', 'Custom Code', 'Wix/Squarespace'],
        required: true,
        description: 'The core technology powering the site.'
      },
      // NEW: EXPLICIT TIER SELECTION
      { 
        id: 'project_tier', 
        label: 'Service Tier', 
        type: FieldType.SELECT, 
        options: ['Basic (Template)', 'Standard (Customized)', 'Premium (Fully Custom)', 'Enterprise'],
        required: true 
      },
      { 
        id: 'primary_goal', 
        label: 'Primary Goal of the Website', 
        type: FieldType.SELECT, 
        options: ['Leads', 'Sales', 'Branding', 'Information'],
        required: true 
      },
      { 
        id: 'secondary_goals', 
        label: 'Secondary Goals', 
        type: FieldType.TEXTAREA, 
        required: false 
      },
      { id: 'target_audience', label: 'Target Audience Description', type: FieldType.TEXT, required: false },
      { id: 'target_country', label: 'Target Country/Region', type: FieldType.TEXT, required: false },
    ]
  },

  // SECTION 2: DOMAIN (Common)
  {
    id: 's3_domain',
    title: '2. Domain Information',
    description: 'Critical infrastructure decisions. No website launches without this.',
    fields: [
      { id: 'has_domain', label: 'Do you already own a domain?', type: FieldType.BOOLEAN, required: true }, 
      
      { 
        id: 'domain_name', label: 'Domain Name', type: FieldType.TEXT, required: true,
        condition: (d) => d['has_domain']?.value === true 
      },
      { 
        id: 'registrar', label: 'Domain Registrar (e.g. GoDaddy)', type: FieldType.TEXT, required: false,
        condition: (d) => d['has_domain']?.value === true 
      },
      { 
        id: 'registrar_access', label: 'Do you have login access?', type: FieldType.BOOLEAN, required: true, 
        condition: (d) => d['has_domain']?.value === true 
      },
      { 
        id: 'dns_manager', label: 'Who will manage DNS settings?', type: FieldType.SELECT, options: ['Client IT Team', 'Agency'], required: true,
        condition: (d) => d['has_domain']?.value === true 
      },

      { 
        id: 'agency_purchase_domain', label: 'Do you want us to purchase the domain?', type: FieldType.BOOLEAN, required: true,
        condition: (d) => d['has_domain']?.value === false 
      },
      { 
        id: 'preferred_domains', label: 'Preferred Domain Names', type: FieldType.TEXTAREA, required: false,
        condition: (d) => d['has_domain']?.value === false 
      },
      { 
        id: 'ack_domain_budget', label: 'I acknowledge domain purchase is billable', type: FieldType.BOOLEAN, required: true,
        condition: (d) => d['has_domain']?.value === false 
      },
    ]
  },

  // SECTION 3: HOSTING (Common)
  {
    id: 's4_hosting',
    title: '3. Hosting & Server',
    description: 'Where the website lives. Delays here stop the project.',
    fields: [
      { id: 'has_existing_site', label: 'Is there an existing website?', type: FieldType.BOOLEAN, required: true },
      
      { 
        id: 'current_host', label: 'Current Hosting Provider', type: FieldType.TEXT, required: false,
        condition: (d) => d['has_existing_site']?.value === true
      },
      { 
        id: 'migration_required', label: 'Is migration required?', type: FieldType.BOOLEAN, required: true,
        condition: (d) => d['has_existing_site']?.value === true
      },

      { 
        id: 'agency_hosting', label: 'Do you want us to provide hosting?', type: FieldType.BOOLEAN, required: true,
        condition: (d) => d['has_existing_site']?.value === false || d['migration_required']?.value === true
      },
      
      { 
        id: 'hosting_access_deadline', label: 'Deadline to provide CPanel/FTP Access', type: FieldType.DATE, required: false,
        condition: (d) => d['agency_hosting']?.value === false
      },
      { 
        id: 'ack_hosting_delays', label: 'I accept delays caused by server access issues', type: FieldType.BOOLEAN, required: true,
        condition: (d) => d['agency_hosting']?.value === false
      },
    ]
  },

  // SECTION 4: STRUCTURE (Common)
  {
    id: 's5_structure',
    title: '4. Website Structure',
    description: 'The blueprint. No page = no build.',
    fields: [
      { id: 'total_pages', label: 'Estimated Number of Pages', type: FieldType.TEXT, required: true }, 
      { 
        id: 'sitemap_list', 
        label: 'List Required Pages (Home, About, etc.)', 
        type: FieldType.TEXTAREA, 
        required: false 
      },
      { 
        id: 'content_source_policy', 
        label: 'Primary Content Source', 
        type: FieldType.SELECT, 
        options: ['Client Provides All', 'Agency Writes All', 'Hybrid'],
        required: true 
      }
    ]
  },

  // SECTION 5: DESIGN (Common)
  {
    id: 's6_design',
    title: '5. Design & Brand',
    description: 'Visual requirements.',
    fields: [
      { 
        id: 'logo_status', 
        label: 'Logo Status', 
        type: FieldType.SELECT, 
        options: ['Uploaded Below', 'We don\'t have one', 'Agency to create'], 
        required: true 
      },
      { 
        id: 'logo_upload', label: 'Upload Logo Files', type: FieldType.FILE_UPLOAD, required: false,
        condition: (d) => d['logo_status']?.value === 'Uploaded Below'
      },
      { 
        id: 'brand_colors', label: 'Brand Colors', type: FieldType.TEXT, required: false 
      },
      { id: 'ref_likes', label: 'Reference Websites (Likes)', type: FieldType.TEXTAREA, required: false },
      { id: 'ref_dislikes', label: 'Reference Websites (Dislikes)', type: FieldType.TEXTAREA, required: false },
    ]
  },

  // SECTION 6: CONTENT (Common)
  {
    id: 's7_content',
    title: '6. Content & Copy',
    description: 'This section prevents 80% of project delays.',
    fields: [
      { 
        id: 'content_responsibility', 
        label: 'Who provides final website content?', 
        type: FieldType.SELECT, 
        options: ['Client', 'Agency'], 
        required: true 
      },
      
      { 
        id: 'content_deadline', label: 'Content Delivery Deadline', type: FieldType.DATE, required: false,
        condition: (d) => d['content_responsibility']?.value === 'Client'
      },
      { 
        id: 'approval_authority', label: 'Who has final approval authority?', type: FieldType.TEXT, required: false,
        condition: (d) => d['content_responsibility']?.value === 'Client'
      },

      { 
        id: 'copy_tone', label: 'Desired Brand Tone', type: FieldType.TEXT, required: false,
        condition: (d) => d['content_responsibility']?.value === 'Agency'
      },
      { 
        id: 'seo_keywords', label: 'Target Keywords', type: FieldType.TEXTAREA, required: false,
        condition: (d) => d['content_responsibility']?.value === 'Agency'
      },
    ]
  },

  // --- SERVICE SPECIFIC SECTION ---
  {
    id: 's_service_functional',
    title: '7. Service Requirements',
    description: 'Specific functionality for service-based businesses.',
    // Condition: Only show if Website Type is 'Business/Service'
    condition: (data) => data['website_type']?.value === 'Business/Service' || !data['website_type'], // Default to this if empty
    fields: [
      { id: 'needs_contact_form', label: 'Contact Forms?', type: FieldType.BOOLEAN, required: true },
      { id: 'needs_booking', label: 'Booking / Reservation System?', type: FieldType.BOOLEAN, required: true },
      
      { 
        id: 'booking_system_name', label: 'Which booking system? (e.g. Calendly, MindBody)', type: FieldType.TEXT, required: false,
        condition: (d) => d['needs_booking']?.value === true
      },
      { 
        id: 'needs_portfolio', label: 'Project Portfolio / Case Studies?', type: FieldType.BOOLEAN, required: true 
      },
      {
        id: 'needs_services_list', label: 'Detailed Service Listings?', type: FieldType.BOOLEAN, required: true
      }
    ]
  },

  // --- E-COMMERCE SPECIFIC SECTION ---
  {
    id: 's_ecommerce',
    title: '7. E-Commerce Scope',
    description: 'Specifics for your online store infrastructure.',
    // Condition: Only show if Website Type is 'E-commerce'
    condition: (data) => data['website_type']?.value === 'E-commerce',
    fields: [
      {
        id: 'product_count',
        label: 'Estimated Product Count (SKUs)',
        type: FieldType.SELECT,
        options: ['1-10 Products', '11-50 Products', '50-200 Products', '200+ Products'],
        required: true
      },
      {
        id: 'product_type',
        label: 'Product Type',
        type: FieldType.SELECT,
        options: ['Physical Goods (Shipping)', 'Digital Downloads', 'Services/Subscriptions'],
        required: true
      },
      {
        id: 'payment_gateways',
        label: 'Required Payment Gateways',
        type: FieldType.SELECT,
        options: ['Stripe (Card)', 'PayPal', 'Both Stripe & PayPal', 'Other / Local Provider'],
        required: true
      },
      {
        id: 'shipping_rules',
        label: 'Shipping Logic',
        type: FieldType.SELECT,
        options: ['Flat Rate / Free Shipping', 'Weight Based', 'Real-time Carrier Rates (FedEx/UPS)', 'No Shipping (Digital/Service)'],
        required: true,
        condition: (d) => d['product_type']?.value === 'Physical Goods (Shipping)'
      },
      {
        id: 'tax_calculation',
        label: 'Sales Tax Calculation',
        type: FieldType.SELECT,
        options: ['Basic (Manual Rates)', 'Automated (Avalara/TaxJar)', 'Not Required'],
        required: true
      },
      {
        id: 'product_data_source',
        label: 'Do you have a product CSV/Excel ready?',
        type: FieldType.BOOLEAN,
        required: true,
        description: 'Migrating data manually is a significant scope item.'
      }
    ]
  },

  // SECTION 8: SEO (Common)
  {
    id: 's9_seo',
    title: '8. SEO & Performance',
    description: 'Scope limited to website setup only.',
    fields: [
      { id: 'basic_seo_req', label: 'Basic On-Page SEO Required?', type: FieldType.BOOLEAN, required: true },
      { 
        id: 'meta_titles_resp', label: 'Meta Titles/Descriptions Responsibility', type: FieldType.SELECT, options: ['Client', 'Agency'], required: false,
        condition: (d) => d['basic_seo_req']?.value === true
      },
      { 
        id: 'analytics_setup', label: 'Google Analytics Setup?', type: FieldType.BOOLEAN, required: false,
        condition: (d) => d['basic_seo_req']?.value === true
      },
    ]
  },

  // SECTION 9: ACCESS (Common)
  {
    id: 's10_access',
    title: '9. Access Checklist',
    description: 'We cannot start without these.',
    fields: [
      { id: 'access_domain', label: 'Domain Registrar Access', type: FieldType.SELECT, options: ['Provided', 'Will Provide', 'Agency Creating'], required: false },
      { id: 'access_hosting', label: 'Hosting/CPanel Access', type: FieldType.SELECT, options: ['Provided', 'Will Provide', 'Agency Creating'], required: false },
      { id: 'access_cms', label: 'CMS Admin Access (if existing)', type: FieldType.SELECT, options: ['Provided', 'Will Provide', 'NA'], required: false },
    ]
  }
];