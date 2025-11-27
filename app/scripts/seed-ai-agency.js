// scripts/seed-ai-agency.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🤖 Seeding AI Agency System...');

    // 1. Create Service Templates
    console.log('Creating service templates...');

    const websiteTemplate = await prisma.serviceTemplate.upsert({
        where: { serviceType_name: { serviceType: 'WEBSITE', name: 'Business Website' } },
        update: {},
        create: {
            serviceType: 'WEBSITE',
            name: 'Business Website',
            description: 'Complete business website with modern design, responsive layout, and SEO optimization',
            estimatedTime: 120, // 2 hours
            complexity: 'MEDIUM',
            requiredFields: JSON.stringify([
                { name: 'businessName', type: 'string', required: true },
                { name: 'industry', type: 'string', required: true },
                { name: 'style', type: 'select', options: ['modern', 'classic', 'minimal'], required: true },
                { name: 'pages', type: 'array', required: true },
                { name: 'features', type: 'array', required: false },
                { name: 'brandColors', type: 'array', required: false },
                { name: 'content', type: 'text', required: false }
            ]),
            instructions: `# Website Builder AI Instructions

You are an expert web developer building a complete Next.js website. Follow these steps:

## 1. Analyze Requirements
- Extract business name, industry, and target audience
- Identify required pages (home, about, services, contact, etc.)
- Determine design style preferences (modern, classic, minimal)
- Note any specific features requested

## 2. Create Design System
- Generate color palette based on industry and brand colors
- Select appropriate fonts (Google Fonts)
- Design component library (buttons, cards, forms)
- Ensure accessibility (WCAG 2.1 AA compliance)

## 3. Build Pages
- Create responsive layouts using Tailwind CSS
- Write compelling, SEO-optimized copy
- Implement proper heading hierarchy (H1-H6)
- Add meta tags and Open Graph data
- Optimize images and assets

## 4. Implement Features
- **Contact Form**: Email integration with validation
- **Blog**: CMS setup with markdown support
- **E-commerce**: Payment integration (Stripe)
- **Booking**: Calendar integration
- **Analytics**: Google Analytics/Plausible

## 5. Deploy
- Set up Vercel project
- Configure environment variables
- Set up custom domain (if provided)
- Enable automatic deployments
- Configure CDN and caching

## 6. Deliver
- Provide live URL
- Create admin credentials
- Write comprehensive documentation
- Record tutorial video (optional)
- Provide source code repository

## Quality Checklist
- [ ] Mobile responsive (tested on 3+ devices)
- [ ] Fast load time (<3 seconds)
- [ ] SEO score >90 (Lighthouse)
- [ ] Accessibility score >90
- [ ] Cross-browser compatible
- [ ] SSL certificate enabled
- [ ] Contact form working
- [ ] All links functional`
        }
    });

    const chatbotTemplate = await prisma.serviceTemplate.upsert({
        where: { serviceType_name: { serviceType: 'CHATBOT', name: 'AI Chatbot' } },
        update: {},
        create: {
            serviceType: 'CHATBOT',
            name: 'AI Chatbot',
            description: 'Intelligent chatbot with natural language processing, trained on business data',
            estimatedTime: 90, // 1.5 hours
            complexity: 'MEDIUM',
            requiredFields: JSON.stringify([
                { name: 'businessName', type: 'string', required: true },
                { name: 'industry', type: 'string', required: true },
                { name: 'knowledgeBase', type: 'text', required: true },
                { name: 'personality', type: 'select', options: ['professional', 'friendly', 'casual'], required: true },
                { name: 'languages', type: 'array', required: false },
                { name: 'integrations', type: 'array', required: false }
            ]),
            instructions: `# Chatbot Creator AI Instructions

You are an expert conversational AI designer. Create an intelligent chatbot:

## 1. Understand Business
- Analyze industry and services offered
- Identify common customer questions
- Define chatbot personality and tone
- Determine conversation goals

## 2. Build Knowledge Base
- Extract and structure FAQ content
- Organize product/service information
- Create response templates
- Set up fallback responses

## 3. Design Conversations
- Map user intents and entities
- Create dialog flows for common scenarios
- Handle edge cases and errors
- Implement context awareness

## 4. Train & Test
- Fine-tune responses for accuracy
- Test various user inputs
- Optimize response time
- Measure conversation success rate

## 5. Integrate
- Generate embed code for website
- Set up webhooks for notifications
- Configure handoff to human agents
- Enable multi-channel support

## 6. Deliver
- Provide chatbot ID and API keys
- Share dashboard access
- Create training guide
- Set up analytics tracking

## Quality Checklist
- [ ] Understands 90%+ of common queries
- [ ] Response time <2 seconds
- [ ] Natural conversation flow
- [ ] Proper error handling
- [ ] Multi-language support (if requested)
- [ ] Analytics dashboard working`
        }
    });

    const phoneTemplate = await prisma.serviceTemplate.upsert({
        where: { serviceType_name: { serviceType: 'PHONE_ASSISTANT', name: 'AI Phone Assistant' } },
        update: {},
        create: {
            serviceType: 'PHONE_ASSISTANT',
            name: 'AI Phone Assistant',
            description: 'Voice AI assistant for handling calls, appointments, and customer inquiries',
            estimatedTime: 60, // 1 hour
            complexity: 'HIGH',
            requiredFields: JSON.stringify([
                { name: 'businessName', type: 'string', required: true },
                { name: 'greeting', type: 'text', required: true },
                { name: 'services', type: 'array', required: true },
                { name: 'schedule', type: 'object', required: true },
                { name: 'voiceType', type: 'select', options: ['male', 'female'], required: true },
                { name: 'callActions', type: 'array', required: true }
            ]),
            instructions: `# Phone Assistant AI Instructions

You are an expert in voice AI systems. Create a phone assistant:

## 1. Set Up Phone Number
- Provision Twilio phone number
- Configure voice settings
- Set up call routing
- Enable call recording

## 2. Configure Voice AI
- Design greeting message
- Set up voice synthesis (text-to-speech)
- Configure speech recognition
- Handle multiple languages

## 3. Implement Call Actions
- **Appointment Booking**: Calendar integration
- **Call Transfer**: Route to appropriate department
- **Message Taking**: Voicemail transcription
- **FAQ Handling**: Answer common questions
- **Emergency Routing**: Priority call handling

## 4. Create Dashboard
- Call logs and analytics
- Transcription viewer
- Performance metrics
- Test call interface

## 5. Deploy
- Test with multiple scenarios
- Configure business hours
- Set up after-hours messaging
- Enable call notifications

## 6. Deliver
- Provide phone number
- Share dashboard URL
- Create user guide
- Set up call forwarding

## Quality Checklist
- [ ] Clear voice quality
- [ ] Accurate speech recognition (>95%)
- [ ] Natural conversation flow
- [ ] Proper call routing
- [ ] Voicemail transcription working
- [ ] Dashboard accessible`
        }
    });

    const taxPrepTemplate = await prisma.serviceTemplate.upsert({
        where: { serviceType_name: { serviceType: 'TAX_PREP', name: 'Tax Preparation Service' } },
        update: {},
        create: {
            serviceType: 'TAX_PREP',
            name: 'Tax Preparation Service',
            description: 'Professional tax preparation and filing service with AI assistance',
            estimatedTime: 180, // 3 hours
            complexity: 'HIGH',
            requiredFields: JSON.stringify([
                { name: 'taxYear', type: 'number', required: true },
                { name: 'filingStatus', type: 'select', options: ['single', 'married_joint', 'married_separate', 'head_of_household'], required: true },
                { name: 'income', type: 'object', required: true },
                { name: 'deductions', type: 'array', required: false },
                { name: 'documents', type: 'array', required: true }
            ]),
            instructions: `# Tax Preparation AI Instructions

You are a professional tax specialist. Prepare accurate tax returns:

## 1. Gather Information
- Collect W-2s, 1099s, and other tax documents
- Review income sources
- Identify deductions and credits
- Check previous year returns

## 2. Calculate Taxes
- Compute adjusted gross income
- Apply standard/itemized deductions
- Calculate tax liability
- Determine refund or amount owed

## 3. Optimize Returns
- Identify missed deductions
- Suggest tax-saving strategies
- Review for errors
- Ensure compliance

## 4. File Returns
- E-file federal return
- E-file state return(s)
- Provide confirmation numbers
- Set up direct deposit/payment

## 5. Deliver
- Provide completed tax returns
- Share filing confirmations
- Create tax summary report
- Schedule quarterly reminders

## Quality Checklist
- [ ] All income reported
- [ ] Maximum deductions claimed
- [ ] Accurate calculations
- [ ] IRS e-file accepted
- [ ] State returns filed
- [ ] Documentation organized`
        }
    });

    console.log('✅ Service templates created');

    // 2. Create Initial AI Agents
    console.log('Creating AI agents...');

    const websiteAgent = await prisma.aIAgent.create({
        data: {
            name: 'WebBuilder AI',
            type: 'WEBSITE_BUILDER',
            status: 'AVAILABLE',
            capabilities: JSON.stringify([
                'Next.js development',
                'Responsive design',
                'SEO optimization',
                'Deployment automation',
                'Content creation'
            ]),
            maxLoad: 3,
            model: 'claude-3-5-sonnet-20241022',
            systemPrompt: `You are WebBuilder AI, an expert web developer specializing in creating beautiful, functional websites using Next.js, React, and Tailwind CSS. You excel at understanding client requirements and translating them into professional websites. You always prioritize user experience, accessibility, and SEO.`,
            config: JSON.stringify({
                deploymentPlatform: 'vercel',
                defaultFramework: 'nextjs',
                cssFramework: 'tailwindcss'
            })
        }
    });

    const chatbotAgent = await prisma.aIAgent.create({
        data: {
            name: 'ChatBot Creator AI',
            type: 'CHATBOT_CREATOR',
            status: 'AVAILABLE',
            capabilities: JSON.stringify([
                'Conversational AI design',
                'NLP training',
                'Knowledge base creation',
                'Multi-language support',
                'Integration setup'
            ]),
            maxLoad: 5,
            model: 'claude-3-5-sonnet-20241022',
            systemPrompt: `You are ChatBot Creator AI, an expert in designing and implementing intelligent chatbots. You understand natural language processing, conversation design, and user intent mapping. You create chatbots that provide excellent customer service and accurately answer questions.`,
            config: JSON.stringify({
                platform: 'custom',
                nlpEngine: 'anthropic',
                supportedLanguages: ['en', 'es', 'fr']
            })
        }
    });

    const phoneAgent = await prisma.aIAgent.create({
        data: {
            name: 'VoiceAI Assistant',
            type: 'PHONE_AI',
            status: 'AVAILABLE',
            capabilities: JSON.stringify([
                'Voice synthesis',
                'Speech recognition',
                'Call routing',
                'Appointment booking',
                'Voicemail transcription'
            ]),
            maxLoad: 10,
            model: 'claude-3-5-sonnet-20241022',
            systemPrompt: `You are VoiceAI Assistant, an expert in voice AI systems and telephony. You design natural-sounding phone assistants that can handle customer calls professionally. You understand call flows, voice synthesis, and speech recognition.`,
            config: JSON.stringify({
                provider: 'twilio',
                voiceEngine: 'elevenlabs',
                defaultVoice: 'professional'
            })
        }
    });

    const taxAgent = await prisma.aIAgent.create({
        data: {
            name: 'TaxPro AI',
            type: 'TAX_SPECIALIST',
            status: 'AVAILABLE',
            capabilities: JSON.stringify([
                'Tax preparation',
                'Deduction optimization',
                'E-filing',
                'Tax planning',
                'Compliance checking'
            ]),
            maxLoad: 2,
            model: 'claude-3-5-sonnet-20241022',
            systemPrompt: `You are TaxPro AI, a professional tax specialist with expertise in federal and state tax preparation. You ensure accurate tax returns, maximize deductions, and maintain compliance with tax laws. You provide clear explanations and tax-saving recommendations.`,
            config: JSON.stringify({
                taxSoftware: 'turbotax_api',
                supportedForms: ['1040', '1099', 'W-2', 'Schedule C'],
                efileEnabled: true
            })
        }
    });

    console.log('✅ AI agents created');
    console.log(`
  Created agents:
  - ${websiteAgent.name} (${websiteAgent.id})
  - ${chatbotAgent.name} (${chatbotAgent.id})
  - ${phoneAgent.name} (${phoneAgent.id})
  - ${taxAgent.name} (${taxAgent.id})
  `);

    console.log('🎉 AI Agency System seeded successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding AI Agency System:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
