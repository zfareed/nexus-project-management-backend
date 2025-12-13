import { UserDto } from '../../auth/dto/user.dto';

/**
 * UserListDto - DTO for paginated user list response
 * Used for GET /users endpoint response
 */
export class UserListDto {
    /**
     * Array of users (without passwords)
     */
    users: UserDto[];

    /**
     * Total number of users matching the query
     */
    total: number;

    /**
     * Current page number (1-indexed)
     */
    page: number;

    /**
     * Number of items per page
     */
    limit: number;

    /**
     * Total number of pages
     */
    totalPages: number;
}
