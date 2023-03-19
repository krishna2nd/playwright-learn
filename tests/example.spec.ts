import { test, expect } from '@playwright/test';
import { tryLogin } from './login';

const adminUrl = 'https://admin.teams.microsoft.com/';
const userProfile = `${adminUrl}users/8a6eea27-76d2-4d2c-9af8-77efdd44c373/policy`;

test('Load page offline', async ({ page }) => {
  page.on('request', request => request.url().includes(adminUrl) && console.log('>>', request.method(), request.url()));
  page.on('domcontentloaded', async () => {
    if (!page.url().includes(userProfile)) return;
    await page.evaluate(() => {
      const keys = (window as any).uiconfig.FlightConfig.flightingKeys;
      const index = keys.indexOf("UI.Mgmt.Users.EffectivePoliciesTable");
      keys.splice(index, 1);
      console.log('EffectivePoliciesTable', keys.indexOf("UI.Mgmt.Users.EffectivePoliciesTable"))
    })
  });

  page.on('response', response => {
    if (!response.url().includes(userProfile)) return;
    console.log('<<', response.status(), response.url())
    console.log(response.body())
  });
  await page.goto(adminUrl, {
    waitUntil: 'networkidle',
  });
  await page.routeFromHAR('har/policy/harNetwork.har', {
    update: true
  })
  await tryLogin(page, {
    username: 'admin@e2etest0MBN1P002.onmicrosoft.com',
    password: '!ync*0Ps'
  });

  await page.goto(userProfile, {
    waitUntil: 'networkidle'
  });

  // await page.evaluate(([adminUrl]) => {
  //   // const keys = (window as any).uiconfig.FlightConfig.flightingKeys;
  //   // const index = keys.indexOf("UI.Mgmt.Users.EffectivePoliciesTable");
  //   // keys.slice(index, 1);

  //   window.history.pushState(window.history.state, `${adminUrl}users/8a6eea27-76d2-4d2c-9af8-77efdd44c373/policy`)
  //   // alert((window as any).uiconfig.FlightConfig.flightingKeys.filter(k => k.indexOf('Effective') >= 0))
  // }, [adminUrl])

  await page.waitForSelector('button[role="tab"][name="Policies"]')
  await page.getByRole('tab', { name: 'Policies' })

});
