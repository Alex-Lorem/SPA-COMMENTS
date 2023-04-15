import * as api from "../../api";


export default {
  namespaced: true,
  state: {
    comments:[],
    loader: true,
    childComments: [],
    paginationLength: 1
  },
  mutations: {

    ADD_COMMENTS(state, { comments, page }) {
      state.comments.push({page: page, data:comments});
    },

    ADD_NEW_COMMENT(state, { newComment }){
      state.comments[0].data.unshift(newComment)
    },

    ADD_NEW_CHILD_COMMENT(state, { parentId, comment}) {
      let indexOfParent = state.childComments.findIndex(item => item.parentId === parentId)
      if(indexOfParent < 0){
        const obj = {
          parentId: parentId,
          items: [comment]
        }
        state.childComments.push(obj)
      } else {
        state.childComments[indexOfParent].items.push(comment)
      }
    },

    ADD_CHILD_COMMENTS(state, {addChildComments, parentId}){
      const obj = {
        parentId: parentId,
        items: addChildComments
      }
      state.childComments.push(obj)
    },

    SET_PAGINATION_LENGTH(state, {pagination}){
      state.paginationLength = pagination
    },

    SET_LOADER(state, { loader }) {
      state.loader = loader;
    },

    SET_ERROR(state, { error }) {
      state.error = error
      state.loader = false;
    },

  },
  actions: {
    async fetchComments(store, {page}) {
      try {

        const comments = await api.comments.getComments(page)

        store.commit("ADD_COMMENTS", {
          comments: comments,
          page: page
        });
        store.commit("SET_LOADER", {
          loader: false,
        });
      } catch (e) {
        console.log(e);
        store.commit("SET_ERROR", {
          error: e.response.data,
        });
      }
    },
    async fetchChildComments(store, {parentId}) {
      try {
        const comments = await api.comments.getChildsComments(parentId)

        store.commit("ADD_CHILD_COMMENTS", {
          addChildComments: comments,
          parentId: parentId
        });

        store.commit("SET_LOADER", {
          loader: false,
        });
      } catch (e) {
        console.log(e);
        store.commit("SET_ERROR", {
          error: e.response.data,
        });
      }
    },
    async createComment(store, {author, username, text, image, isMajor, publicationDate, gradation, parentId}) {
      try {
        const comment = await api.comments.createComment({
          accessToken: localStorage.getItem('accessToken'),
          author: author,
          username:username,
          text:text,
          image:image,
          isMajor:isMajor,
          publicationDate:publicationDate,
          gradation: gradation,
          parentId: parentId})
        if(isMajor){
          store.commit("ADD_NEW_COMMENT", {
            newComment: comment,
          });
        } else {
          store.commit("ADD_NEW_CHILD_COMMENT", {
            parentId: parentId,
            comment: comment,
          });
        }

      } catch (e) {
        console.log(e);
        store.commit("SET_ERROR", {
          error: e.response.data,
        });
      }
    },
    async fetchPagination(store) {
      try {
        const pagination = await api.comments.getPagination()

        store.commit("SET_PAGINATION_LENGTH", {
          pagination: pagination,
        });
      } catch (e) {
        console.log(e);
        store.commit("SET_ERROR", {
          error: e.response.data,
        });
      }
    }
    },
  getters: {
    get_loader(state) {
      return state.loader;
    },

    get_all_comments(state){
      return state.comments
    },
    get_pagination_length(state){
      return state.paginationLength
    },
    get_gradation: (state) => ({parentId}) =>{

      for(let i=0; i < state.comments.length; i++){
        const isReplyToMajor = state.comments[i].data.findIndex(item => item.id === parentId)
        if(isReplyToMajor >= 0){
          return 2
        }
      }

      for(let i = 0; i < state.childComments.length; i++){
        let childs = state.childComments[i]

        for(let childInner of childs.items){
          if(parentId === childInner.id){
            return childInner.gradation + 1
          }
        }
      }
      return 1
    },

    get_child_comments: (state) => ({parentId}) => {
      for(let child of state.childComments){
        if(child.parentId === parentId){
          return child
        }
      }
    },

    get_error(state) {
      return {
        error: state.error
      };
    },
  },
};
