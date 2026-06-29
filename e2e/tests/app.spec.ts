import path from 'node:path'
import { expect, test } from '@playwright/test'

// Helper to generate random string for unique users
const generateRandomString = () => Math.random().toString(36).substring(2, 8)

test.describe
  .serial('ConvHub E2E flows', () => {
    let uniqueId: string
    let testEmail: string
    let testUsername: string
    let anotherEmail: string
    let anotherUsername: string

    test.beforeAll(async () => {
      uniqueId = generateRandomString()
      testEmail = `testuser_${uniqueId}@example.com`
      testUsername = `testuser_${uniqueId}`
      anotherEmail = `another_${uniqueId}@example.com`
      anotherUsername = `another_${uniqueId}`
    })

    test('Flow 1: Register -> Login -> Upload conversation -> View it', async ({
      page,
    }) => {
      // 1. Register
      await page.goto('/register')
      await page.getByLabel('Email').fill(testEmail)
      await page.getByLabel('Username').fill(testUsername)
      await page.getByLabel('Password', { exact: true }).fill('password123')
      await page.getByLabel('Confirm Password').fill('password123')
      await page.getByRole('button', { name: 'Create account' }).click()

      // Wait for redirect to home
      await expect(page).toHaveURL('/')
      await expect(
        page.getByText('Upload a Conversation').first(),
      ).toBeVisible()

      // 2. Upload conversation
      await page.goto('/upload')
      await page.setInputFiles(
        'input[type="file"]',
        path.join(__dirname, 'fixtures', 'test.jsonl'),
      )

      // Fill metadata
      await page.getByLabel('Title').fill(`Test Conversation ${uniqueId}`)
      await page.getByLabel('Description').fill('This is a test description')
      await page.getByRole('button', { name: 'Upload Conversation' }).click()

      // Wait for redirect to conversation page
      await expect(page).toHaveURL(/\/conversations\/.+/)
      console.log(await page.innerText('body'))
      await expect(page.getByText(`Test Conversation ${uniqueId}`)).toBeVisible(
        { timeout: 10000 },
      )
      await expect(page.getByText('This is a test description')).toBeVisible()
      await expect(page.getByText('hello world')).toBeVisible()
      await expect(page.getByText('hi there!')).toBeVisible()
    })

    test('Flow 2: Like / Unlike a conversation', async ({ page }) => {
      // Login
      await page.goto('/login')
      await page.getByLabel('Email').fill(testEmail)
      await page.getByLabel('Password', { exact: true }).fill('password123')
      await page.getByRole('button', { name: 'Log in' }).click()
      await expect(page).toHaveURL('/')

      // Go to profile to find the conversation we uploaded
      await page.goto(`/profile/${testUsername}`)
      await page.click(`text=Test Conversation ${uniqueId}`)
      await expect(page).toHaveURL(/\/conversations\/.+/)

      // Initial like count is 0
      const likeButton = page
        .getByRole('button', { name: /Like|Unlike/ })
        .first()
      await expect(likeButton).toHaveText(/0/)

      // Like
      await likeButton.click()
      await expect(likeButton).toHaveText(/1/)

      // Unlike
      await likeButton.click()
      await expect(likeButton).toHaveText(/0/)
    })

    test('Flow 3: Post and delete a comment', async ({ page }) => {
      // Login
      await page.goto('/login')
      await page.getByLabel('Email').fill(testEmail)
      await page.getByLabel('Password', { exact: true }).fill('password123')
      await page.getByRole('button', { name: 'Log in' }).click()
      await expect(page).toHaveURL('/')

      // Find our conversation
      await page.goto(`/profile/${testUsername}`)
      await page.click(`text=Test Conversation ${uniqueId}`)
      await expect(page).toHaveURL(/\/conversations\/.+/)

      // Post comment
      const commentInput = page.locator(
        'textarea[placeholder="Write a comment..."]',
      )
      await commentInput.fill('Playwright test comment')
      await page.click('button:has-text("Post Comment")')

      // Wait for comment to appear
      await expect(page.getByText('Playwright test comment')).toBeVisible()

      // Delete comment
      page.on('dialog', (dialog) => dialog.accept()) // Accept confirm alert
      await page.getByTitle('Delete comment').click()

      // Wait for comment to disappear
      await expect(page.getByText('Playwright test comment')).not.toBeVisible()
    })

    test('Flow 4: Follow / Unfollow a user', async ({ page }) => {
      // Register another user
      await page.goto('/register')
      await page.getByLabel('Email').fill(anotherEmail)
      await page.getByLabel('Username').fill(anotherUsername)
      await page.getByLabel('Password', { exact: true }).fill('password123')
      await page.getByLabel('Confirm Password').fill('password123')
      await page.getByRole('button', { name: 'Create account' }).click()
      await expect(page).toHaveURL('/')

      // Go to first user's profile
      await page.goto(`/profile/${testUsername}`)

      // Follow
      await page.getByRole('button', { name: 'Follow', exact: true }).click()
      await expect(page.getByRole('button', { name: 'Unfollow' })).toBeVisible()

      // Unfollow
      await page.getByRole('button', { name: 'Unfollow' }).click()
      await expect(
        page.getByRole('button', { name: 'Follow', exact: true }),
      ).toBeVisible()
    })

    test('Flow 5: Edit profile settings', async ({ page }) => {
      // Login as original user
      await page.goto('/login')
      await page.getByLabel('Email').fill(testEmail)
      await page.getByLabel('Password', { exact: true }).fill('password123')
      await page.getByRole('button', { name: 'Log in' }).click()
      await expect(page).toHaveURL('/')

      // Go to settings
      await page.goto('/settings')

      // Edit profile
      await page.getByLabel('Display Name').fill('Edited Display Name')
      await page.getByLabel('Bio').fill('Edited bio')
      await page.getByRole('button', { name: 'Save Changes' }).click()

      // Check success message or just verify fields remain
      await expect(page.getByText('Profile updated successfully')).toBeVisible()

      // Verify on profile page
      await page.goto(`/profile/${testUsername}`)
      await expect(page.getByText('Edited Display Name')).toBeVisible()
      await expect(page.getByText('Edited bio')).toBeVisible()
    })
  })
