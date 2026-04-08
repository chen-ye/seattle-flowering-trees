from playwright.sync_api import sync_playwright

def verify_map():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720},
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()

        print("Navigating...")
        page.goto('http://localhost:3000')
        page.wait_for_timeout(10000)

        # take a screenshot of the fixed UI
        page.screenshot(path='/home/jules/verification/screenshots/verification_nullish.png')

        try:
            pass
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    verify_map()
