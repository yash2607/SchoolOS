import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@schoolos.app' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'SchoolOS@123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'DEMO01', required: false })
  @IsString()
  @IsOptional()
  schoolCode?: string;
}
