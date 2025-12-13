export class AuthResponseDto {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    };
    token: string;
}
