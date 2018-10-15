# nodejs

## Internals of Node
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
    
    #결과
    2: 926
    1: 928
    
thread.js 를 실행하면, 1과 2가 동시에 실행되는 것을 알수 있다.  이것이 가능한 이유는 libuv(thread pool 보유)에서 처리하기 때문이다

    # threads.js
    const crypto = require('crypto');

    const start = Date.now();
    # 1
    crypto.pbkdf2('a','b',100000,512,'sha512',()=>{
        console.log('1:',Date.now() - start);
    });
    
    #2
    crypto.pbkdf2('a','b',100000,512,'sha512',()=>{
        console.log('2:',Date.now() - start);
    });
    
    #3
    crypto.pbkdf2('a','b',100000,512,'sha512',()=>{
        console.log('3:',Date.now() - start);
    });
    
    #4
    crypto.pbkdf2('a','b',100000,512,'sha512',()=>{
        console.log('4:',Date.now() - start);
    });
    
    #5
    crypto.pbkdf2('a','b',100000,512,'sha512',()=>{
        console.log('5:',Date.now() - start);
    });
    
    # 결과
    3: 963
    4: 966
    2: 973
    1: 1008
    5: 1848
    
libuv 의 Thread Pool 내부의 Thread 개수가 4개인 것을 확인할 수 있다
thread pool의 사이즈 조정이 가능하다 ex) process.env.UV_THREADPOOL_SIZE = 2 

### OS Operation

    #async.js
    
    const https = require('https');

    const start = Date.now()


    function doRequest() {

        https.request('https://www.google.com', res => {
            res.on('data', ()=> {});
            res.on('end', () => {
                console.log(Date.now() -start);
            });
        })
        .end();
    }

    doRequest();
    doRequest();
    doRequest();
    doRequest();
    doRequest();
    doRequest();
    doRequest();
    
    # 결과 
    354
    358
    359
    363
    364
    365
    390

앞서 Thread Pool이 4개였을 때의 경우와 다르게 7개의 function이 동일하게 수행되는 것을 볼 수 있다. 이것은 libuv os delegation이 수행된 것임을 확인할 수 있다 즉, Operating System이 수행을 하고, libuv의 thread pool을 건들지 않게 되는 것이다

OS's async로 처리되는 케이스는 모든 OS를 위한 networking library (request, receive, setting up a listener on some port)가 된다


## Enhancing Node Performance

Node의 성능향상을 위해 Cluster mode 를 추천한다


