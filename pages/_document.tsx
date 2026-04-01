import Document, { Html, Head, Main, NextScript } from 'next/document'

// Minimal custom Document to satisfy Next.js pages renderer.
// This project primarily uses the app/ router, but Next may still
// look for a pages/_document module during build. Providing a tiny
// Document prevents the "Cannot find module for page: /_document" error.
export default class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
