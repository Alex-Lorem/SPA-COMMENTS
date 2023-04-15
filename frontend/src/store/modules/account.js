import * as api from "@/api";


export default {
    namespaced: true,
    state: {
        user: {},
        error: {},
        isLogged: false,
        loader: true
    },
    mutations: {
        SET_USER_DATA(state, {user}) {
            state.user = user;
        },
        SET_ERROR(state, {error}) {
            state.error = error
        },
        SET_LOADER(state, {loader}) {
            state.loader = loader
        },
        IS_LOGGED(state, {isLogged}) {
            state.isLogged = isLogged;
        },
    },
    actions: {
        async login(store, {email, password}) {
            try {
                store.commit("SET_LOADER", {
                    loader: true,
                });
                const {tokens} = await api.auth.login(email, password)
                localStorage.setItem('accessToken', tokens.accessToken)
                store.commit("IS_LOGGED", {
                    isLogged: true,
                });

            } catch (e) {
                console.log(e)
                store.commit("SET_ERROR", {
                    error: e.response.data,
                });

                store.commit("IS_LOGGED", {
                    isLogged: false,
                });
            } finally {
                store.commit("SET_LOADER", {
                    loader: false,
                });
            }
        },
        async logout(store) {
            try {
                await api.auth.logout()

                store.commit("SET_USER_DATA", {
                   user: {}
                });

                localStorage.removeItem('accessToken')

            } catch (e) {
                console.log(e)
                store.commit("SET_ERROR", {
                    error: e.response.data,
                });

            } finally {
                store.commit("IS_LOGGED", {
                    isLogged: false,
                });
                store.commit("SET_LOADER", {
                    loader: false,
                });
            }
        },
        async refresh(store) {
            try {
                const tokens = await api.auth.refresh()

                localStorage.setItem('accessToken', tokens.accessToken)
                store.commit("IS_LOGGED", {
                    isLogged: true,
                });
                store.commit("SET_ERROR", {
                    error: {},
                });
            } catch (e) {
                store.commit("SET_ERROR", {
                    error: e.response.data,
                });
                store.commit("IS_LOGGED", {
                    isLogged: false,
                });

            } finally {
                store.commit("SET_LOADER", {
                    loader: false,
                });
            }
        },
        async register(store, {username, email, password}) {
            try {
                store.commit("SET_LOADER", {
                    loader: true,
                });
                const data = await api.account.register(username, email, password)
                localStorage.setItem('accessToken', data.tokens.accessToken)
                store.commit("SET_USER_DATA", {
                    user: data
                });

                store.commit("IS_LOGGED", {
                    isLogged: true
                });

                store.commit("SET_ERROR", {
                    error: {},
                });

            } catch (e) {

                store.commit("SET_ERROR", {
                    error: e.response.data,
                });

            } finally {

                store.commit("SET_LOADER", {
                    loader: false,
                });

            }
        },
        async updateUserData(store, {updatedData}) {
            try {
                store.commit("SET_LOADER", {
                    loader: true,
                });
                const accessToken = localStorage.getItem('accessToken')
                const data = await api.account.updateUserData(accessToken, updatedData)
                store.commit("SET_USER_DATA", {
                    user: data
                });

                if(data){
                    store.commit("SET_LOADER", {
                        loader: false,
                    });
                    store.commit("SET_ERROR", {
                        error: {},
                    });
                }
            } catch (e) {
                console.log(e)
                if (e.response.status === 401) {
                    await store.dispatch("refresh")
                    location.reload()
                } else {
                    store.commit("SET_ERROR", {
                        error: e.response.data,
                    });
                    store.commit("SET_LOADER", {
                        loader: false,
                    });
                }
            }
        },
        async fetchUserData(store) {
            try {
                const accessToken = localStorage.getItem('accessToken')
                if(accessToken) {
                    const data = await api.account.getUserData(accessToken)
                    store.commit("SET_USER_DATA", {
                        user: data
                    });
                    store.commit("IS_LOGGED", {
                        isLogged: true
                    });
                    store.commit("SET_ERROR", {
                        error: {},
                    });
                } else {
                    store.commit("IS_LOGGED", {
                        isLogged: false
                    });
                }
            } catch (e) {
                if (e.response.status === 401) {
                    await store.dispatch("refresh")
                } else {

                    store.commit("SET_ERROR", {
                        error: e.response.data,
                    });

                }

            } finally {
                store.commit("SET_LOADER", {
                    loader: false,
                });
            }
        },
        async likeOrDislikeComment(store, {commentId, action}) {

            try {
                store.commit("SET_ERROR", {
                    error: {},
                });
                await api.account.likeOrDislikeComment(localStorage.getItem('accessToken'), commentId, action)

            } catch (e) {
                console.log(e);
                if (e.response.status === 401) {
                    await store.dispatch("refresh")
                } else {
                    store.commit("SET_ERROR", {
                        error: e.response.data,
                    });

                }

            }
        },

    },
    getters: {
        is_logged(state) {
            return state.isLogged
        },
        get_loader(state){
           return state.loader
        },
        get_user_data(state) {
            return state.user
        },
        get_error(state) {
            return state.error
        },

    },
};
