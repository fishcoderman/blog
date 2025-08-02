```js
const list = [
  { id: 7, name: '部门11-1', pid: 6 },
  { id: 8, name: '部门11-2', pid: 6 },
  { id: 1, name: '部门1', pid: 0 },
  { id: 2, name: '部门2', pid: 1 },
  { id: 3, name: '部门3', pid: 1 },
  { id: 4, name: '部门4', pid: 3 },
  { id: 5, name: '部门5', pid: 4 },
  { id: 6, name: '部门11', pid: 0 },
];

// 1最简单版本
function arrayToTree(arr, parentId) {
  return arr
    .filter((item) => item.pid === parentId)
    .map((item) => {
      item.children = arrayToTree(arr, item.id);
      return item;
    });
}

// 2优化版本 减少查询
function arrToTree(array, parentId) {
  const result = [];
  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    if (element.pid === parentId) {
      array.splice(index, 1);
      index--;
      element.children = arrToTree(array, element.id);
      result.push(element);
    }
  }
  return result;
}

// 3优化版本 遍历两次
function transferTree(list) {
  var map = {};
  var result = [];
  list.forEach((item) => {
    map[item.id] = item;
  });
  list.forEach((item) => {
    let parent = map[item.pid];
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    } else {
      result.push(item);
    }
  });
  return result;
}

// 4优化版本 遍历一次
function arrayToTrees(list) {
  const result = []; // 存放结果集
  const map = {};
  for (const item of list) {
    const id = item.id;
    const pid = item.pid; //把当前值加入map
    if (!map[id]) {
      map[id] = { children: [] };
    }
    map[id] = { ...item, children: map[id]['children'] };
    const treeItem = map[id];
    if (pid === 0) {
      result.push(treeItem);
    } else {
      if (!map[pid]) {
        map[pid] = { children: [] };
      }
      map[pid].children.push(treeItem);
    }
  }
  return result;
}

// 树搜索
function filterTreeData(nodes, queryFn) {
  var result = [];

  for (var i = 0; i < nodes.length; i++) {
    var node = { ...nodes[i] };

    if (queryFn(node)) {
      result.push(node);
    } else if (node.children) {
      var newChildren = filterTreeData(node.children, queryFn);

      if (newChildren.length) {
        node.children = newChildren;
        result.push(node);
      }
    }
  }

  return result;
}

```