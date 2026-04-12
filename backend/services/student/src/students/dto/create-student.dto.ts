import { IsString, IsOptional, IsIn, IsBoolean, IsInt, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGuardianDto {
  @ApiProperty({ example: 'Priya Mehta' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'mother' })
  @IsString()
  @IsOptional()
  relationship?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsString()
  @IsOptional()
  mobileE164?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  canPickup?: boolean;
}

export class CreateStudentDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: '2012-05-15' })
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: ['M', 'F', 'Other'] })
  @IsIn(['M', 'F', 'Other'])
  @IsOptional()
  gender?: 'M' | 'F' | 'Other';

  @ApiProperty({ description: 'Grade UUID' })
  @IsString()
  gradeId: string;

  @ApiProperty({ description: 'Section UUID' })
  @IsString()
  sectionId: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  @IsOptional()
  rollNumber?: number;

  @ApiPropertyOptional({ example: '2025-06-01' })
  @IsString()
  @IsOptional()
  admissionDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({ type: [CreateGuardianDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGuardianDto)
  @IsOptional()
  guardians?: CreateGuardianDto[];
}

export class UpdateStudentDto {
  @IsString() @IsOptional() firstName?: string;
  @IsString() @IsOptional() lastName?: string;
  @IsString() @IsOptional() dateOfBirth?: string;
  @IsIn(['M', 'F', 'Other']) @IsOptional() gender?: 'M' | 'F' | 'Other';
  @IsString() @IsOptional() gradeId?: string;
  @IsString() @IsOptional() sectionId?: string;
  @IsInt() @Min(1) @IsOptional() rollNumber?: number;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() bloodGroup?: string;
  @IsString() @IsOptional() photoUrl?: string;
  @IsBoolean() @IsOptional() iepFlag?: boolean;
  @IsIn(['active', 'transferred', 'withdrawn']) @IsOptional() status?: 'active' | 'transferred' | 'withdrawn';
}

export class LinkGuardianDto {
  @ApiProperty({ description: 'Guardian UUID to link to a user account' })
  @IsString()
  guardianId: string;

  @ApiProperty({ description: 'User UUID from auth service' })
  @IsString()
  userId: string;
}
