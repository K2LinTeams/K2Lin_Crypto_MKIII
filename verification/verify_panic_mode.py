from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the hosted renderer
    page.goto("http://localhost:3000")

    # Wait for the main app to load
    # We use .first to avoid strict mode violations if multiple "CRYPTO3" texts exist (e.g. Splash + Header)
    page.locator("text=CRYPTO3").first.wait_for(timeout=10000)
    print("App loaded")

    # Click the Panic Mode button
    try:
        page.click('button[aria-label="Panic Mode"]')
    except:
        page.click('button[aria-label="Panic"]')

    print("Clicked Panic Mode button")

    # Now wait for the Panic Mode component to render
    try:
        page.wait_for_selector("text=Rhine Lab", timeout=10000)
        print("Found Rhine Lab header")
    except Exception as e:
        print(f"Failed to find header: {e}")
        page.screenshot(path="verification/error_state.png")
        browser.close()
        return

    # Check for specific elements to confirm the redesign
    # 1. The flavor text
    expect(page.get_by_text("359号基地")).to_be_visible()

    # 2. The "Access Terminal" button
    expect(page.get_by_text("ACCESS TERMINAL")).to_be_visible()

    # Take a screenshot of the main "Rhine Lab" terminal view
    time.sleep(2) # Wait for any animations
    page.screenshot(path="verification/rhine_lab_terminal.png")
    print("Screenshot saved to verification/rhine_lab_terminal.png")

    # Interact with the "Access Terminal" button
    page.get_by_text("ACCESS TERMINAL").click()

    # Verify we are back at "CRYPTO3" (Main App)
    expect(page.locator("text=CRYPTO3").first).to_be_visible()
    print("Successfully exited Panic Mode")

    # Now let's test the PIN flow
    # Enable PIN in localStorage
    page.evaluate("localStorage.setItem('panicPin', '1234')")

    # Re-enter Panic Mode
    try:
        page.click('button[aria-label="Panic Mode"]')
    except:
        page.click('button[aria-label="Panic"]')

    page.wait_for_selector("text=Rhine Lab")

    # Click Access Terminal
    page.get_by_text("ACCESS TERMINAL").click()

    # Expect the PIN input modal (Security Clearance)
    expect(page.get_by_text("Security Clearance")).to_be_visible()
    time.sleep(1)
    page.screenshot(path="verification/rhine_lab_pin_input.png")
    print("Screenshot saved to verification/rhine_lab_pin_input.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
