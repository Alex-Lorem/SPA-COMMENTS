import server from "@/api/http";

export async function login(email, password) {
    const body = {
        email: email,
        password: password
    }
    const { data } = await server.post("login/", body);
    return data;
}

export async function logout() {
    const { data } = await server.post("logout/");
    return data;
}

export async function refresh() {
    const { data } = await server.post("refresh/");

    return data;
}

