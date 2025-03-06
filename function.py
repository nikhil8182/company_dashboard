import requests

def get_pr_sale_data(filter_type='yesterday'):
    url = f"https://api.onwords.in/get_pr_data/?filter_type={filter_type}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors.
        pr_data =  response.json().get('data')
        pr = []

        for records in pr_data.values():
            for person, details in records.items():
                # print(f"{details}")
                pr.append(details)
        print(pr)
        return pr
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

def get_tc_data(filter_type='yesterday'):
    url = f"https://api.onwords.in/get_tc_data/?filter_type={filter_type}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors.
        tc_data = response.json().get('data')
        tc = []

        for records in tc_data.values():
            for person, details in records.items():
                tc.append(details)
        print(tc)
        return tc
    except requests.RequestException as e:
        print(f"Error fetching TC data: {e}")
        return None

