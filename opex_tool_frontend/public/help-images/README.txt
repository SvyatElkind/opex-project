Help Images Directory
=====================

Place all help documentation images in this folder.

Supported formats:
- PNG (recommended for screenshots)
- JPG/JPEG
- GIF
- SVG

Image naming conventions:
- Use descriptive names: create-project.png, inventory-list.png
- Use lowercase with hyphens
- Avoid spaces in filenames

Example filenames:
- workspace-overview.png
- create-project-form.png
- inventory-types.png
- record-metadata-example.png

Usage in helpConstants.js:
{
    type: 'image',
    src: '/help-images/your-image-name.png',
    alt: 'Description for accessibility',
    caption: 'Optional caption text'
}

Recommended image sizes:
- Screenshots: Max width 800px
- Icons/small images: 200-400px
- Keep file sizes under 500KB for fast loading
