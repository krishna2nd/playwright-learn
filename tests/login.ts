import { HTTPCredentials, Page } from '@playwright/test';

export const selectors = {
  email: 'input[type="email"][name="loginfmt"]',
  next: 'input[type="submit"]#idSIButton9',
  password: 'input[type="password"][name="passwd"]',
  submit: 'input[type="submit"]#idSIButton9',
  doNotShowAgain:
    'input[type="checkbox"][id="KmsiCheckboxField"][name="DontShowAgain"]',
};

export const tryLogin = async (page: Page, credentials: HTTPCredentials) => {
  // await page.waitForURL((url: URL) => url.host.toLowerCase().includes(MS_LOGIN_URL.host), {
  //   waitUntil: 'domcontentloaded'
  // });
  // if (page.url().toLowerCase().includes(TAC_URL.host)) return

  try {
    await page.waitForSelector(selectors.email);
    await page.locator(selectors.email).fill(credentials.username);
    await page.click(selectors.next);
    await page.waitForSelector(selectors.password);
    await page.locator(selectors.password).fill(credentials.password);

    await page.click(selectors.submit);
    try {
      await page.waitForSelector(selectors.doNotShowAgain);
      await page.click(selectors.submit);
    } catch (e) {
      console.error('tryLogin submit', e);
    }
  } catch (err) {
    console.error('tryLogin', err);
  }
  console.info('LOGIN DONE');
};
