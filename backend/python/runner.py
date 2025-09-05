# python/runner.py 
import sys, json, subprocess, tempfile, os

def run_code(code:str,user_input: str=""):
    if user_input and not user_input.endswith("\n"):
        user_input += '\n'
    #print("python Runner input: ",user_input)
    #print("python Runner input: ", user_input, file=sys.stderr, flush=True)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as tmp:
        tmp.write(code.encode("utf-8"))
        tmp.flush()
        filename = tmp.name
    try:
        result = subprocess.run(
                ["python3",filename],
                capture_output=True,
                input = user_input, #Take user input
                text=True,
                timeout=5
             )
        return {"stdout":result.stdout,"stderr":result.stderr,"returncode":result.returncode}
    except subprocess.TimeoutExpired:
        return {"error":"Execution timer out"}
    finally:
        try: os.remove(filename)
        except: pass

if __name__ == "__main__":
    event = json.loads(sys.stdin.read() or "{}")
    print(json.dumps(run_code(event.get("code",""),event.get("input",""))))
