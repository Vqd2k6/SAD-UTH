import urllib.request
import urllib.parse
import json
import random

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

    print("\n--- Testing Motorbikes CRUD ---")
    ma_xe = f"XM{random.randint(1000, 9999)}"
    new_bike = {
        "MaXe": ma_xe,
        "SoKhung": f"SK{random.randint(1000, 9999)}",
        "SoMay": f"SM{random.randint(1000, 9999)}",
        "BienSo": f"TEST-{random.randint(100, 999)}",
        "HangXe": "Honda",
        "TenXe": "Test Bike",
        "LoaiXe": "Xe_Ga",
        "PhanKhoi": 125,
        "NhomXe": "Nhom_A1",
        "DoiXe": 2024,
        "TrangThaiXe": "San_Sang",
        "MucTieuThuXang": 2.0,
        "SoMuBaoHiem": 2,
        "CoAoMua": True,
        "DonGiaNgay": 100000,
        "ODOHienTai": 0
    }
    # POST
    status, resp = do_request("http://localhost:8000/api/motorbikes/", "POST", new_bike, auth_headers)
    print("POST Motorbike:", status, resp[:200])

    if status == 200:
        bike_data = json.loads(resp)
        ma_xe = bike_data.get("MaXe")
        print("Created MaXe:", ma_xe)
        
        # PUT
        update_bike = {"DonGiaNgay": 120000, "PhanKhoi": 150}
        status, resp = do_request(f"http://localhost:8000/api/motorbikes/{ma_xe}", "PUT", update_bike, auth_headers)
        print("PUT Motorbike:", status, resp[:200])
        
        # DELETE
        status, resp = do_request(f"http://localhost:8000/api/motorbikes/{ma_xe}", "DELETE", headers=auth_headers)
        print("DELETE Motorbike:", status, resp[:200])

if __name__ == "__main__":
    test()
