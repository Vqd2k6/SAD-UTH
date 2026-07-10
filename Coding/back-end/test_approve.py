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
    
    # Try to approve user
    req = urllib.request.Request("http://localhost:8000/api/users/KH5D3C82/gplx/approve", headers=headers, method="PUT")
    try:
        with urllib.request.urlopen(req) as response:
            print("Approve Status:", response.getcode())
            print("Approve Response:", response.read().decode()[:200])
    except urllib.error.HTTPError as e:
        print("Approve Failed:", e.code, e.read().decode())

if __name__ == "__main__":
    test()
