import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRecordItemDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ enum: ['present', 'absent', 'late', 'on_leave'] })
  @IsIn(['present', 'absent', 'late', 'on_leave'])
  status: 'present' | 'absent' | 'late' | 'on_leave';
}

export class MarkAttendanceDto {
  @ApiProperty()
  @IsUUID()
  sectionId: string;

  @ApiProperty({ example: '2025-06-15' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'null means full-day attendance' })
  @IsInt()
  @IsOptional()
  periodNumber?: number;

  @ApiProperty({ type: [AttendanceRecordItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordItemDto)
  records: AttendanceRecordItemDto[];
}

export class EditAttendanceDto {
  @ApiProperty({ enum: ['present', 'absent', 'late', 'on_leave'] })
  @IsIn(['present', 'absent', 'late', 'on_leave'])
  status: 'present' | 'absent' | 'late' | 'on_leave';

  @ApiProperty({ description: 'Required reason for editing attendance' })
  @IsString()
  @IsNotEmpty()
  editReason: string;
}

export class SubmitLeaveRequestDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: '2025-06-15' })
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2025-06-17' })
  @IsDateString()
  toDate: string;

  @ApiProperty({ example: 'Family function' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ReviewLeaveRequestDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}
