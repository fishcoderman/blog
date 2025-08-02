```js
// 形参无法改变值
function wrap(myExports) {
  // myExports = {
  //   name: 'jack',
  // };
  myExports.name = 'jack';
}

let myExports = {
  name: 'alien',
};
wrap(myExports);
console.log(myExports);
console.log(1);

// 异常捕获
// try {
//   new Promise(function (resolve, reject) {
//     console.log(2);
//     a.b;
//     console.log(3);
//   }).then((v) => {
//     console.log(v);
//   });
// } catch (e) {
//   console.log('error', e);
// }
// output
// Uncaught (in promise) ReferenceError: a is not defined

async function test(state) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      if (state) {
        resolve(true);
      } else {
        reject(false);
      }
    }, 1000);
  });
}

async function run(state) {
  return new Promise(async function (resolve, reject) {
    const res = await test(false);
    setTimeout(async () => {
      if (state) {
        resolve(true);
      } else {
        reject(false);
      }
    }, 1000);
  });
}

async function work() {
  try {
    const res = await run(false);
    console.info('next', res);
  } catch (error) {
    console.info('error', error);
  }
}

work();


```