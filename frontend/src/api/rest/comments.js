import server from "@/api/http";

export async function getComments(page) {

    const { data } = await server.get(`get-comments/${page}`);

    return data;
}

export async function getChildsComments(commentId) {

    const { data } = await server.get(`childs-comments/${commentId}`);

    return data;
}

export async function createComment({accessToken, author, username, text, image, isMajor, publicationDate, gradation, parentId}) {
    const body = {
        author: author,
        username: username,
        text: text,
        image: image,
        isMajor: isMajor,
        publicationDate: publicationDate,
        gradation: gradation,
        parentId: parentId
    }
    const { data } = await server.post('create-comment/', body, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    return data;
}
export async function getPagination(){
    const {data} = await server.get('get-pagination-length/')

    return data
}

