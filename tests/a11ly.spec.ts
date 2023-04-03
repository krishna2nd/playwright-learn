import { test, expect } from '@playwright/test';
import { tryLogin } from '../tests/login';
import AxeBuilder from '@axe-core/playwright';
import { prettyPrintAxeViolations } from './a11yPrint';

const adminUrl = 'https://admin.teams.microsoft.com/';
const userProfile = `${adminUrl}users/8a6eea27-76d2-4d2c-9af8-77efdd44c373/policy`;

test('Load page teams admin', async ({ page }) => {

  await page.goto(userProfile, {
    waitUntil: 'networkidle'
  });

  await tryLogin(page, {
  });

  await page.waitForSelector('button[role="tab"][name="Policies"]')
  await page.getByRole('tab', { name: 'Policies' })

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  // console.log(JSON.stringify(accessibilityScanResults))
  // console.log(JSON.stringify(prettyPrintAxeViolations(accessibilityScanResults), null, 2))
  axeReport(accessibilityScanResults);

});

import { createHtmlReport } from 'axe-html-reporter';
import fs from 'fs';

const axeReport = (rawAxeResults: any) => {
  const reportHTML = createHtmlReport({
    results: rawAxeResults,
    options: {
      projectKey: 'I need only raw HTML',
      doNotCreateReportFile: true,
    },
  });
  console.log('reportHTML will have full content of HTML file.');
  // suggestion on how to create file by yourself

  fs.writeFileSync('./test-results/axe.html', reportHTML);
}
