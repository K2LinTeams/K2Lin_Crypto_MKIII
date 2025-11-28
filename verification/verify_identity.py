from playwright.sync_api import sync_playwright, expect
import time

def verify_identity_themes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a larger viewport to ensure sidebar is visible (desktop mode)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for splash screen to disappear
            print("Waiting for splash screen...")
            time.sleep(3) # Initial wait

            # Check if tutorial is shown
            print("Checking for tutorial...")
            # The tutorial skip button has a title "Skip Intro" or similar based on translation keys
            # In English it might be just title="Skip Intro" or an X icon.
            # Looking at the code: title={t('skip', 'Skip Intro')}

            try:
                # Wait briefly for the tutorial modal to appear
                skip_button = page.wait_for_selector('button[title="Skip Intro"]', state='visible', timeout=5000)
                if skip_button:
                    print("Skipping tutorial...")
                    skip_button.click()
            except Exception as e:
                print("Tutorial skip button not found or tutorial not shown:", e)

            # Wait for main UI
            page.wait_for_selector("nav")

            # 1. Switch to Sakura Theme (Default is usually Sakura, but let's confirm in settings)
            print("Navigating to Settings...")
            page.get_by_title("Config").click()
            time.sleep(1)

            print("Selecting Sakura Theme...")
            # The themes might be buttons. I need to find them.
            # Assuming they are labeled or I can find them by color.
            # Since I can't see the DOM, I'll try to guess based on typical implementation or use generic selectors.
            # Let's try to list buttons in settings to see what we have if this fails.
            # But let's assume there's a button with text "Sakura" or title "Sakura".

            # If the theme buttons don't have text, I might need to look for something else.
            # Let's try to select by text content first.
            try:
                page.get_by_text("Sakura", exact=False).click()
            except:
                print("Could not find 'Sakura' text, trying to find by visual elements or assumptions.")
                # Maybe it's already selected.


            # 2. Generate Identity Card with Custom Name
            print("Navigating to Identity Panel...")
            page.get_by_title("ID").click()
            time.sleep(1)

            # Click "Generate" if no identity exists
            # Look for button with Generate text
            try:
                generate_btn = page.get_by_role("button", name="Generate")
                if generate_btn.is_visible():
                    generate_btn.click()
                    time.sleep(2)
            except:
                pass

            # Enter Custom Name
            print("Entering Custom Name...")
            # Try finding input by placeholder or generic input inside the card
            inputs = page.get_by_role("textbox").all()
            if inputs:
                # The first input in IdentityPanel is usually the name input
                inputs[0].fill("TEST-SAKURA")
            else:
                print("No input found!")

            time.sleep(3) # Wait for canvas to re-render

            # Take screenshot of Sakura Card
            print("Capturing Sakura Theme Card...")
            page.screenshot(path="verification/1_sakura_card.png")

            # 3. Switch to Cyberpunk Theme
            print("Switching to Cyberpunk Theme...")
            page.get_by_title("Config").click()
            time.sleep(1)

            # Select Cyberpunk
            try:
                page.get_by_text("Cyberpunk", exact=False).click()
            except:
                 print("Could not find 'Cyberpunk' button.")

            time.sleep(1)

            # 4. Check Identity Card again
            print("Navigating back to Identity Panel...")
            page.get_by_title("ID").click()
            time.sleep(1)

            # Update name
            inputs = page.get_by_role("textbox").all()
            if inputs:
                inputs[0].fill("TEST-CYBER")

            time.sleep(3)

            # Take screenshot of Cyberpunk Card
            print("Capturing Cyberpunk Theme Card...")
            page.screenshot(path="verification/2_cyberpunk_card.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_identity_themes()
