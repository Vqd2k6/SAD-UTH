from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import Request

# Path to the log file (be-log.md) relative to this file
LOG_FILE_PATH = Path(__file__).parent.parent.parent / "be-log.md"


def log_system_event(
    event_type: str,
    target: str,
    method: str,
    input_data: Any = None,
    output_data: Any = None,
):
    """
    Ghi log các sự kiện hệ thống, API hoặc DB vào file be-log.md
    - event_type: "API" hoặc "DB" hoặc "SYSTEM"
    - target: Tên API endpoint hoặc Tên bảng
    - method: GET, POST, PUT, DELETE, CREATE_TABLE...
    - input_data: Dữ liệu đầu vào
    - output_data: Dữ liệu đầu ra
    """
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    log_entry = f"### [{now}] {event_type} - {target}\n"
    log_entry += f"- **Method:** `{method}`\n"
    if input_data:
        log_entry += f"- **Input:**\n```json\n{input_data}\n```\n"
    if output_data:
        log_entry += f"- **Output:**\n```json\n{output_data}\n```\n"
    log_entry += "---\n\n"

    # Append to the file
    with open(LOG_FILE_PATH, "a", encoding="utf-8") as f:
        f.write(log_entry)


async def api_logging_middleware(request: Request, call_next):
    # Log incoming request
    method = request.method
    target = request.url.path

    # Chạy request
    response = await call_next(request)

    # Ở mức middleware, việc lấy input body/output body của FastAPI khá phức tạp (đòi hỏi consume stream)
    # Tạm thời chỉ ghi log Method, Target, và Status Code.
    # Nếu muốn chi tiết hơn, có thể sử dụng Route-level APIRoute thay thế.
    log_system_event(
        event_type="API",
        target=target,
        method=method,
        input_data=f"Query Params: {request.query_params}",
        output_data=f"Status Code: {response.status_code}",
    )

    return response
