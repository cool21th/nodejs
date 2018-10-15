# nodejs

nodejs 는 V8(by Google) Engine, libuv(C++ opensource Project)에서 구동된다
[참고: nodejs의 내부 동작 원리](http://sjh836.tistory.com/149)

javascript code(100% js) -> nodejs(50% js, 50% c++) -> V8(30% JS, 70% C++), libuv(100% C++)


[NodeJS Github Repo](https://github.com/nodejs/node)

Node Repo를 보면 lib 는 javascript 영역이고, src는 C++ 영역이다.


Node' Crypto Library : [pbkdf2](https://github.com/nodejs/node/blob/master/lib/internal/crypto/pbkdf2.js)

    pbkdf2 Function : [input] = password, salt, other opinion / [output]: hash
    
Javascript Code(User write) -> Node's javascript Side(lib folder in Node Repo) -> process.binding() -> V8 -> Node's C++ Side(src folder Node Repo) -> libuv(Gives Node easy access to underlying OS)


