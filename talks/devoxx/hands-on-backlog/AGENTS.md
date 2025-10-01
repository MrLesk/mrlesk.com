# AGENTS.md - AI Agent Reference Documentation

## CRITICAL: READ SLIDEV DOCUMENTATION FIRST
**⚠️ MANDATORY: Before working on this project, ALWAYS fetch and read the complete Slidev LLM documentation at https://sli.dev/llms.txt**

This documentation contains essential information about:
- Slidev syntax and features
- Markdown extensions and components
- Layout systems and theming
- Build and export processes
- All technical details for working with Slidev

## Project Context
You have spawned in a Slidev presentation repository for the Vienna AI Engineering Meetup talk titled "From Zero to Backlog.md".

### What This Project Is
- **Type**: Slidev presentation slides (NOT an application)
- **Topic**: Discussion about "Backlog.md" - a CLI tool for markdown-based task management with AI agent integration
- **Audience**: Vienna AI Engineering Meetup attendees
- **Date**: October 2, 2025

### Project Structure
```
/
├── pages/           # Individual slide content files
├── public/          # Static assets (images, icons)
├── components/      # Vue components for slides
├── slides.md        # Main entry point and slide order
├── package.json     # Dependencies
├── vite.config.js   # Build configuration
└── style.css        # Global styles
```

## Essential Commands
```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm run export   # Export to PDF/PNG
```

## Project-Specific Information

### Presentation Content
The slides cover:
- Alex Gavrilescu's introduction (Funstage GmbH)
- The journey from zero to Backlog.md
- Task creation and management concepts
- AI agent instructions and workflows
- Flow states and instructions
- Live demonstrations

### Key Files
- `slides.md`: Controls slide order via `src: ./pages/[name].md` imports
- `pages/*.md`: Individual slide content
- Theme: Penguin (slidev-theme-penguin v2.3.1)

## Working Guidelines

### ALWAYS
1. Read https://sli.dev/llms.txt before making any Slidev-related changes
2. Preserve the existing slide structure and flow
3. Test with `npm run dev` before finalizing changes
4. Maintain consistency with the presentation's narrative

### NEVER
1. Treat this as an application codebase
2. Add backend functionality or APIs
3. Modify core Slidev mechanics without understanding them
4. Break the slide import chain in `slides.md`

## Quick Start for New Agents
1. `curl https://sli.dev/llms.txt` - Read Slidev documentation
2. `npm run dev` - Start the development server
3. Review `slides.md` for presentation structure
4. Check `pages/` directory for individual slides

## Remember
This is a presentation about AI task management, not the task management system itself. Your role is to maintain and enhance the presentation slides while preserving their educational value and flow.
