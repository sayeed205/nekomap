<h1 align="center">Nekomap</h1>

This is a sitemap utility that extracts sitemap url and all the urls from the sitemap.

note: This is not a sitemap generator or web crawler.

## Installation

```bash
npm  install nekomap
pnpm add nekomap
yarn add nekomap
```

## Usage

```typescript
import NekoMap from 'nekomap';

const websiteUrl = 'https://example.com'; // https://example.com/sitemap.xml or any url
const nekoMap = new NekoMap(websiteUrl);

nekoMap.getSiteMapUrls().then(sitemapUrls => {
    console.log(sitemapUrls); // string | null if no sitemap url found
});

nekoMap.getUrls().then(urls => {
    console.log(urls); // string[] | null if no urls found
});
```

## License

[MIT](./LICENSE)

## Author

[Sayed Ahmed](https://github.com/sayeed205)

## Disclaimer

This is a personal project and not affiliated with any organization. Use at your own risk.
