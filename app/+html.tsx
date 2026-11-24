import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML template for Expo Router Web.
 * Configures modern metadata, full-width responsive viewport, and KinGuardian Shield + Heart SVG / PNG favicon.
 */
export default function RootHtml({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <title>KinGuardian • Cross-Border Elder Care for NRI Families</title>
        <meta
          name="description"
          content="Real-time wearable telemetry, AI clinical translation, and automated WhatsApp family care loops for aging parents in India."
        />
        {/* Crisp vector KinGuardian Blue Box + Heart SVG Favicon & PNG Fallbacks */}
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='30' fill='%23007aff'/%3E%3Cg transform='translate(23.5, 23.5) scale(2.2)'%3E%3Cpath d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' fill='none' stroke='%23ffffff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="icon" type="image/png" sizes="64x64" href="/favicon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                width: 100%;
                min-height: 100%;
                margin: 0;
                padding: 0;
                overflow-x: hidden;
                background-color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              }
              #root {
                display: flex;
                flex-direction: column;
                min-height: 100vh;
                width: 100%;
                margin: 0;
                padding: 0;
              }
              /* Ensure full width on React Native Web containers */
              [data-rn-viewport] {
                width: 100% !important;
              }
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
