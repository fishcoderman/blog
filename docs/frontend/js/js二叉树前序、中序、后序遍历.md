# js二叉树

我们假定，使用JavaScript构建了一颗二叉树，结构如下：

![image](https://github.com/user-attachments/assets/9b0aead6-997f-45ed-b227-afc35fb9ecde)

使用JavaScript描述描述：

```js
const Tree = {
  val: 1,
  left: {
    val: 2,
    left: { val: 4 },
    right: { val: 5 },
  },
  right: {
    val: 3,
    left: { val: 6 },
    right: { val: 7 },
  },
};
```

###  前序遍历 (Preorder Traversal)
对于二叉树的一个节点，前序遍历的意思是，先访问该节点，然后再访问左节点，左后访问右节点。

> 根 -> 左 -> 右 

在当前构建的二叉树中，先序遍历的结果应该是：1,2,4,5,3,6,7

#### 1.利用递归实现

```js
let pre_list_01 = [];
function preOrder01(node) {
  pre_list_01.push(node.val);
  if (node.left) preOrder01(node.left);
  if (node.right) preOrder01(node.right);
}
preOrder01(Tree);
console.log("先序遍历【递归版】：", pre_list_01.join(","));
```

#### 2.利用非递归的方法实现

1.先初始化一个栈，把要遍历的节点放进去
2.然后循环，将栈顶部的节点弹出，作为访问节点
3.对访问节点进行操作（业务操作，比如显示数字等）
4.访问节点的右子树入栈
5.访问节点的左子树入栈
重复2步骤

```js
let pre_list_02 = [];
function preOrder02(node) {
  /**
   * 利用栈，控制后进去的节点，先遍历到
   */
  let stack = [node];
  while (stack.length) {
    let n = stack.pop();
    pre_list_02.push(n.val);
    if (n.right) stack.push(n.right);
    if (n.left) stack.push(n.left);
  }
}
preOrder02(Tree);
console.log("先序遍历【非递归版】：", pre_list_02.join(","));
```
### 中序遍历 (Inorder Traversal)

> 节点访问顺序：左 -> 根 -> 右

在当前构建的二叉树中，先序遍历的结果应该是： 4,2,5,1,6,3,7

#### 1.利用递归实现

```js
let in_list_01 = [];
function inOrder01(node) {
  if (node.left) inOrder01(node.left);
  in_list_01.push(node.val);
  if (node.right) inOrder01(node.right);
}
inOrder01(Tree);
console.log("中序遍历【递归版】：", in_list_01.join(","));

```
#### 2.利用非递归的方法实现

1.维护一个栈，和一个指针p
2.移动指针p，从某个节点开始，将该节点下的所有左节点，都放入栈中
3.然后取出栈顶的节点，作为访问节点，这个几点没有任何子节点，直接作为中序遍历的左侧值
4.然后将p，移动到访问节点的右侧
5.重复2步骤以后的过程

关于p的说明：p代表走过节点的指针，在4步骤中，将p指向访问节点右侧后，在第二次循环中，会把访问节点右侧，当作一个初始节点，以用来遍历访问节点右侧的左节点。

```js
let in_list_02 = [];
function inOrder02(node) {
  let stack = [];
  let p = node;
  while (stack.length || p) {
    while (p) {
      stack.push(p);
      p = p.left;
    }
    let n = stack.pop();
    // console.log(n);
    in_list_02.push(n.val);
    p = n.right;
  }
}
inOrder02(Tree);
console.log("中序遍历【非递归版】：", in_list_02.join(","));

```
### 后序遍历 (Postorder Traversal)

> 节点访问顺序： 左 -> 右 -> 根

在当前构建的二叉树中，先序遍历的结果应该是：4,5,2,6,7,3,1

#### 1.利用递归实现

```js
let post_list_01 = [];
function postOrder01(node) {
  if (node.left) postOrder01(node.left);
  if (node.right) postOrder01(node.right);
  post_list_01.push(node.val);
}
postOrder01(Tree);
console.log("后序遍历【递归版】：", post_list_01.join(","));
```
#### 2.利用非递归的方法实现

用法参考中序遍历的非递归版

1.维护一个栈，和一个指针p
2.移动指针p，从某个节点开始，将该节点下的所有左节点，都放入栈中
3.然后取出栈顶的节点，作为访问节点，
4.如果访问节点有右节点：将访问节点的值（纯值，不含有左右节点放入栈，将p指向右节点
4.如果访问节点没有右节点：对方问节点进行操作（业务操作等等）
5.重复2步骤以后的过程

```js
let post_list_02 = [];
function postOrder02(node) {
  let stack = [];
  let p = node;
  while (stack.length || p) {
    while (p) {
      stack.push(p);
      p = p.left;
    }
    let n = stack.pop();
    if (n.right) {
      stack.push(n.val);
      p = n.right;
    } else {
      post_list_02.push(n.val || n);
    }
  }
}
postOrder02(Tree);
console.log("后序遍历【非递归版】：", post_list_02.join(","));
```

### 总结

遍历始终都是从左到右，前序就是根在前面，中序就是根在中间，后序遍历就是根在后面。
