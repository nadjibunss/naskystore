import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        try:
            await page.goto("http://localhost:5173")
            await page.wait_for_load_state("networkidle")
            await page.screenshot(path="jules-scratch/verification/baseline.png")
            print("Baseline screenshot taken successfully.")
        except Exception as e:
            print(f"An error occurred during baseline verification: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())