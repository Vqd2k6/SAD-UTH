import requests
import json
import random

def test():
    # Login as admin
    resp = requests.post("http://localhost:8000/api/auth/login/admin", data={"username": "admin@kthp.com", "password": "admin123"})
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

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
    requests.post("http://localhost:8000/api/motorbikes/", json=new_bike, headers=headers)
    
    res = requests.delete(f"http://localhost:8000/api/motorbikes/{ma_xe}", headers=headers)
    print("DELETE:", res.status_code, res.text)
    
test()
