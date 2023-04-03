import { test, expect } from '@playwright/test';
import { tryLogin } from '../tests/login';

const adminUrl = 'https://admin.teams.microsoft.com/';
const userProfile = `${adminUrl}users/8a6eea27-76d2-4d2c-9af8-77efdd44c373/policy`;

test('Load page offline', async ({ page }) => {
  await page.route(userProfile, async route => {
    console.log('ROUTE MATCH')
    // Fetch original response.
    const response = await route.fetch();
    // Add a prefix to the title.
    let body = await response.text();
    body = body.replace('</body>', `<script>
        var keys = window.uiconfig.FlightConfig.flightingKeys;
        var index = keys.indexOf("UI.Mgmt.Users.EffectivePoliciesTable");
       keys.splice(index, 1);
    </script></body>`)
    await route.fulfill({
      // Pass all fields from the response.
      response,
      // Override response body.
      body,
      // Force content type to be html.
      headers: {
        ...response.headers()
      }
    });
  });
  // page.on('request', request => request.url().includes(adminUrl) && console.log('>>', request.method(), request.url()));
  page.on('domcontentloaded', async () => {
    if (!page.url().includes(userProfile)) return;
    const result = await page.evaluate(() => {
      const keys = (window as any).uiconfig.FlightConfig.flightingKeys;
      const index = keys.indexOf("UI.Mgmt.Users.EffectivePoliciesTable");
      keys.splice(index, 1);
      console.log('EffectivePoliciesTable', keys.indexOf("UI.Mgmt.Users.EffectivePoliciesTable"))
      //return [index, (window as any).uiconfig.FlightConfig.flightingKeys.indexOf("UI.Mgmt.Users.EffectivePoliciesTable")];
      return document.body.innerHTML;
    })
    console.log(result)

  });

  // page.on('response', response => {
  //   if (!response.url().includes(userProfile)) return;
  //   console.log('<<', response.status(), response.url())
  //   console.log(response.body())
  // });
  await page.goto(adminUrl, {
    waitUntil: 'networkidle'
  });

  // await page.routeFromHAR('har/policy/harNetwork.har', {
  //   update: false
  // })

  await tryLogin(page, {
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
