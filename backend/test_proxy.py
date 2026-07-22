import httpx
import sys

def test_health():
    try:
        response = httpx.get("http://127.0.0.1:8000/health")
        print("Health Check Response:")
        print(response.json())
        assert response.status_code == 200
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
        # Test pair (USD -> EUR) - may resolve to mock due to simulated future system dates (2026)
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

        # Test unsupported fallback pair (USD -> LKR) - guaranteed to be mock
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

if __name__ == "__main__":
    test_health()
    test_convert()
    test_history()
    print("\nAll integration checks PASSED!")
