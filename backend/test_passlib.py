from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
try:
    print(pwd_context.hash("password"))
except Exception as e:
    print("ERROR CAUGHT:")
    import traceback
    traceback.print_exc()
