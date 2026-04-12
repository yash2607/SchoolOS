import { IsString, IsNotEmpty } from 'class-validator';

export class RemoveDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
