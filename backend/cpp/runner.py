# cpp/runner.py 
import sys, json, subprocess, tempfile, os

def run_code(code: str,user_input:str=""):
    if not user_input:
        user_input = ""
    else:
        user_input = user_input.rstrip("\r\n") + "\n"

    with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp") as tmp:
        tmp.write(code.encode("utf-8"))
        tmp.flush()
        cppfile = tmp.name
    exefile = "/tmp/a.out"
    try:
        # Compile
        subprocess.run(
            ["g++", "-O2", "-std=c++17", cppfile, "-o", exefile],
            capture_output=True,
            text=True,
            timeout=5,
            check=True
        )
        # Run
        result = subprocess.run(
            [exefile],
            input = user_input,
            capture_output=True,
            text=True,
            timeout=5
        )
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out"}
    except subprocess.CalledProcessError as e:
        return {"error": "Compilation failed", "stderr": e.stderr or e.stdout}
    finally:
        for p in [cppfile, exefile]:
            try: os.remove(p)
            except: pass

if __name__ == "__main__":
    event = json.loads(sys.stdin.read() or "{}")
    print(json.dumps(run_code(event.get("code", ""),event.get("input",""))))
