import fs from 'fs';
import puppeteer from 'puppeteer';
import {addExtra} from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import {addSlashes} from "slashes";
import * as dotenv from 'dotenv';

dotenv.config();
const roll20Email = process.env.ROLL20_EMAIL as string;
const roll20Password = process.env.ROLL20_PASSWORD as string;
const roll20CampaignId = process.env.ROLL20_CAMPAIGN_ID as string;
const useCreateAccountPageBypass = false;

const pause = async (milliseconds: number) => {
  return await new Promise(r => setTimeout(r, milliseconds));
};

const log = (...message: any[]) => {
  console.log(...message);
}

const isTimeoutError = (err: Error | any) => {
  return err?.message?.indexOf('Waiting failed') >= 0;
}

const deploy = async (campaignId: string, layoutHtml: string, styleCss: string) => {
  log("Launching browser.")
  const extra = addExtra(puppeteer);
  extra.use(StealthPlugin());
  const options: any = {headless: false}; // {};
  const browser = await extra.launch(options);
  try {

    const page = (await browser.pages())[0] || (await browser.newPage());

    const retryWithReload = async <T>(task: () => Promise<T>, tryCount: number): Promise<T> => {
      let lastError: any = null;
      for (let i = 0; i < tryCount; i++) {
        try {
          return await task();
        } catch (err) {
          lastError = err;
          if (i >= tryCount - 1) {
            throw err;
          } else {
            await pause(1000);
          }
        }
      }
      throw lastError;
    };

    if (useCreateAccountPageBypass) {
      // The /login page has Cloudflare bot detection, but the /create-account page doesn't. <shrug>.  If we go to the
      // /create-account first and click the login button from there, we don't get bot detection.
      await page.goto(`https://app.roll20.net/create-account`, {waitUntil: 'domcontentloaded'});
      await page.waitForSelector('button[id*="login"]')
      await page.click('button[id*="login"]');
      await page.waitForNavigation();
    } else {
      log("Opening login page.");
      await page.goto(`https://app.roll20.net/`, {timeout: 45050, waitUntil: 'domcontentloaded'});
      try {
        await page.waitForSelector('form.login input[name="email"]', {timeout: 9500});
      } catch (timedout) {
        log("Re-routing to login page.");
        // start: retryWithReload()
        await retryWithReload(async () => {
          await page.goto(`https://app.roll20.net/create-account`, {timeout: 10500, waitUntil: 'domcontentloaded'});
          await page.waitForSelector('button[id*="login"]', {timeout: 200000}) // tmp timeout for debugging
        }, 3);
        // end
        await page.click('button[id*="login"]');
        // Hmm.
        await page.waitForSelector('button[id="login"]');
      }
    }

    log("Logging in.");
    await page.waitForSelector('form.login input[name="email"]');
    await page.type('form.login input[name="email"]', roll20Email, {delay: 30});
    await pause(200);
    await page.type('form.login input[name="password"]', roll20Password, {delay: 30});
    await pause(200);
    await page.click('button[id*="login"]');
    // A waitForNavigation() here is problematic because the /welcome page shown post-login often gets hung up loading
    // scripts and such.  If the 'Contact Us' link at the bottom of the page has rendered, then that's good enough for
    // our purposes, since we're just going to navigate elsewhere. This link doesn't exist on the app.roll20.net page,
    // or the /login or /create-account pages (fyi it does exist on the roll20.net home page).
    await page.waitForSelector('a[href="https://roll20.zendesk.com/hc/en-us/requests/new"]', { timeout: 30003 });

    log("Opening campaign settings.");
    await page.goto(`https://app.roll20.net/campaigns/campaignsettings/${campaignId}`, {timeout: 30001, waitUntil: 'domcontentloaded'});

    const setEditorText = async (editorHostElementSelector: string, text: string) => {
      console.log("***** waiting for ACE content");
      // Wait for the editor to be fully rendered.
      await page.waitForSelector(`${editorHostElementSelector} .ace_content`, {timeout: 30002});
      console.log("***** setting ACE content");
      // Set our value into the editor with Javascript.
      await page.evaluate(`
      document.querySelector("${addSlashes(editorHostElementSelector)}").env.editor.setValue("${addSlashes(text)}", 1);
      `);
      console.log("***** done setting ACE content");
    };

    log("Applying layout.");
    await setEditorText(`.tab-content .ace_editor[data-target="customcharsheet_layout"]`, layoutHtml);
    log("Applying styles.");
    await page.click('.nav-tabs a[href="#customsheet-css"]');
    try {
      await page.waitForNetworkIdle({timeout: 2000});
    } catch (ignored) {
    }
    await setEditorText('.tab-content .ace_editor[data-target="customcharsheet_style"]', styleCss);

    log("Saving.");
    await page.click('#save-changes-button');
    const savedConfirmationXpath = '//*[contains(@class,"campaign_settings")]//*[contains(@class,"alert-success") and contains(text(), "Settings saved")]'
    try {
      await page.waitForXPath(savedConfirmationXpath, {timeout: 5000});
    } catch (err) {
      if (isTimeoutError(err)) {
        // It occasionally happens that a save succeeds, but with no visible confirmation indicator.  If we just save
        // again, it will almost always work.
        await page.click('#save-changes-button');
        await page.waitForXPath(savedConfirmationXpath, {timeout: 15100});
      } else {
        throw err;
      }
    }
    log("Saved.");
  } finally {
    await browser.close();
  }
};

const load = async () => {
  const layoutHtml = fs.readFileSync('./dist/custom-character-sheet.html', {encoding: 'utf8', flag: 'r'});
  let styleCss = fs.readFileSync('./dist/custom-character-sheet.css', {encoding: 'utf8', flag: 'r'});
  if (styleCss.charCodeAt(0) > 65000) {
    styleCss = styleCss.substring(1);
  }
  // Not sure why the first character of our css reads as a charCodeAt(0)==65279, but we'll strip it out.
  return {layoutHtml, styleCss};
};

load().then(({layoutHtml, styleCss}) => {
  deploy(roll20CampaignId, layoutHtml, styleCss).catch(err => {
    console.error(err);
    process.exit(1);
  });
}).catch(err => {
  console.error(err);
  process.exit(2);
});
