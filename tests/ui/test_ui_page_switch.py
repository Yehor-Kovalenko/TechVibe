import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


class TestPageSwitch:
    def setup_method(self):
        options = Options()
        options.add_argument("--window-size=1366,768")
        self.driver = webdriver.Chrome(options=options)
        self.vars = {}

    def teardown_method(self):
        self.driver.quit()

    def test_page_switch(self):
        # Test 1: Landing Page
        self.driver.get("http://localhost:5173/")
        self.driver.set_window_size(1635, 1025)

        # Test Landing Page - nagłówek (header)
        header = self.driver.find_element(By.CSS_SELECTOR, "h1.text-4xl")
        assert header.text == "TechVibe Review Summaries"

        # Test Landing Page - button
        submit_button = self.driver.find_element(By.CSS_SELECTOR, ".bg-primary")
        assert submit_button.text in ["Generate", "Working…"]

        # Submit a URL to navigate to Loading page
        url_input = self.driver.find_element(By.CSS_SELECTOR, ".flex-1")
        url_input.click()
        url_input.send_keys("https://www.youtube.com/shorts/Qfb2IjEbIAI")
        submit_button.click()

        time.sleep(5)

        # Test 2: Loading Page
        # Test Loading Page - nagłówek (header)
        loading_header = self.driver.find_element(
            By.XPATH,
            "//h1[contains(text(), 'TechVibe: Review Summaries')]"
        )
        assert loading_header.text == "TechVibe: Review Summaries"

        # Test Loading Page - return button
        return_button = self.driver.find_element(
            By.XPATH,
            "//button[contains(text(), 'Create new') or contains(text(), 'Create New')]"
        )
        assert return_button.is_displayed()

        # Test Loading Page - status
        status_message = self.driver.find_element(
            By.CSS_SELECTOR,
            "h2.text-3xl"
        )
        assert status_message.text == "Aggregating reviews"

        # Wait for processing to complete
        time.sleep(10)

        # Test 3: Dashboard Page
        # Test Dashboard Page - nagłówek (header)
        dashboard_header = self.driver.find_element(
            By.XPATH,
            "//h1[contains(text(), 'Dashboard Summary')]"
        )
        assert dashboard_header.text == "Dashboard Summary"
