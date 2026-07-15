async (page) => {
  const expectedSpecialists = [
    'ab-testing', 'ad-creative', 'ads', 'ai-seo', 'analytics', 'aso',
    'churn-prevention', 'co-marketing', 'cold-email', 'community-marketing',
    'competitor-profiling', 'competitors', 'content-strategy', 'copy-editing',
    'copywriting', 'cro', 'customer-research', 'directory-submissions', 'emails',
    'free-tools', 'image', 'launch', 'lead-magnets', 'marketing-council',
    'marketing-ideas', 'marketing-loops', 'marketing-plan', 'marketing-psychology',
    'offers', 'onboarding', 'paywalls', 'popups', 'pricing', 'product-marketing',
    'programmatic-seo', 'prospecting', 'public-relations', 'referrals', 'revops',
    'sales-enablement', 'schema', 'seo-audit', 'signup', 'site-architecture', 'sms',
    'social', 'video',
  ];
  const expectedAnchors = ['#top', '#modes', '#specialists', '#loop', '#structure', '#status'];
  const failures = [];
  const observations = [];
  const dialogs = [];
  const unexpectedPopups = [];
  const consoleErrors = [];
  const failedRequests = [];
  const httpErrors = [];

  const check = (condition, name, actual) => {
    observations.push({ name, pass: Boolean(condition), actual });
    if (!condition) failures.push({ name, actual });
  };

  page.on('dialog', async (dialog) => {
    dialogs.push({ type: dialog.type(), message: dialog.message() });
    await dialog.dismiss();
  });
  page.on('popup', async (popup) => {
    unexpectedPopups.push(popup.url());
    await popup.close();
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:8765/?qa=repeat', { waitUntil: 'networkidle' });

  const desktop = await page.evaluate(() => {
    const text = document.body.innerText;
    const specialists = [...document.querySelectorAll('.specialty-list code')]
      .map((element) => element.textContent.trim());
    const internalAnchors = [...new Set([...document.querySelectorAll('a[href^="#"]')]
      .map((element) => element.getAttribute('href')))];
    const externalLinks = [...document.querySelectorAll('a[href^="http"]')].map((element) => ({
      href: element.href,
      target: element.target,
      rel: element.rel,
      name: element.textContent.trim(),
    }));
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((element) => ({
      level: Number(element.tagName.slice(1)),
      text: element.textContent.trim(),
    }));
    return {
      htmlTheme: document.documentElement.dataset.theme,
      heroText: document.querySelector('.hero')?.innerText || '',
      bodyText: text,
      modeCodes: [...document.querySelectorAll('.mode-card .m-code')]
        .map((element) => element.textContent.trim()),
      specialists,
      internalAnchors,
      externalLinks,
      h1Count: document.querySelectorAll('h1').length,
      unnamedLinks: [...document.querySelectorAll('a')]
        .filter((element) => !element.textContent.trim() && !element.getAttribute('aria-label')).length,
      unnamedButtons: [...document.querySelectorAll('button')]
        .filter((element) => !element.textContent.trim() && !element.getAttribute('aria-label')).length,
      headings,
    };
  });

  check(desktop.heroText.toLowerCase().includes('v0.0.1'), 'hero version is v0.0.1', desktop.heroText);
  check(desktop.heroText.includes('12 execution modes'), 'hero states 12 execution modes', desktop.heroText);
  check(desktop.heroText.includes('47 specialist playbooks'), 'hero states 47 specialist playbooks', desktop.heroText);
  check(desktop.bodyText.includes('Mode preserves the existing execution and readiness semantics.'),
    'execution axis explanation is visible', null);
  check(desktop.bodyText.includes('Load standing product and brand truth first, one mode playbook second'),
    'knowledge axis explanation is visible', null);
  check(desktop.bodyText.includes('AUDIT + pricing') && desktop.bodyText.includes('COPY + emails') &&
    desktop.bodyText.includes('MEASURE + ads'), 'two-axis examples are visible', null);
  check(desktop.modeCodes.length === 13 && desktop.modeCodes.includes('THROUGH‑LINE'),
    '12 modes plus one explicitly non-mode through-line render', desktop.modeCodes);

  const actualSorted = [...desktop.specialists].sort();
  const expectedSorted = [...expectedSpecialists].sort();
  check(desktop.specialists.length === 47, 'specialist count is exactly 47', desktop.specialists.length);
  check(new Set(desktop.specialists).size === 47, 'specialist catalog has no duplicates',
    desktop.specialists.length - new Set(desktop.specialists).size);
  check(JSON.stringify(actualSorted) === JSON.stringify(expectedSorted),
    'visible specialist catalog exactly matches the routed catalog', {
      missing: expectedSorted.filter((name) => !actualSorted.includes(name)),
      extra: actualSorted.filter((name) => !expectedSorted.includes(name)),
    });
  check(desktop.bodyText.includes('78 automated tests pass locally.') &&
    desktop.bodyText.includes('78 contract & adversarial tests'), '78-test claim appears in status and detail', null);
  check(!desktop.bodyText.includes('37 automated') && !desktop.bodyText.includes('v1.0.0'),
    'stale 37-test and v1.0.0 claims are absent', null);
  check(expectedAnchors.every((hash) => desktop.internalAnchors.includes(hash)),
    'all required internal anchors exist', desktop.internalAnchors);
  check(desktop.externalLinks.length > 0 && desktop.externalLinks.every((link) =>
    link.target === '_blank' && link.rel.split(/\s+/).includes('noopener')),
    'all external links open safely in a new tab', desktop.externalLinks);
  check(desktop.h1Count === 1, 'page has exactly one h1', desktop.h1Count);
  check(desktop.unnamedLinks === 0, 'all links have accessible names', desktop.unnamedLinks);
  check(desktop.unnamedButtons === 0, 'all buttons have accessible names', desktop.unnamedButtons);

  const headingSkips = desktop.headings.slice(1).filter((heading, index) =>
    heading.level > desktop.headings[index].level + 1);
  check(headingSkips.length === 0, 'heading levels do not skip', headingSkips);

  const anchorResults = [];
  for (const hash of expectedAnchors.filter((value) => value !== '#top')) {
    await page.locator(`header.nav a[href="${hash}"]`).click();
    await page.waitForTimeout(100);
    anchorResults.push({ hash, locationHash: await page.evaluate(() => location.hash) });
  }
  await page.locator('a.brand[href="#top"]').click();
  await page.waitForTimeout(100);
  anchorResults.push({ hash: '#top', locationHash: await page.evaluate(() => location.hash) });
  check(anchorResults.every((result) => result.locationHash === result.hash),
    'all desktop navigation anchors update the URL', anchorResults);

  const themeBefore = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  const themeAfter = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    stored: localStorage.getItem('sm-theme'),
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  check(themeBefore.theme === 'dark' && themeAfter.theme === 'light' &&
    themeAfter.stored === 'light' && themeBefore.bg !== themeAfter.bg,
    'theme toggle switches dark to light and persists it', { themeBefore, themeAfter });
  await page.getByRole('button', { name: 'Toggle theme' }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  const mobile = await page.evaluate(() => {
    const html = document.documentElement;
    const specialistPanel = document.querySelector('.specialists-panel');
    const routeExample = document.querySelector('.axis-example');
    return {
      viewport: { width: innerWidth, height: innerHeight },
      htmlScrollWidth: html.scrollWidth,
      htmlClientWidth: html.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      bodyClientWidth: document.body.clientWidth,
      specialistPanel: specialistPanel ? {
        left: specialistPanel.getBoundingClientRect().left,
        right: specialistPanel.getBoundingClientRect().right,
        width: specialistPanel.getBoundingClientRect().width,
      } : null,
      routeExample: routeExample ? {
        left: routeExample.getBoundingClientRect().left,
        right: routeExample.getBoundingClientRect().right,
        width: routeExample.getBoundingClientRect().width,
        fontSize: parseFloat(getComputedStyle(routeExample).fontSize),
        lineHeight: parseFloat(getComputedStyle(routeExample).lineHeight),
      } : null,
      specialistCount: document.querySelectorAll('.specialty-list code').length,
      hiddenRequiredContent: [...document.querySelectorAll('#specialists *')]
        .filter((element) => getComputedStyle(element).display === 'none').length,
    };
  });
  check(mobile.htmlScrollWidth <= mobile.htmlClientWidth && mobile.bodyScrollWidth <= mobile.bodyClientWidth,
    'mobile has no horizontal overflow', mobile);
  check(mobile.specialistPanel && mobile.specialistPanel.left >= 0 &&
    mobile.specialistPanel.right <= mobile.viewport.width,
    'specialist panel fits the mobile viewport', mobile.specialistPanel);
  check(mobile.routeExample && mobile.routeExample.left >= 0 &&
    mobile.routeExample.right <= mobile.viewport.width && mobile.routeExample.fontSize >= 16 &&
    mobile.routeExample.lineHeight >= 24,
    'two-axis explanation is readable on mobile', mobile.routeExample);
  check(mobile.specialistCount === 47 && mobile.hiddenRequiredContent === 0,
    'all 47 specialist labels remain rendered on mobile', mobile);

  check(dialogs.length === 0, 'no unexpected dialogs', dialogs);
  check(unexpectedPopups.length === 0, 'no unexpected tabs or popups during internal flows', unexpectedPopups);
  check(failedRequests.length === 0, 'no failed network requests', failedRequests);
  check(httpErrors.length === 0, 'no HTTP 4xx/5xx responses', httpErrors);
  check(consoleErrors.length === 0, 'no console errors', consoleErrors);

  const result = {
    url: page.url(),
    viewports: ['1440x1000', '390x844'],
    passed: observations.filter((item) => item.pass).length,
    failed: failures.length,
    failures,
    observations,
    sideEffects: { dialogs, unexpectedPopups, consoleErrors, failedRequests, httpErrors },
  };
  if (failures.length) throw new Error(JSON.stringify(result));
  return result;
}
