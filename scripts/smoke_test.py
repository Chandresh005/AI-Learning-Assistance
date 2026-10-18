import sys
import argparse
import httpx


def run_smoke_test(base_url: str):
    print(f"\n--- Running AI Learning Assistant Smoke Tests on {base_url} ---")
    passed = 0
    total = 0

    with httpx.Client(base_url=base_url, timeout=15.0) as client:
        # 1. Health check
        total += 1
        try:
            r = client.get("/api/health")
            if r.status_code == 200 and r.json().get("status") == "healthy":
                print("  [PASS] /api/health endpoint reachable & database connected")
                passed += 1
            else:
                print(f"  [FAIL] /api/health returned {r.status_code}: {r.text}")
        except Exception as e:
            print(f"  [FAIL] /api/health connection failed: {e}")

        # 2. Root docs
        total += 1
        try:
            r = client.get("/")
            if r.status_code == 200 and "docs" in r.json():
                print("  [PASS] Root endpoint & docs metadata reachable")
                passed += 1
            else:
                print(f"  [FAIL] Root endpoint returned {r.status_code}")
        except Exception as e:
            print(f"  [FAIL] Root endpoint connection failed: {e}")

        # 3. List courses
        total += 1
        try:
            r = client.get("/api/courses/")
            if r.status_code == 200 and isinstance(r.json(), list):
                print(f"  [PASS] /api/courses/ returned {len(r.json())} course(s)")
                passed += 1
            else:
                print(f"  [FAIL] /api/courses/ returned {r.status_code}")
        except Exception as e:
            print(f"  [FAIL] /api/courses/ connection failed: {e}")

    print(f"\nResult: {passed}/{total} smoke tests passed ({round((passed/total)*100)}%)\n")
    if passed < total:
        sys.exit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Smoke test AI Learning Assistant API")
    parser.add_argument("--base-url", default="http://localhost:8000", help="API base URL")
    args = parser.parse_args()
    run_smoke_test(args.base_url)
