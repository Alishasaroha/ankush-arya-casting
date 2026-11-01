/**
 * Server-safe generic HTTP 500 error page renderer.
 * Returns a self-contained HTML string without exposing internal details or stack traces.
 */
export function renderErrorPage(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>500 — Server Error | Ankush Arya Casting</title>
    <style>
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            background-color: #121212;
            color: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            text-align: center;
        }
        .container {
            max-width: 32rem;
            margin: 0 auto;
        }
        .code {
            color: #d4af37;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            margin-bottom: 1.25rem;
        }
        h1 {
            font-size: 2.25rem;
            font-weight: 300;
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
        }
        p {
            color: #a3a3a3;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        a {
            display: inline-block;
            background-color: #d4af37;
            color: #121212;
            text-decoration: none;
            padding: 0.85rem 1.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            transition: opacity 0.2s ease;
        }
        a:hover {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="code">500 &middot; Server Error</div>
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred on our end. Please try refreshing the page or return to the home page.</p>
        <a href="/">Back to Home</a>
    </div>
</body>
</html>`;
}

