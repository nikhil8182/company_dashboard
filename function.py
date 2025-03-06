import requests
import time
import logging

# Configure connection parameters
API_TIMEOUT = 10  # Increased timeout to 10 seconds
API_MAX_RETRIES = 3
API_RETRY_DELAY = 2  # seconds between retry attempts

logger = logging.getLogger(__name__)

def get_pr_sale_data(filter_type='yesterday'):
    # Use filter_type directly - the API accepts 'monthly'
    api_filter_type = filter_type
    
    url = f"https://api.onwords.in/get_pr_data/?filter_type={api_filter_type}"
    
    try:
        # Add timeout and retries for API resilience
        retry_count = 0
        
        while retry_count < API_MAX_RETRIES:
            try:
                logger.info(f"Fetching PR data from: {url}")
                response = requests.get(url, timeout=API_TIMEOUT)
                response.raise_for_status()  # Raise an exception for HTTP errors
                
                # Parse the JSON response
                json_response = response.json()
                
                # Check if 'data' key exists in the response
                if 'status' not in json_response or json_response['status'] != 'success' or 'data' not in json_response:
                    logger.warning(f"Error: Invalid response format or 'data' key not found in response: {json_response}")
                    return None
                    
                pr_data = json_response.get('data')
                
                # Check if pr_data is valid - it should be a dictionary with person names as keys
                if not pr_data or not isinstance(pr_data, dict):
                    logger.warning(f"Error: Invalid or empty PR data format: {pr_data}")
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
                        
                logger.info(f"Processed {len(pr)} PR data records")
                return pr
                
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                retry_count += 1
                if retry_count >= API_MAX_RETRIES:
                    logger.error(f"Max retries reached when connecting to PR API: {str(e)}")
                    raise
                logger.warning(f"Retry {retry_count}/{API_MAX_RETRIES} after connection error: {str(e)}")
                time.sleep(API_RETRY_DELAY)
        
    except requests.RequestException as e:
        logger.error(f"Request error fetching PR data: {e}")
        return None
    except ValueError as e:
        logger.error(f"JSON parsing error fetching PR data: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching PR data: {e}")
        return None

def get_tc_data(filter_type='yesterday'):
    # Use filter_type directly - the API accepts 'monthly'
    api_filter_type = filter_type
    
    url = f"https://api.onwords.in/get_tc_data/?filter_type={api_filter_type}"
    
    try:
        # Add timeout and retries for API resilience
        retry_count = 0
        
        while retry_count < API_MAX_RETRIES:
            try:
                logger.info(f"Fetching TC data from: {url}")
                response = requests.get(url, timeout=API_TIMEOUT)
                response.raise_for_status()  # Raise an exception for HTTP errors
                
                # Parse the JSON response
                json_response = response.json()
                
                # Check if response has valid format with 'status' and 'data' fields
                if 'status' not in json_response or json_response['status'] != 'success' or 'data' not in json_response:
                    logger.warning(f"Error: Invalid response format or 'data' key not found in TC response: {json_response}")
                    return None
                    
                tc_data = json_response.get('data')
                
                # Check if tc_data is valid - it should be a dictionary with person names as keys
                if not tc_data or not isinstance(tc_data, dict):
                    logger.warning(f"Error: Invalid or empty TC data format: {tc_data}")
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
                        'conversion': details.get('conversion', 0),
                        'points': details.get('points', 0)  # Added points for consistency
                    }
                    
                    tc.append(sanitized_details)
                        
                logger.info(f"Processed {len(tc)} TC data records")
                return tc
                
            except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
                retry_count += 1
                if retry_count >= API_MAX_RETRIES:
                    logger.error(f"Max retries reached when connecting to TC API: {str(e)}")
                    raise
                logger.warning(f"Retry {retry_count}/{API_MAX_RETRIES} after connection error: {str(e)}")
                time.sleep(API_RETRY_DELAY)
        
    except requests.RequestException as e:
        logger.error(f"Request error fetching TC data: {e}")
        return None
    except ValueError as e:
        logger.error(f"JSON parsing error fetching TC data: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching TC data: {e}")
        return None

