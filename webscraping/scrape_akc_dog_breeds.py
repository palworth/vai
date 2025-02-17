import requests
from bs4 import BeautifulSoup
import json

def scrape_akc_dog_breeds():
    url = "https://www.akc.org/dog-breeds/"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve page, status code: {response.status_code}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Locate the drop-down menu by its ID
    select_element = soup.find('select', id='mobile-breed-search')
    if not select_element:
        print("Could not find the breed select element.")
        return

    breeds = []
    # Loop over each option in the drop-down; skip the default "Select A Breed" option
    for option in select_element.find_all('option'):
        breed_url = option.get('value', '').strip()
        breed_name = option.get_text(strip=True)
        
        # Skip the default empty option (or option without a valid URL)
        if not breed_url or breed_name.lower() == "select a breed":
            continue

        breeds.append({
            "name": breed_name,
            "url": breed_url
        })
    
    # Write the results to a JSON file
    with open("akc_dog_breeds.json", "w", encoding="utf-8") as f:
        json.dump(breeds, f, indent=4)
    
    print(f"Successfully scraped {len(breeds)} breeds and saved to akc_dog_breeds.json")

if __name__ == "__main__":
    scrape_akc_dog_breeds()
