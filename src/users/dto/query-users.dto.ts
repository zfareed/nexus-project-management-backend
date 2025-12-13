import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * QueryUsersDto - DTO for querying users with pagination and search
 * Used for GET /users endpoint (admin-only)
 */
export class QueryUsersDto {
    /**
     * Page number for pagination (1-indexed)
     * @default 1
     */
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        minimum: 1,
        default: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    /**
     * Number of items per page
     * @default 10
     */
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Number of items per page',
        minimum: 1,
        default: 10,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    /**
     * Search query to filter users by name or email
     * Performs case-insensitive partial matching
     */
    @IsOptional()
    @ApiPropertyOptional({
        description: 'Search query for name or email',
        example: 'john',
    })
    @IsString()
    search?: string;
}
