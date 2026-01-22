# Damon Ross Blog

A simple Jekyll blog hosted on GitHub Pages.

## Writing Posts

1. Create a new file in `_posts/` with the format: `YYYY-MM-DD-title.md`
2. Add frontmatter at the top:

```yaml
---
layout: post
title: Your Post Title
date: 2025-01-22
---
```

3. Write your content in markdown below the frontmatter
4. Commit and push - GitHub Pages builds automatically

## Local Preview (Optional)

```bash
gem install bundler jekyll
bundle init
bundle add jekyll
bundle exec jekyll serve
```

Then visit `http://localhost:4000`

## Customization

- **Site title/description**: Edit `_config.yml`
- **About page**: Edit `about.md`
- **Styling**: Edit `assets/css/style.css`
- **Layout**: Edit files in `_layouts/`
