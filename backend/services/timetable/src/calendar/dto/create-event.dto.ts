import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Diwali Holiday' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'School closed for Diwali' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-10-20' })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional({ example: '2025-10-21' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['holiday', 'exam', 'event', 'ptm'], default: 'event' })
  @IsIn(['holiday', 'exam', 'event', 'ptm'])
  @IsOptional()
  eventType?: 'holiday' | 'exam' | 'event' | 'ptm';

  @ApiPropertyOptional({ enum: ['school', 'grade', 'section'], default: 'school' })
  @IsIn(['school', 'grade', 'section'])
  @IsOptional()
  targetType?: 'school' | 'grade' | 'section';

  @ApiPropertyOptional({ example: null })
  @IsUUID()
  @IsOptional()
  targetId?: string;
}
