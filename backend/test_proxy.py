import httpx
import sys
import random

def test_health():
    try:
        response = httpx.get("http://127.0.0.1:8000/health")
        print("Health Check Response:")
        data = response.json()
        print(data)
        assert response.status_code == 200
        assert "dynamic_whitelist_count" in data
        assert data["database_type"] in ["sqlite", "postgresql"]
        print("Health Check PASSED")
    except Exception as e:
        print(f"Health check failed: {e}")
        sys.exit(1)

def test_convert():
    try:
        response = httpx.get("http://127.0.0.1:8000/convert?base=SEK&target=CHF&amount=100")
        print("\nConvert Endpoint Response:")
        data = response.json()
        print(data)
        assert response.status_code == 200
        assert data["base"] == "SEK"
        assert data["target"] == "CHF"
        assert data["amount"] == 100
        assert "converted_amount" in data
        assert isinstance(data["cached"], bool)
        print("Convert test PASSED")

    except Exception as e:
        print(f"Convert endpoint test failed: {e}")
        sys.exit(1)

def test_history():
    try:
        response = httpx.get("http://127.0.0.1:8000/history?base=USD&target=EUR")
        print("\nHistory Endpoint Response (USD -> EUR):")
        data = response.json()
        print(f"Status: {response.status_code}, Points Count: {len(data.get('history', []))}, Is Mock: {data.get('is_mock')}")
        assert response.status_code == 200
        assert data["base"] == "USD"
        assert data["target"] == "EUR"
        assert len(data["history"]) > 0
        assert isinstance(data["is_mock"], bool)
        print("USD -> EUR history check PASSED")

        response_lkr = httpx.get("http://127.0.0.1:8000/history?base=USD&target=LKR")
        print("\nHistory Endpoint Response (USD -> LKR):")
        data_lkr = response_lkr.json()
        print(f"Status: {response_lkr.status_code}, Points Count: {len(data_lkr.get('history', []))}, Is Mock: {data_lkr.get('is_mock')}")
        assert response_lkr.status_code == 200
        assert data_lkr["base"] == "USD"
        assert data_lkr["target"] == "LKR"
        assert len(data_lkr["history"]) > 0
        assert data_lkr["is_mock"] is True
        print("USD -> LKR history check (mock fallback) PASSED")
    except Exception as e:
        print(f"History endpoint test failed: {e}")
        sys.exit(1)

def test_dynamic_whitelist():
    try:
        # Get count
        response = httpx.get("http://127.0.0.1:8000/health")
        initial_count = response.json().get("dynamic_whitelist_count", 0)
        print(f"\nInitial Whitelisted Count in DB: {initial_count}")

        # Post new origin (randomized to make test idempotent)
        rand_id = random.randint(1000, 9999)
        new_origin = f"http://dynamic-client-{rand_id}.lk"
        headers = {"X-Admin-Token": "admin_secret"}
        payload = {"origin": new_origin, "client_name": f"Dynamic Boutique Client {rand_id}"}
        res = httpx.post("http://127.0.0.1:8000/whitelist", json=payload, headers=headers)
        print(f"Whitelist insert response: {res.status_code} - {res.json()}")
        assert res.status_code == 201

        # Check count increased
        response_after = httpx.get("http://127.0.0.1:8000/health")
        after_count = response_after.json().get("dynamic_whitelist_count", 0)
        print(f"New Whitelisted Count in DB: {after_count}")
        assert after_count == initial_count + 1

        # Check Origin Allowed CORS headers
        cors_headers = {"Origin": new_origin}
        res_cors = httpx.get("http://127.0.0.1:8000/health", headers=cors_headers)
        allow_origin = res_cors.headers.get("access-control-allow-origin")
        print(f"CORS Origin validation for '{new_origin}': {allow_origin}")
        assert allow_origin == new_origin

        # Check Malicious Origin CORS is blocked
        blocked_origin = "http://malicious-site.com"
        blocked_headers = {"Origin": blocked_origin}
        res_blocked = httpx.get("http://127.0.0.1:8000/health", headers=blocked_headers)
        blocked_allow = res_blocked.headers.get("access-control-allow-origin")
        print(f"CORS Origin validation for blocked '{blocked_origin}': {blocked_allow}")
        assert blocked_allow is None

        print("Dynamic Whitelisting and CORS Check PASSED")
    except Exception as e:
        print(f"Dynamic Whitelisting test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_health()
    test_convert()
    test_history()
    test_dynamic_whitelist()
    print("\nAll integration checks PASSED!")
