from playwright.sync_api import sync_playwright, expect
import time
import os

def run():
    print("Starting Playwright...")
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        print("Navigating...")
        try:
            page.goto('http://localhost:3000', timeout=60000)
            print("Page loaded.")
        except Exception as e:
            print(f"Navigation failed: {e}")
            browser.close()
            return

        # Take a screenshot of Splash Screen immediately
        print("Taking splash screenshot...")
        page.screenshot(path='/home/jules/verification/splash.png')

        time.sleep(3)

        print("Taking main screenshot...")
        page.screenshot(path='/home/jules/verification/main.png')

        browser.close()
        print("Done.")

if __name__ == '__main__':
    run()
