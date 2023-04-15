import { createStore } from "vuex";

import account from "./modules/account";
import comments from "./modules/comments";

export default createStore({
  modules: { account, comments },
});
