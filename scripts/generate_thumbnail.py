import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 600, "height": 315}, device_scale_factor=2)

        # Navigate to a specific view that looks nice
        # Using latitude, longitude and zoom level matching the Seattle area with trees
        await page.goto('http://localhost:3000/?lat=47.6062&lng=-122.3321&zoom=10.5')

        # Wait for map to load and render
        await page.wait_for_timeout(5000) # Give maplibre time to fetch tiles and data

        # Hide UI elements before taking screenshot
        await page.evaluate('''() => {
            const appUi = document.querySelector('app-ui');
            if (appUi) appUi.style.display = 'none';

            const controls = document.querySelector('.maplibregl-control-container');
            if (controls) controls.style.display = 'none';
        }''')

        # Wait a moment for layout update
        await page.wait_for_timeout(500)

        await page.screenshot(path="thumbnail.png")
        await browser.close()

asyncio.run(main())
