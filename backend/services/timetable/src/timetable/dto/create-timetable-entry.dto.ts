import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateTimetableEntryDto {
  @ApiProperty()
  @IsUUID()
  sectionId: string;

  @ApiProperty()
  @IsUUID()
  subjectId: string;

  @ApiProperty()
  @IsUUID()
  teacherUserId: string;

  @ApiProperty()
  @IsUUID()
  periodId: string;

  @ApiProperty({ description: '0=Mon .. 4=Fri' })
  @IsInt()
  @Min(0)
  @Max(4)
  dayOfWeek: number;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;
}
