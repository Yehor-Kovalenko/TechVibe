import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options


class TestTestsessionmanagement():
    def setup_method(self, method):
        options = Options()
        options.add_argument("--window-size=1366,768")
        self.driver = webdriver.Chrome(options=options)
        self.vars = {}

    def teardown_method(self, method):
        self.driver.quit()

    def test_testsessionmanagement(self):
        self.driver.get("http://localhost:5173/")
        self.driver.set_window_size(1635, 1025)
        self.driver.find_element(By.CSS_SELECTOR, ".flex-1").click()
        self.driver.find_element(By.CSS_SELECTOR, ".flex-1").send_keys("https://www.youtube.com/shorts/Qfb2IjEbIAI")
        self.driver.find_element(By.CSS_SELECTOR, ".bg-primary").click()
        time.sleep(120)

        self.driver.find_element(
            By.XPATH,
            "//button[contains(normalize-space(), 'Create New')]"
        ).click()

        time.sleep(10)

        self.driver.find_element(
            By.XPATH,
            "//button[contains(normalize-space(), 'View Previous Jobs')]"
        ).click()

        time.sleep(10)

        button = self.driver.find_element(
            By.CSS_SELECTOR,
            "div.ReactModal__Content button.w-full.px-4.py-3"
        )
        assert button.text == "The Galaxy S23 - BASIC or AMAZING??"

        button.click()

        time.sleep(10)

        title = self.driver.find_element(
            By.CSS_SELECTOR,
            ".widget-card > .text-lg"
        )

        assert title.text.strip() == "The Galaxy S23 - BASIC or AMAZING??"