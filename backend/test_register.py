import asyncio
from db import init_db
from models import User
from auth import get_password_hash

async def test():
    await init_db()
    hash_test = get_password_hash("password")
    print("Hash generated:", hash_test)
    new_user = User(
        username="test_user" + str(asyncio.get_event_loop().time()),
        email="test@example.com",
        password_hash=hash_test,
        role="user"
    )
    await new_user.insert()
    print("User inserted!")

asyncio.run(test())
