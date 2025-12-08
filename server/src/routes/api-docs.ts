import { Router, Request, Response } from "express";
import swaggerDefinition from "../config/swagger";

const router = Router();

/**
 * GET /api-docs/json
 * Returns the OpenAPI/Swagger specification as JSON
 */
router.get("/json", (_req: Request, res: Response) => {
	res.json(swaggerDefinition);
});

/**
 * GET /api-docs
 * Returns an HTML page with Swagger UI for interactive API documentation
 */
router.get("/", (_req: Request, res: Response) => {
	const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>IRC Employee Management System - API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='/api-docs/json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@latest/bundles/redoc.standalone.js"></script>
  </body>
</html>
	`;
	res.setHeader("Content-Type", "text/html");
	res.send(html);
});

/**
 * GET /api-docs/swagger
 * Returns Swagger UI for interactive API documentation
 */
router.get("/swagger", (_req: Request, res: Response) => {
	const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>IRC Employee Management System - Swagger UI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css">
    <style>
      html {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      body {
        margin: 0;
        background: #fafafa;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.js"></script>
    <script>
      window.onload = function() {
        const ui = SwaggerUIBundle({
          url: "/api-docs/json",
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIBundle.SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "BaseLayout"
        })
        window.ui = ui
      }
  </script>
  </body>
</html>
	`;
	res.setHeader("Content-Type", "text/html");
	res.send(html);
});

export default router;
