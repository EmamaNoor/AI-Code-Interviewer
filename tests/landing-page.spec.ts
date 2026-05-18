import { test, expect } from '@playwright/test';

test('has title and can start interview', async ({ page }) => {
  // Go to the landing page
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/AI Code Interviewer/);

  // Expect the main heading to be visible
  await expect(page.getByRole('heading', { name: 'AI Code Interviewer' })).toBeVisible();

  // Click the "Medium" difficulty button
  await page.getByRole('button', { name: 'Medium' }).click();

  // Click "Start New Interview"
  await page.getByRole('button', { name: 'Start New Interview' }).click();

  // The app should attempt to route to /interview/... 
  // Because it's protected by Clerk, we expect to be redirected to the Clerk Accounts Sign In page.
  await expect(page).toHaveURL(/.*accounts\.dev\/sign-in.*/);
});
