import urllib.request
import urllib.parse
import json

data = urllib.parse.urlencode({"username": "admin@kthp.com", "password": "admin123"}).encode("utf-8")
req = urllib.request.Request("http://localhost:8000/api/auth/login/admin", data=data)
with urllib.request.urlopen(req) as response:
    res = json.loads(response.read().decode())
    token = res.get("access_token")

headers = {"Authorization": f"Bearer {token}"}

def get_json(url):
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return f"Error {e.code}: {e.read().decode()}"

print("Staff:", get_json("http://localhost:8000/api/staff/"))
print("Config:", get_json("http://localhost:8000/api/config/"))
print("Users:", get_json("http://localhost:8000/api/users/"))
print("Dashboard:", get_json("http://localhost:8000/api/dashboard/statistics"))
