import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class SendNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  data?: Record<string, unknown>;
}
