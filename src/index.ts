/**
 * Nekomap is a simple library to extract all URLs from a sitemap.
 *
 * Usage:
 *
 * ```typescript
 * import Nekomap  from 'nekomap'; // const Nekomap = require('nekomap')
 * const nekomap = new Nekomap('https://www.google.com');
 * nekomap.getSitemapUrl().then(console.log);
 * nekomap.getUrls().then(console.log);
 * ```
 */
export default class Nekomap {
    private expectedSitemaps = [
        'sitemap.xml',
        'sitemap_index.xml',
        'sitemapindex.xml',
        'sitemap-index.xml',
        'sitemap',
    ];

    constructor(public site: string) {
        this.validateUrl(site);
    }

    private validateUrl(site: string) {
        try {
            const url = new URL(site);
            if (!url.protocol.startsWith('http')) {
                throw new Error('Invalid URL');
            }
            this.site = url.origin;
        } catch {
            throw new Error('Invalid URL');
        }
    }

    private async fetchText(url: string) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return response.text();
            }
        } catch (error) {
            console.error('Error fetching data', error);
        }
    }

    private async isNested(url: string) {
        const sitemapData = await this.fetchText(url);
        return sitemapData ? this.isNestedSitemap(sitemapData) : false;
    }

    private isNestedSitemap(sitemapData: string): boolean {
        return /<sitemap>/i.test(sitemapData);
    }

    async getUrls() {
        const sitemapUrl = await this.getSitemapUrl();
        return sitemapUrl ? this.extractUrls(sitemapUrl) : null;
    }

    private async extractUrls(url: string, result: string[] = []) {
        const sitemapData = await this.fetchText(url);

        if (sitemapData) {
            const isNested = await this.isNested(url);
            if (isNested) {
                const urls = this.getUrlsFromSitemap(sitemapData);
                for (const url of urls) {
                    const isNested = await this.isNested(url);
                    if (isNested) {
                        this.extractUrls(url, result);
                    }
                    const data = await this.fetchText(url);
                    if (data) {
                        const urls = this.getUrlsFromSitemap(data);
                        result.push(...urls);
                    }
                }
            } else {
                result.push(...this.getUrlsFromSitemap(sitemapData));
            }
        }

        return result;
    }

    private getUrlsFromSitemap(sitemapData: string) {
        let linkPattern: RegExp;
        if (sitemapData.includes('<loc>')) {
            linkPattern = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;
        } else {
            linkPattern = /(https?:\/\/[^<]+)/gi;
        }
        const links: string[] = [];
        let match: RegExpExecArray | null;

        // Find all matches
        while ((match = linkPattern.exec(sitemapData)) !== null) {
            links.push(match[1]);
        }

        return links;
    }

    private async getRobots() {
        return await fetch(this.site + '/robots.txt');
    }

    async getSitemapUrl() {
        const robots = await this.getRobots();
        if (robots.ok) {
            const data = await robots.text();
            const sitemapUrl = this.getSiteMapUrlFromRobots(data);
            if (sitemapUrl) return sitemapUrl;
        }

        for (const sitemap of this.expectedSitemaps) {
            const response = await fetch(this.site + '/' + sitemap);
            if (response.ok) {
                return response.url;
            }
        }

        return null;
    }

    private getSiteMapUrlFromRobots(data: string) {
        const userAgentPattern = /User-agent: \*\n([\s\S]*?)(?=User-agent|$)/i;
        const sitemapPattern = /Sitemap: (https?:\/\/\S+)/i;

        const userAgentSection = data.match(userAgentPattern);

        if (userAgentSection) {
            const sitemapMatch = userAgentSection[1].match(sitemapPattern);
            if (sitemapMatch) {
                return sitemapMatch[1];
            }
        }

        return null;
    }
}
