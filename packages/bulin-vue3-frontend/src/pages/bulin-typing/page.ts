import { ref } from "vue";

const pageData = {
  path: "/myComponents/bulin-typing",
  title: "布林打字游戏",
  hasChild: false,
  order: 1,
  component: () => import("./index.vue"),
};

export const rootClass = pageData.path.slice(pageData.path.lastIndexOf("/") + 1);

export default pageData;



export const delay = 2000;

export const data = `
There are many apple trees in a garden. 
They're good friends. 
One day an old tree is ill. 
There are many pests in the tree. 
Leaves of the tree turn yellow. 
The old tree feels very sad and unwell. 
Another tree sends for a doctor for him.
 At first, they send for a pigeon, but she has no idea about it.
  Then they send for an oriole, and she can’t treat the old tree well. 
  Then they send for a woodpecker.
   She is a good doctor. 
   She pecks a hole in the tree and eats lots of pests. 
   At last the old tree becomes better and better. 
   Leaves turn green and green.`;
