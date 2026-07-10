import urllib.request
import urllib.parse
import json

def do_request(url, method="GET", data=None, headers=None):
    if data and isinstance(data, dict):
        data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    elif data and isinstance(data, str):
        data = data.encode("utf-8")
    
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), response.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def test():
    # Login as admin
    url = "http://localhost:8000/api/auth/login/admin"
    data = urllib.parse.urlencode({"username": "admin@kthp.com", "password": "admin123"})
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    status, resp = do_request(url, "POST", data, headers)
    if status != 200:
        print("Login failed:", status, resp)
        return
    token = json.loads(resp)["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    print("\n--- Testing Staff CRUD ---")
    # GET
    status, resp = do_request("http://localhost:8000/api/staff/", "GET", headers=auth_headers)
    print("GET Staff:", status, resp[:100])

if __name__ == "__main__":
    test()
