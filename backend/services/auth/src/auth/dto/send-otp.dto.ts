import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+91[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' })
  mobile: string;

  @ApiProperty({ example: 'DEMO01', required: false })
  @IsString()
  @IsOptional()
  schoolCode?: string;
}
