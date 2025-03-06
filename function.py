import requests

def get_pr_sale_data(filter_type='yesterday'):
    # Map 'monthly' to 'this_month' for API compatibility
    api_filter_type = 'this_month' if filter_type == 'monthly' else filter_type
    url = f"https://api.onwords.in/get_pr_data/?filter_type={api_filter_type}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors.
        
        # Parse the JSON response
        json_response = response.json()
        
        # Check if 'data' key exists in the response
        if 'status' not in json_response or json_response['status'] != 'success' or 'data' not in json_response:
            print(f"Error: Invalid response format or 'data' key not found in response: {json_response}")
            return None
            
        pr_data = json_response.get('data')
        
        # Check if pr_data is valid - it should be a dictionary with person names as keys
        if not pr_data or not isinstance(pr_data, dict):
            print(f"Error: Invalid or empty PR data format: {pr_data}")
            return None
            
        pr = []

        # Process the new PR data structure where each key is a person's name
        # and the value contains their performance metrics
        for person, details in pr_data.items():
            if not isinstance(details, dict):
                continue
                
            # Make sure all required fields are present, with defaults for missing fields
            sanitized_details = {
                'name': person,
                'date': filter_type,  # Use filter_type as date since specific date is not provided in new format
                'visits': details.get('visits', 0),
                'sales': details.get('sales', 0),
                'points': details.get('points', 0),
                'abp': details.get('abp', 0)
            }
            
            pr.append(sanitized_details)
                
        print(f"Processed {len(pr)} PR data records")
        return pr
        
    except requests.RequestException as e:
        print(f"Request error fetching PR data: {e}")
        return None
    except ValueError as e:
        print(f"JSON parsing error fetching PR data: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error fetching PR data: {e}")
        return None

def get_tc_data(filter_type='yesterday'):
    # Map 'monthly' to 'this_month' for API compatibility
    api_filter_type = 'this_month' if filter_type == 'monthly' else filter_type
    url = f"https://api.onwords.in/get_tc_data/?filter_type={api_filter_type}"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors.
        
        # Parse the JSON response
        json_response = response.json()
        
        # Check if response has valid format with 'status' and 'data' fields
        if 'status' not in json_response or json_response['status'] != 'success' or 'data' not in json_response:
            print(f"Error: Invalid response format or 'data' key not found in TC response: {json_response}")
            return None
            
        tc_data = json_response.get('data')
        
        # Check if tc_data is valid - it should be a dictionary with person names as keys
        if not tc_data or not isinstance(tc_data, dict):
            print(f"Error: Invalid or empty TC data format: {tc_data}")
            return None
            
        tc = []

        # Process the new TC data structure where each key is a person's name
        # and the value contains their performance metrics
        for person, details in tc_data.items():
            if not isinstance(details, dict):
                continue
            
            # Make sure all required fields are present, with defaults for missing fields
            # For TC data, we adapt calls, connects, leads fields
            sanitized_details = {
                'name': person,
                'date': filter_type,  # Use filter_type as date since specific date is not provided in new format
                'calls': details.get('calls', 0),
                'connects': details.get('connects', 0),
                'leads': details.get('demos', 0),  # Using 'demos' as equivalent to 'leads'
                'conversion': details.get('conversion', 0)
            }
            
            tc.append(sanitized_details)
                
        print(f"Processed {len(tc)} TC data records")
        return tc
        
    except requests.RequestException as e:
        print(f"Request error fetching TC data: {e}")
        return None
    except ValueError as e:
        print(f"JSON parsing error fetching TC data: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error fetching TC data: {e}")
        return None

