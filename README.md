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

Node Program은 one Thread안에 Event Loop로 되어있다

    Node Evnet Loop             ->  Single Threaded
    Some of Node FWK/Std Lib    ->  Not single Threaded

NodeJS 가 single Thread로 되어 있다는 말은 틀린말이다. Event Loop이 single thread로 되어있다는게 맞는 말이다.

    # threads.js
    const crypto = require('crypto');

    # 1
    const start = Date.now();
    crypto.pbkdf2('a','b',100000,512,'sha512',()=>{
        console.log('1:',Date.now() - start);
    });
    
    # 2
    crypto.pbkdf2('a','b',100000,512,'sha512',()=>{
        console.log('2:',Date.now() - start);
    });
    
thread.js 를 실행하면, 1과 2가 동시에 실행되는 것을 알수 있다.  이것이 가능한 이유는 libuv(thread pool 보유)에서 처리하기 때문이다
