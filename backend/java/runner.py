# java/runner.py
import sys, json, subprocess, tempfile, os, shutil

def run_code(code: str,user_input:str=""):
    if not user_input:
        user_input = ""
    else:
        user_input = user_input.rstrip("\r\n") + "\n"
    classname = "Main"
    javafile = f"/tmp/{classname}.java"
    with open(javafile, "w") as f:
        f.write(code)
    try:
        # compile
        comp = subprocess.run(
            ["javac", javafile],
            capture_output= True,
            text= True,
            timeout= 5,
            check= True,
        )
        # Run 
        result = subprocess.run(
            ["java","-cp","/tmp",classname],
            input=user_input,
            capture_output= True,
            text= True,
            timeout= 5
        )
        return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}
    except subprocess.TimeoutExpired:
        return {"error": "Execution timed out"}
    except subprocess.CalledProcessError as e:
        return {"error":"Compilation failed", "stderr":e.stderr or e.stdout}
    finally:
        for p in [javafile, f"/tmp/{classname}.class"]:
            try: os.remove(p)
            except: print(f"Failed to delete {p}")

if __name__ == "__main__":

    event = json.loads("""{
      "code": "import java.util.*;\\nclass Main {\\n    public static void main(String[] args) {\\n        Scanner sc = new Scanner(System.in);\\n        String name = sc.nextLine();\\n        System.out.println(\\"Hello, \\" + name);\\n    }\\n}\\n",
      "input": "World\\n"
    }""")


    print(json.dumps(run_code(event.get("code", ""),event.get("input",""))))
                                                                                  