# cat go/runner.py 
import sys, json, subprocess, os

def run_code(code: str, user_input: str = ""):
    if not user_input:
        user_input = ""
    else:
        user_input = user_input.rstrip("\r\n") + "\n"

    gofile = "/tmp/main.go"
    binfile = "/tmp/main.out"

    with open(gofile, "w") as f:
        f.write(code)
    #with open(gofile, "r") as f:
    #    print("DEBUG WRITTEN FILE:\n" + f.read(), file=sys.stderr)
    try:
        # Compile
        subprocess.run(
            ["go", "build", "-o", binfile, gofile],
            capture_output=True,
            text=True,
            check=True,
            timeout=10,
        )
     #   print("Compiler")
        # Run
        result = subprocess.run(
            [binfile],
            input=user_input,
            capture_output=True,
            text=True,
            timeout=5,
        )
      #  print("executed")
       # print(result)
        
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out"}
    except subprocess.CalledProcessError as e:
        return {"error": "Compilation failed", "stderr": e.stderr or e.stdout}
    finally:
        for p in [gofile, binfile]:
            try:
                os.remove(p)
            except FileNotFoundError:
                pass

if __name__ == "__main__":
    # Read event JSON from stdin
    raw = sys.stdin.read()

    if raw.strip():
        event = json.loads(raw)
    else:
        # Fallback for testing
        event = {
            "code": """package main
import (
    "fmt"
    "bufio"
    "os"
)
func main() {
    reader := bufio.NewReader(os.Stdin)
    name, _ := reader.ReadString('\n')
    fmt.Printf("Hello, %s", name)
}""",
            "input": "World\n"
        }
    #print("DEBUG EVENT:", event, file=sys.stderr)

    print(json.dumps(run_code(event.get("code", ""), event.get("input", ""))))
