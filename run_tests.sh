#!/bin/bash
mkdir -p /home/jules/verification/videos /home/jules/verification/screenshots

# Start the python simple http server in the background
python3 -m http.server 3000 &
SERVER_PID=$!
sleep 2

cat << 'PYEOF' > /home/jules/verification/verify_cuj.py
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000")
    page.wait_for_timeout(2000)

    # We want to wait until the map renders, or some content exists.
    # The map div has id="map"
    page.wait_for_selector("#map", timeout=15000)
    page.wait_for_timeout(3000)

    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
PYEOF

python3 /home/jules/verification/verify_cuj.py

kill $SERVER_PID
