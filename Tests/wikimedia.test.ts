import * as MediaWiki from '../src/app/api/mediawiki/MediaWikiAPI'
global.fetch = require("node-fetch");

describe("MediaWiki api tst", () =>{
    test("getPageHeaderContent test", async ()=>{
        const sol:MediaWiki.PageHeaderContentType = await MediaWiki.getPageHeaderContent("Ashkelon");
        const url = await MediaWiki.getPageURL(sol.page_id);
        expect(url).toBe("https://en.wikipedia.org/wiki/Ashkelon");
        expect(sol.content.length).toBeGreaterThan(0);
    });

    test("empty page test", async ()=>{
        const sol:MediaWiki.PageHeaderContentType = await MediaWiki.getPageHeaderContent("dgahsdgajd");
        expect(sol.content).toBe(undefined);
        expect(sol.page_id).toBe(undefined);
    });
});