import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+91[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' })
  mobile: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'SchoolOS@123' })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ example: 'DEMO01', required: false })
  @IsString()
  @IsOptional()
  schoolCode?: string;
}
