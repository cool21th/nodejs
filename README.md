# nodejs

nodejs 는 V8(by Google) Engine, libuv(C++ opensource Project)에서 구동된다
[참고: nodejs의 내부 동작 원리](http://sjh836.tistory.com/149)

    V8 은 Javascript 코드를 해석및 실행
    libuv 는 filesystem에 접근및 비동기 실행

javascript code(100% js) -> nodejs(50% js, 50% c++) -> V8(30% JS, 70% C++), libuv(100% C++)

### 구동원리

Javascript Code(User write) -> Node's javascript Side(lib folder in Node Repo) -> process.binding() (Connects JS and C++ functions) -> V8(Converts values between JS and C++ world) -> Node's C++ Side(src folder Node Repo) -> libuv(Gives Node easy access to underlying OS)


[NodeJS Github Repo](https://github.com/nodejs/node)

Node Repo를 보면 lib 는 javascript 영역이고, src는 C++ 영역이다.


Node' Crypto Library : [pbkdf2 JS 영역](https://github.com/nodejs/node/blob/master/lib/internal/crypto/pbkdf2.js), [C++ 영역](https://github.com/nodejs/node/blob/master/src/node_crypto.cc)

    pbkdf2 Function : [input] = password, salt, other opinion / [output]: hash


### Node Event Loop

Node Program은 one Threads안에 Event Loop로 되어있다
