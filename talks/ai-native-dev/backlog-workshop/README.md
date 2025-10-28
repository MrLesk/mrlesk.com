# Backlog Workshop

A Slidev presentation using the local Penguin theme.

## Development

```bash
# Start dev server
bun dev

# Build for production
bun build

# Export to PDF
bun export
```

## Using Local Theme

This presentation uses the local Penguin theme via a file path reference:
```json
"slidev-theme-penguin": "file:../../../../slidev-theme-penguin"
```

Any changes to the theme will be reflected immediately in this presentation.

## Available Components

The theme provides these components:

### Card
```vue
<Card variant="info" title="Title" icon="ℹ️">
  Content here
</Card>
```
Variants: `default`, `critical`, `success`, `warning`, `info`

### CopyCodeBlock
```vue
<CopyCodeBlock>
\`\`\`javascript
// code here
\`\`\`
</CopyCodeBlock>
```

### YoutubeEmbed
```vue
<YoutubeEmbed url="https://www.youtube.com/watch?v=..." />
```

### PromptChip
```vue
<PromptChip variant="primary" size="lg">Text</PromptChip>
```
Variants: `default`, `primary`, `secondary`, `accent`
Sizes: `sm`, `md`, `lg`

### SectionIndicator
Automatically enabled. Configure in frontmatter:
```yaml
---
sectionIndicator:
  enabled: true
  position: 'bottom-right'
  showSectionName: true
  showProgress: true
  showSlideNumbers: true
---
```

Hide on specific slides:
```yaml
---
hideIndicator: true
---
```

### IdleScreensaver
Enable globally in frontmatter:
```yaml
---
idleScreensaver:
  enabled: true
  imageSrc: '/logo.png'
  enableOnSlides: 'cover'  # or [1, 5] or 'all'
---
```

Or use manually on a slide:
```vue
<IdleScreensaver imageSrc="/logo.png" />
```

## Layouts

- `default` - Standard slide
- `center` - Centered content
- `intro` - Title slide
- `quote` - Quote with decorative marks
- `two-cols` - Two columns
- And more...
