import { IsString, IsOptional, IsBoolean, IsInt, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2025-26' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2025-06-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsString()
  endDate: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateGradeDto {
  @ApiProperty({ example: 'Grade 6' })
  @IsString()
  name: string;

  @ApiProperty({ example: 6 })
  @IsInt()
  @Min(1)
  order: number;
}

export class CreateSectionDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'UUID of class teacher user' })
  @IsString()
  @IsOptional()
  classTeacherId?: string;
}

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'MATH-6' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ enum: ['core', 'elective', 'activity'] })
  @IsIn(['core', 'elective', 'activity'])
  @IsOptional()
  type?: 'core' | 'elective' | 'activity';
}

export class UpdateSchoolDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
