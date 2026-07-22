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
        response = httpx.get("http://127.0.0.1:8000/convert?base=USD&target=EUR&amount=100")
        print("\nConvert Endpoint Response (First request - Fresh):")
        data = response.json()
        print(data)
        assert response.status_code == 200
        assert data["base"] == "USD"
        assert data["target"] == "EUR"
        assert data["amount"] == 100
        assert "converted_amount" in data
        assert data["cached"] is False
        print("First request PASSED")

        # Second request to check caching
        response2 = httpx.get("http://127.0.0.1:8000/convert?base=USD&target=EUR&amount=100")
        print("\nConvert Endpoint Response (Second request - Cached):")
        data2 = response2.json()
        print(data2)
        assert response2.status_code == 200
        assert data2["cached"] is True
        print("Second request (caching validation) PASSED")

    except Exception as e:
        print(f"Convert endpoint test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_health()
    test_convert()
    print("\nAll integration checks PASSED!")
