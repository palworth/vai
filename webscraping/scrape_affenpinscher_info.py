import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

def dismiss_cookie_banner(driver):
    try:
        accept_button = WebDriverWait(driver, 10).until(
            lambda d: d.find_element(By.ID, "onetrust-accept-btn-handler")
        )
        accept_button.click()
        print("Cookie banner dismissed.")
        time.sleep(2)
    except Exception as e:
        print("No cookie banner to dismiss or error encountered:", e)

def hide_interfering_header(driver):
    try:
        driver.execute_script(
            "var el = document.querySelector('.slim-header__dropdowns'); if(el){ el.style.display='none'; }"
        )
        print("Interfering header hidden.")
    except Exception as ex:
        print("Error hiding interfering header:", ex)

def force_open_accordion(driver, accordion):
    try:
        class_attr = accordion.get_attribute("class")
        if "breed-table__accordion-open" not in class_attr:
            driver.execute_script("arguments[0].classList.add('breed-table__accordion-open');", accordion)
            time.sleep(1)
    except Exception as e:
        print("Error forcing accordion open:", e)

def extract_health_section(driver):
    """Extracts the Health text and Recommended Health Tests from the Health accordion."""
    health_text = None
    recommended_tests = None
    try:
        health_container = driver.find_element(
            By.XPATH,
            "//div[contains(@class, 'breed-table__accordion') and .//strong[contains(text(), 'Recommended Health Tests From the National Breed Club')]]"
        )
        force_open_accordion(driver, health_container)
        try:
            health_text = health_container.find_element(
                By.XPATH, ".//p[@class='breed-table__accordion-padding__p']/p"
            ).text.strip()
        except Exception as e:
            print("Error extracting health text specifically:", e)
            try:
                health_text = health_container.find_element(By.XPATH, ".//p").text.strip()
            except Exception as e2:
                print("Fallback error extracting health text:", e2)
                health_text = None
        try:
            recommended_ul = health_container.find_element(
                By.XPATH, ".//ul[contains(@class, 'breed-table__accordion-ul')]"
            )
            li_elems = recommended_ul.find_elements(By.TAG_NAME, "li")
            recommended_tests = [li.text.strip() for li in li_elems]
        except Exception as e:
            print("Error extracting recommended tests:", e)
            recommended_tests = None
    except Exception as e:
        print("Error locating health accordion container:", e)
    return health_text, recommended_tests

def extract_section_by_header(driver, header_text):
    """
    Locates an accordion container by matching an <h3> header with exactly the given text (after normalization)
    and extracts the section text from its nested paragraph.
    """
    section_text = None
    try:
        container = driver.find_element(
            By.XPATH,
            f"//div[contains(@class, 'breed-table__accordion') and .//h3[normalize-space(text())='{header_text}']]"
        )
        force_open_accordion(driver, container)
        try:
            section_text = container.find_element(
                By.XPATH, ".//p[@class='breed-table__accordion-padding__p']/p"
            ).text.strip()
        except Exception:
            section_text = container.find_element(By.XPATH, ".//p").text.strip()
    except Exception as e:
        print(f"Error extracting section '{header_text}':", e)
    return section_text

def extract_by_index(driver, index):
    """Fallback extraction by index from all accordion containers."""
    try:
        accordions = driver.find_elements(By.CSS_SELECTOR, "div.breed-table__accordion")
        if index < len(accordions):
            force_open_accordion(driver, accordions[index])
            return accordions[index].find_element(By.XPATH, ".//p").text.strip()
    except Exception as e:
        print(f"Error extracting section by index {index}:", e)
    return None

def main():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    driver = webdriver.Chrome(options=chrome_options)
    
    url = "https://www.akc.org/dog-breeds/affenpinscher/"
    driver.get(url)
    time.sleep(2)
    
    dismiss_cookie_banner(driver)
    hide_interfering_header(driver)
    
    data = {}
    # Extract Health (and its nested Recommended Health Tests) specially.
    health_text, recommended_tests = extract_health_section(driver)
    data["Health"] = health_text
    data["Recommended Health Tests"] = recommended_tests
    
    # Extract Grooming using header matching with normalized space.
    data["Grooming"] = extract_section_by_header(driver, "Grooming")
    
    # Use fallback index-based extraction for Exercise, Training, and Nutrition.
    data["Exercise"] = extract_by_index(driver, 2)
    data["Training"] = extract_by_index(driver, 3)
    data["Nutrition"] = extract_by_index(driver, 4)
    
    driver.quit()
    
    with open("info_per_breed_affenpinscher.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    
    print("Scraping complete. Data saved to info_per_breed_affenpinscher.json")
    print(json.dumps(data, indent=4))

if __name__ == "__main__":
    main()
