import { IsString, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateThreadDto {
  @ApiProperty()
  @IsString()
  teacherUserId: string;

  @ApiProperty()
  @IsString()
  parentUserId: string;

  @ApiProperty()
  @IsString()
  studentId: string;
}

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  threadId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachmentKeys?: string[];
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 30 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
