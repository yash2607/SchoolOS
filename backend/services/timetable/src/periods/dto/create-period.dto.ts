import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CreatePeriodDto {
  @ApiProperty({ example: 'Period 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '09:45' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  periodNumber: number;

  @ApiPropertyOptional({ example: 0, description: '0=Mon..4=Fri, null = applies to all days' })
  @IsInt()
  @Min(0)
  @Max(4)
  @IsOptional()
  dayOfWeek?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isBreak?: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  order: number;
}
