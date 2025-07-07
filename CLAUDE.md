# MVP Club Brag Book - Project Memory

## Project Overview
**Name:** MVP Club Brag Book  
**Purpose:** Empower MVP Club members to track, reflect on, and share career achievements, leveraging AI to help them articulate their value and accelerate career growth  
**Target Users:** White-collar professionals in MVP Club seeking career advancement and AI upskilling  

## Key Features
### Core Features
1. **Win Logging** - Structured form for logging career achievements
2. **AI-Powered Summarization** - Generate LinkedIn posts and summaries
3. **Data Export** - CSV download of all logged wins
4. **Community Interaction** - Like, comment, share wins publicly
5. **Discord Integration** - Reminder bot for career channel
6. **Privacy & Security** - Private by default, opt-in sharing

### Win Logging Fields
- Date of win (mm/dd/yy format)
- Win description (free text)
- Project/initiative (free text)
- Skills demonstrated (multi-select + "other" option)
- Problem solved (free text)
- Approach taken (free text)
- Issues/bumps encountered (free text)
- Outcome/solution (free text)
- Impact on users/workflow (free text)
- AI tools used (free text)
- Tech stack used (free text)

**Validation:** All required fields must be completed. N/A allowed for irrelevant fields, AI should ignore N/A when generating summaries.

### AI Features
- Generate concise summaries for carousel display
- Draft LinkedIn-ready posts from user logs
- Summarize growth over time (monthly/quarterly)
- User can edit/approve AI-generated content before sharing

### Community Features
- Public carousel/wall of wins (opt-in)
- Like and comment functionality
- Direct LinkedIn sharing capability
- Content moderation via reporting/flagging

## Technical Requirements
### Platform
- Web App: Responsive design (React or similar)
- Future: React Native mobile app
- Database: Managed cloud database (Firebase, MongoDB Atlas, or PostgreSQL)

### AI Integration
- Use Gemini, Llama, or Mistral (hosted securely)
- Open source LLM for summarization and LinkedIn drafts

### Infrastructure
- Cloud hosting for app and database
- Automated daily backups
- Monitoring and alerts for uptime/usage
- Start on free/low-cost tiers, scale vertically

## User Flows
1. **Onboarding:** Sign up → Accept terms → Set up profile
2. **Logging Win:** Fill form → AI generates summary → User reviews/edits → Choose sharing
3. **Viewing Carousel:** Browse wins → Like/comment → Filter by tags/time
4. **Growth Dashboard:** Visualize progress and engagement

## Success Metrics
- Wins logged per month
- Likes/comments per win
- LinkedIn shares
- User retention and engagement rates
- Career outcomes (self-reported)

## Security & Privacy
- All logs private by default
- Opt-in sharing only
- Data encrypted at rest and in transit
- Role-based access controls
- Terms of use and privacy policy required at first login
- WCAG 2.1+ accessibility compliance

## Future Enhancements
- Mobile app release
- Direct LinkedIn API integration
- Resume/portfolio builder
- Peer-to-peer feedback
- Social gamification features
- Admin dashboard for analytics
- Community leaderboards

## Development Notes
- Keep infrastructure lean and monitor costs
- Implement strict privacy controls
- Follow accessibility standards from day one
- Plan for rate-limiting if community grows
- Admin dashboard separate from member features