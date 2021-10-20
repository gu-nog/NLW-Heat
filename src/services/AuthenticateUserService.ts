import axios from "axios";
import "dotenv/config"
import { sign } from "jsonwebtoken";
import prismaClient from "../prisma"

interface IAcessTokenResponse {
    access_token: string
}

interface IUserResponse {
    avatar_url: string;
    login: string;
    id: number;
    name: string;
}

class AuthenticateUserService {
    async execute(code: string){
        // Recuperar o acess_token no github
        const url = "https://github.com/login/oauth/access_token";
        const { data: accessTokenResponse } = await axios.post<IAcessTokenResponse>(url, null, {
            params: {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            headers: {
                "Accept": "application/json"
            }
        });

        // Recuperar infos do user no github
        const response = await axios.get<IUserResponse>(
            "https://api.github.com/user", {
            headers: {
                authorization: `Bearer ${accessTokenResponse.access_token}`
            }
        })

        // Verificar se o usuário existe no BD
        const { login, id, avatar_url, name } = response.data
        let user = await prismaClient.user.findFirst({
            where: {
                github_id: id
            }
        })

        // Se não, cria no BD
        if (!user) {
            user = await prismaClient.user.create({
                data: {
                    github_id: id,
                    login,
                    avatar_url,
                    name
                }
            })
        }

        // Se sim, gera um token
        const token = sign(
            {
                user: {
                    name: user.name,
                    avatar_url: user.avatar_url,
                    id: user.id
                }
            },
            process.env.JWT_SECRET,
            {
                subject: user.id,
                expiresIn: "1d"
            }
        );

        // Retorna o token com as informações do usuário
        return { token, user };
    }
}

export { AuthenticateUserService }
