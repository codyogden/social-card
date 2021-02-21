# Social Card Generator
Generate social media cards from any HTML page with dynamic text content for use in `<meta />` tags on the fly.

![Preview of Social Card](.github/preview.png)

## Getting Started

After installing dependencies, the express server can be run using the following commands:

```bash
npm run start
npm run dev
```

## Rendering Flow
Images are rendered on the fly, stored locally, and served from the stored file. An MD5 hash of the query object is used as the filename. This increases performance and reduces the load on the server.

## Template
The template is an HTML file that can be edited as desired. Use `{param_name}` syntax throughout the HTML file for dynamic string replacements when rendering the file or rendering the social card.

### localhost:{port}/render
This endpoint lets you preview the card's rendered HTML page that will be used to grab a screenshot and produce the image.


### localhost:{port}
This will return a screenshot `image/png` of the rendered page.

## Global Query Params
These query parameters will work on either endpoint.

| Query Param      | Type       |
|------------------|------------|
| color            | CSS Color. |
| background_color | CSS Color. |
| blog_title       | String     |
| meta_description | String     |
| author_name      | String     |
| author_title     | String     |
| author_image     | URL        |

