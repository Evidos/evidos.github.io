# AGENTS.md

Guidelines for AI coding agents working with the Signhost Developer Documentation repository.

## Repository Overview

This repository contains the official developer documentation for the Entrust Signhost REST API. It's built using [Rspress](https://rspress.dev/), a static site generator based on React and Rspack.

- **Live Site**: https://evidos.github.io/
- **Framework**: Rspress v2.0.0-beta.35
- **Runtime**: Bun
- **CI/CD**: GitHub Actions with automatic deployment to GitHub Pages

## Project Structure

```
evidos.github.io/
├── docs/                      # Main documentation content (MDX files)
│   ├── _nav.json             # Navigation configuration
│   ├── index.md              # Homepage
│   ├── guide/                # API guides and features
│   │   ├── features/         # Feature documentation
│   │   │   └── samples/      # Code samples (prefixed with _)
│   │   ├── guides/           # Step-by-step guides
│   │   └── start/            # Getting started content
│   ├── openapi/              # OpenAPI documentation
│   └── public/               # Static assets (images, OpenAPI spec)
├── components/               # React components
├── theme/                    # Theme customization
│   └── index.css            # CSS custom properties (Entrust brand)
├── plugins/                  # Custom Rspress plugins
├── .github/
│   ├── instructions/        # LLM instruction files
│   └── workflows/           # GitHub Actions workflows
├── rspress.config.ts        # Rspress configuration
└── package.json             # Dependencies and scripts
```

## Important Files

### Configuration Files

- **`rspress.config.ts`**: Main site configuration, navigation, theme settings
- **`tsconfig.json`**: TypeScript compiler configuration
- **`biome.json`**: Biome linter and formatter configuration
- **`vacuum-rules.yaml`**: OpenAPI linting rules
- **`vacuum-ignore.yaml`**: OpenAPI linting ignore patterns

### Documentation Files

- **MDX files in `docs/`**: Documentation pages (supports Markdown + JSX)
- **`docs/_nav.json`**: Determines sidebar navigation structure
- **`docs/public/openapi.yaml`**: OpenAPI specification file
- **`docs/openapi/**`**: **Generated files** - Do not edit directly! These are automatically generated from `docs/public/openapi.yaml`

### Theme Files

- **`theme/index.css`**: Contains Entrust brand colors as CSS custom properties

### Sample Code Files

- **`docs/guide/features/samples/_postback-*.{js,ts,py,php,cs,java,go}`**: External code samples
- Files starting with `_` are treated as partials/includes and excluded from routing

## LLM Instruction Files

This repository uses instruction files to guide AI agents when modifying specific file types:

| File                                                          | Applies To          | Purpose                           |
| ------------------------------------------------------------- | ------------------- | --------------------------------- |
| `.github/instructions/agents.instructions.md`                 | `**/*`              | Guidelines for updating AGENTS.md |
| `.github/instructions/capitalization.instructions.md`         | `**/*.md, **/*.mdx` | Capitalization rules              |
| `.github/instructions/punctuation-formatting.instructions.md` | `**/*.md, **/*.mdx` | Punctuation guidelines            |
| `.github/instructions/theme.instructions.md`                  | `**/*.css`          | Entrust brand theme guidelines    |

**Important**: Always read and apply the relevant instruction file before modifying matching files.

## Development Workflow

### Setup

```bash
bun install
```

### Development Server

```bash
bun run dev
```

Server runs at http://localhost:3000 with hot reload.

### Build

```bash
bun run build
```

Output directory: `doc_build/`

### Quality Checks

```bash
# Run all checks
bun run lint

# Individual checks
bun run typecheck      # TypeScript type checking
bun run lint:ts        # Biome linting
bun run lint:md        # Markdown formatting
bun run lint:openapi   # OpenAPI spec validation
```

### Preview Production Build

```bash
bun run preview
```

## Code Style & Conventions

### TypeScript/JavaScript

- Use Biome for linting and formatting
- TypeScript strict mode enabled
- Prefer functional components for React
- Use ES modules (`import`/`export`)

### Markdown/MDX

- Follow capitalization rules in instruction files
- Use proper punctuation (see instruction files)
- Keep lines readable (no hard line length limit, but be reasonable)
- Use fenced code blocks with language tags
- Use MDX components from `@rspress/core/theme` when needed

### CSS

- Use CSS custom properties defined in `theme/index.css`
- Follow Entrust brand guidelines (see `.github/instructions/theme.instructions.md`)
- Maintain accessibility (WCAG AA contrast ratios)

### Code Samples

- Files in `docs/guide/features/samples/` start with `_` prefix
- Include comprehensive comments explaining the code
- Follow security best practices (e.g., constant-time comparisons)
- Maintain consistency across language implementations
- Always handle errors gracefully
- Include configuration via environment variables

## CI/CD Pipeline

### Automated Checks

On every push and PR:

- TypeScript type checking
- Biome linting
- Markdown linting
- OpenAPI spec validation
- Build verification

### Deployment

Automatic deployment to GitHub Pages on push to `main` branch.

## Common Tasks

### Adding a New Documentation Page

1. Create MDX file in appropriate `docs/` subdirectory
2. Add entry to `docs/_nav.json` if needed for navigation
3. Use proper frontmatter with `title`
4. Follow capitalization and punctuation guidelines

### Adding a Code Sample

1. Create file in `docs/guide/features/samples/` with `_` prefix
2. Include comprehensive comments
3. Follow security best practices
4. Ensure consistency with other language examples
5. Reference in MDX using: ``language file="./samples/_filename.ext"`

### Modifying Theme/Styles

1. Read `.github/instructions/theme.instructions.md` first
2. Use CSS custom properties, don't hardcode colors
3. Maintain accessibility (WCAG AA contrast ratios)

### Updating OpenAPI Spec

1. Edit `docs/public/openapi.yaml` (this is the source of truth)
2. Run `bun run lint:openapi` to validate
3. Check `vacuum-ignore.yaml` for intentional rule exceptions

## Troubleshooting

### Build Failures

- Check TypeScript errors: `bun run typecheck`
- Check linting: `bun run lint`
- Clear build cache: `rm -rf doc_build node_modules && bun install`

### Hot Reload Not Working

- Restart dev server
- Check file paths are correct
- Ensure MDX syntax is valid

### OpenAPI Linting Errors

- Review `vacuum-rules.yaml` for rule definitions
- Add exceptions to `vacuum-ignore.yaml` if intentional
- Validate spec at https://editor.swagger.io/

## Resources

- [Rspress Documentation](https://rspress.dev/)
- [MDX Documentation](https://mdxjs.com/)
- [Biome Documentation](https://biomejs.dev/)

## Maintaining This File

**Important**: This `AGENTS.md` file should be kept up to date as the repository evolves. When making changes to the project, consider whether the change should be reflected here:

- **Adding new features or tools**: Update relevant sections (e.g., new scripts, new dependencies)
- **Changing project structure**: Update the Project Structure diagram
- **Adding/removing configuration files**: Update the Important Files section
- **New coding conventions or patterns**: Add to Code Style & Conventions
- **New common tasks or workflows**: Add to Common Tasks section
- **Security considerations**: Update Security Best Practices
- **Troubleshooting discoveries**: Add to Troubleshooting section

This file serves as the primary onboarding document for AI agents and should accurately reflect the current state of the repository.

## Getting Help

- Review existing documentation in `docs/` for examples
- Check `README.md` for setup and build instructions
- Review LLM instruction files in `.github/instructions/`
- Consult Rspress documentation for framework-specific features
