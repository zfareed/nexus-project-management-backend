import { IsArray, IsUUID, ArrayNotEmpty } from 'class-validator';

/**
 * DTO for assigning users to a project
 */
export class AssignUsersDto {
    @IsArray({ message: 'User IDs must be an array' })
    @ArrayNotEmpty({ message: 'At least one user ID must be provided' })
    @IsUUID('4', { each: true, message: 'Each user ID must be a valid UUID' })
    userIds: string[];
}
