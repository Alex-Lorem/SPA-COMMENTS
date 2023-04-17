import server from "@/api/http";

export async function register(username, email, password) {
    const body = {
        username: username,
        email: email,
        password: password
    }

    const { data } = await server.post("registration/", body);
    return data;
}

export async function updateUserData(accessToken, updatedData) {
    const { data } = await server.post("update-user/", updatedData, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            'Content-Type': `multipart/form-data`
        },
    });

    return data;
}

export async function getUserData(accessToken) {
    const { data } = await server.get("get-user/", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        }
    });
    return data;
}
export async function likeOrDislikeComment(accessToken, commentId, likeOrDislike) {
    const { data } = await server.post("like-dislike-comment/", {

        commentId: commentId,
        action: likeOrDislike
    }, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    return data;
}





