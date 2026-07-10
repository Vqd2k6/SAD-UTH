import urllib.request
import urllib.parse
import json

def test():
    # Login as admin
    url = "http://localhost:8000/api/auth/login/admin"
    data = urllib.parse.urlencode({"username": "admin@kthp.com", "password": "admin123"}).encode("utf-8")
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req) as response:
            resp_data = json.loads(response.read().decode())
            token = resp_data["access_token"]
    except urllib.error.HTTPError as e:
        print("Login failed:", e.code, e.read().decode())
        return

    headers = {"Authorization": f"Bearer {token}"}

    endpoints = [
        ("Dashboard", "http://localhost:8000/api/dashboard/statistics"),
        ("Users", "http://localhost:8000/api/users/"),
        ("Motorbikes", "http://localhost:8000/api/motorbikes/all")
    ]

    for name, endpoint in endpoints:
        print(f"\n--- Testing {name} ---")
        req = urllib.request.Request(endpoint, headers=headers)
        try:
            with urllib.request.urlopen(req) as response:
                print(f"{name} Status:", response.getcode())
                print(f"{name} Response:", response.read().decode()[:200])
        except urllib.error.HTTPError as e:
            print(f"{name} Failed:", e.code, e.read().decode())

if __name__ == "__main__":
    test()
