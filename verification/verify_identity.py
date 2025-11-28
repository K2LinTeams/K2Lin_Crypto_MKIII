from playwright.sync_api import sync_playwright, expect
import time

def verify_operator_feature():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1280x800 for desktop layout
        context = browser.new_context(viewport={"width": 1280, "height": 800})

        # Set LocalStorage to skip tutorial
        context.add_init_script("localStorage.setItem('hasSeenTutorial', 'true');")

        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:8080", wait_until="networkidle")

        # Wait for splash screen to disappear (approx 2.5s)
        time.sleep(4)

        # Find Identity Panel
        print("Looking for Identity Panel...")
        nav_buttons = page.locator("nav button")
        count = nav_buttons.count()
        print(f"Found {count} nav buttons")

        found = False
        # Try clicking buttons to switch views until we see the Identity Panel
        for i in range(count):
            print(f"Clicking button {i}...")
            try:
                nav_buttons.nth(i).click(force=True)
                time.sleep(1)
                if page.get_by_text("Digital Identity").is_visible():
                    print("Found Identity Panel!")
                    found = True
                    break
            except Exception as e:
                print(f"Error clicking button {i}: {e}")

        if not found:
            print("Could not find Identity Panel. Dumping content...")
            print(page.content()[:1000])
            raise Exception("Identity Panel not found")

        # Check if we need to generate identity
        # The button text is "Generate Identity" (from en.json)
        gen_btn = page.get_by_role("button", name="Generate Identity")
        if gen_btn.is_visible():
            print("Clicking Generate Identity...")
            gen_btn.click()
            time.sleep(2) # Wait for key generation and animation

        # Verify Random Operator (Input should be empty)
        print("Verifying Random Operator state...")
        # Placeholder is "Enter your name..."
        input_locator = page.get_by_placeholder("Enter your name...")
        expect(input_locator).to_be_visible()
        expect(input_locator).to_have_value("")

        # Screenshot 1: Random Operator
        page.screenshot(path="verification/1_random_operator.png")
        print("Screenshot 1 saved.")

        # Verify Manual Input
        print("Entering manual name 'Doctor'...")
        input_locator.fill("Doctor")
        time.sleep(1) # Wait for render/theme update

        # Screenshot 2: Manual Input (Rhodes Island Theme)
        page.screenshot(path="verification/2_manual_input.png")
        print("Screenshot 2 saved.")

        # Verify Return to Random
        print("Clearing input...")
        input_locator.fill("")
        time.sleep(1)

        # Screenshot 3: Back to Random
        page.screenshot(path="verification/3_back_to_random.png")
        print("Screenshot 3 saved.")

        browser.close()

if __name__ == "__main__":
    verify_operator_feature()
